// lib/api.ts
export async function sendChatMessage(message: string) {
  const response = await fetch(`http://localhost:8000/chat`, {
    method: "POST",
    body: JSON.stringify({ message }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("Failed to fetch AI response");
  return response.json();
}
