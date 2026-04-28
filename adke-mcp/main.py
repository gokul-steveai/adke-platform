from contextlib import asynccontextmanager
import os
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langchain_classic.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain_classic.agents import AgentExecutor, create_tool_calling_agent
from langchain_classic import hub
from pydantic import BaseModel
from supabase import AsyncClient
from db import SupabaseService
from dependencies import get_db

from config import settings
from services.mcp_service import MCPService


# Initialize the MCP client
CONFIG = {
    "ops_server": {
        "transport": "stdio",
        "command": "python3",
        "args": [os.path.join(os.path.dirname(__file__), "ops_server.py")],
    }
}

mcp_service = MCPService(CONFIG)


@asynccontextmanager
async def lifespan(app: FastAPI):

    await mcp_service.initialize()
    app.state.supabase = await SupabaseService.get_client()
    yield
    await SupabaseService.close()


app = FastAPI(title="ADKE Host Gateway", lifespan=lifespan)

# Define the origins allowed to access your API
origins = [
    "http://localhost:5173",  # React Vite default port
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers (Content-Type, Authorization, etc.)
)


class ChatRequest(BaseModel):
    message: str


@app.post("/chat")
async def chat(
    chat_request: ChatRequest, supabase_client: AsyncClient = Depends(get_db)
):
    llm = ChatGroq(
        api_key=settings.groq_api_key, model=settings.llm_model, temperature=0.7
    )

    # Get tools from MCP service
    tools = mcp_service.get_tools()

    # Get prompt from LangSmith Hub
    base_prompt = hub.pull("hwchase17/openai-functions-agent")

    instructions = (
        "You are a Senior DevOps Assistant. You have TWO primary responsibilities:\n"
        "1. SYSTEM DATA: Use 'execute_safe_command' to get real-time memory/disk info.\n"
        "2. CONTEXT: Use 'search_ops_knowledge' whenever the user mentions 'normal limits', "
        "'knowledge base', or 'past incidents'.\n\n"
        "When asked if metrics are 'normal', you MUST first check the system data AND "
        "then search the knowledge base to compare. Do not provide general guidelines."
    )

    # 3. Re-construct the prompt to include your instructions (KISS approach)
    # We prepend the system message to the existing hub prompt messages
    prompt = ChatPromptTemplate.from_messages(
        [("system", instructions), *base_prompt.messages]
    )

    # Create an agent that can call the tools and execute the prompt
    agent = create_tool_calling_agent(llm, tools, prompt)
    executor = AgentExecutor(
        agent=agent, tools=tools, verbose=True, return_intermediate_steps=True
    )
    response = await executor.ainvoke({"input": chat_request.message})

    if response is None:  # Handle the case where the agent fails to produce a response
        response = "Sorry, I couldn't process your request at the moment."
    else:
        db_response = (
            await supabase_client.table("incident_logs")
            .insert(
                {
                    "action_type": "CLI_EXECUTION",
                    "status": "SUCCESS",
                    "details": {"output": response["output"], "memory_used": "8.5GB"},
                    "project_context": "ADKE_VPS_MONITOR",
                }
            )
            .execute()
        )

        # Check if the agent decided to call a tool instead of giving a final answer
        if response.get("intermediate_steps"):
            # This is where the magic happens:
            # [0] is the first step, [0] inside that is the AgentAction
            action = response["intermediate_steps"][0][0]

            if action.tool == "execute_safe_command":
                # Extract the command string safely
                pending_cmd = action.tool_input
                if isinstance(pending_cmd, dict):
                    pending_cmd = pending_cmd.get("command", str(pending_cmd))

                # Save to Supabase with state='pending'
                db_response = (
                    await supabase_client.table("incident_logs")
                    .insert(
                        {
                            "action_type": "CLI_EXECUTION",
                            "state": "pending",  # Set initial state
                            "command_text": pending_cmd,  # Use the new column we created
                            "details": {"reasoning": action.log},
                            "project_context": "ADKE_VPS_MONITOR",
                        }
                    )
                    .execute()
                )

                return {
                    "answer": "I've prepared the command. Please approve it.",
                    "requires_approval": True,
                    "pending_command": pending_cmd,
                    "action_id": db_response.data[0]["id"],
                }
    return {"answer": response["output"], "requires_approval": False}


@app.post("/chat/approve")
async def approve_action(
    action_id: str, supabase_client: AsyncClient = Depends(get_db)
):
    result = (
        await supabase_client.table("incident_logs")
        .select("command_text")
        .eq("id", action_id)
        .single()
        .execute()
    )

    if not result.data:
        return {"error": "Action not found"}, 404

    command = result.data["command_text"]

    try:
        # 2. Update status to 'approved'
        await supabase_client.table("incident_logs").update({"state": "approved"}).eq(
            "id", action_id
        ).execute()

        # 3. ACTUALLY execute the MCP tool now

        execution_result = await mcp_service.call_tool(
            "execute_safe_command", {"command": command}
        )

        # Final update with results
        await supabase_client.table("incident_logs").update(
            {"state": "executed", "details": {"output": execution_result}}
        ).eq("id", action_id).execute()

        return {"status": "success", "output": execution_result}

    except Exception as e:
        await supabase_client.table("incident_logs").update({"state": "failed"}).eq(
            "id", action_id
        ).execute()
        return {"status": "error", "message": str(e)}


@app.post("/chat/reject")
async def reject_action(
    action_request: dict, supabase_client: AsyncClient = Depends(get_db)
):
    action_id = action_request.get("action_id")

    # Update state to 'rejected' so it doesn't stay 'pending' forever
    response = (
        await supabase_client.table("incident_logs")
        .update({"state": "rejected"})
        .eq("id", action_id)
        .execute()
    )

    if not response.data:
        return {"error": "Action not found"}, 404

    return {"status": "cancelled"}
