import React, { useState } from "react";
import { sendChatMessage } from "../lib/api";
import { extractMetrics } from "../lib";

type ChatInterfaceProps = {
  onMetricsUpdate: React.Dispatch<
    React.SetStateAction<{
      used: number;
      total: number;
    }>
  >; // Function to update metrics in parent component
};

type AIMessage = {
  content: string;
  requires_approval?: boolean;
  pending_command?: string;
  action_id?: string;
};

export default function ChatInterface({ onMetricsUpdate }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    [],
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<AIMessage | null>(null);

  const handleSend = async () => {
    if (!input) return;
    setLoading(true);
    const newMsg = { role: "user", content: input };
    setMessages([...messages, newMsg]);

    try {
      const data = await sendChatMessage(input);

      if (data?.requires_approval) {
        setMessage({
          content: `Pending Action: ${data.response.pending_command}`,
          requires_approval: true,
          pending_command: data.response.pending_command,
          action_id: data.response.action_id,
        });

        // If requires approval, add pending message
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Pending Action: ${data.pending_command}`,
          },
        ]);
        setMessage(data.answer);
        return;
      }

      const answer = data?.answer || "Sorry, I didn't get a response.";

      // Add response to messages
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);

      // Professional Parsing: Look for memory numbers to update the UI
      const { used, total } = extractMetrics(answer);
      if (used && total) {
        onMetricsUpdate((prev) => ({
          ...prev,
          used,
          total,
        }));
      } else {
        console.warn("No metrics found in AI response.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const handleUserAction = async (
    actionId: string,
    choice: "approve" | "cancel",
  ) => {
    setLoading(true);

    try {
      // If user cancels, we just tell the backend to mark it as rejected
      const endpoint = choice === "approve" ? "/chat/approve" : "/chat/reject";

      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action_id: actionId }),
      });

      const result = await response.json();

      if (choice === "approve") {
        addMessageToChat({
          role: "assistant",
          content: `🚀 **Execution Result:** \n\`\`\`\n${result.output}\n\`\`\``,
        });
      } else {
        addMessageToChat({
          role: "assistant",
          content: "❌ Action cancelled. No changes were made to the system.",
        });
      }
    } catch (error) {
      console.error("Workflow error:", error);
    } finally {
      setLoading(false);
    }
  };

  const addMessageToChat = (message: { role: string; content: string }) =>
    setMessages((prev) => [...prev, message]);

  return (
    <div className="flex flex-col h-175 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-4 bg-gray-800 border-b border-gray-700 text-xs font-bold text-gray-400">
        AI DEVOPS AGENT
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <pre
            key={i}
            className={`p-3 rounded-lg text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-blue-600 ml-8" : "bg-gray-800 mr-8 border border-gray-700"}`}
          >
            {m.content}
          </pre>
        ))}

        {/* Pending Action */}
        {message?.requires_approval && (
          <div className="mt-4 p-4 bg-slate-800 border border-amber-500 rounded-lg">
            <p className="text-sm text-amber-500 font-mono mb-2">
              Pending Action: {message.pending_command}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleUserAction(message.action_id, "approve")}
                className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-sm font-bold"
              >
                Approve & Execute
              </button>
              <button
                className="text-slate-400 hover:text-white text-sm"
                onClick={() => handleUserAction(message.action_id, "cancel")}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {loading && (
          <div className="text-gray-500 text-xs animate-pulse">
            Agent is thinking...
          </div>
        )}
      </div>
      <div className="p-4 border-t border-gray-800 flex gap-2">
        <input
          className="flex-1 bg-black border border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Command the agent..."
        />
      </div>
    </div>
  );
}
