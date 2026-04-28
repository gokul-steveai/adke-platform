from langchain_core.tools import BaseTool
from langchain_mcp_adapters.client import MultiServerMCPClient
import logging

logger = logging.getLogger(__name__)


class MCPService:
    def __init__(self, server_config: dict):
        """
        Initialize the MCPService with server configuration.

        Args:
            server_config (dict): Configuration for connecting to the MCP servers.
        """
        self.client = MultiServerMCPClient(server_config)
        self.tools: list[BaseTool] = []

    async def initialize(self):
        """Initializes the MCP client and retrieves available tools."""
        await self.client.get_tools()

    def get_tools(self) -> list[BaseTool]:
        """Returns the list of tools available from the MCP client."""
        return self.tools

    async def call_tool(self, tool_name: str, tool_input: dict) -> dict:
        filtered_tools = [tool for tool in self.tools if tool.name == tool_name]

        # Check if the tool was found
        if not filtered_tools:
            logger.warning(f"Tool '{tool_name}' not found in MCPService.")
            raise ValueError(f"Tool '{tool_name}' not found in MCPService.")
        tool = filtered_tools[0]
        logger.info(f"Calling tool: {tool_name} with input: {tool_input}")
        return await tool.ainvoke(tool_input)

    async def close(self):
        if self.client:
            self.client = None
            logger.info("MCP client closed.")
