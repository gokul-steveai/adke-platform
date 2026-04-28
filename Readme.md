# ADKE - Autonomous DevOps Knowledge Engine

ADKE is an AI-powered control plane for managing Ubuntu infrastructure. It leverages a FastAPI gateway, React frontend, and MCP (Model Context Protocol) to execute safe system commands with human-in-the-loop approval.

## 🚀 Project Structure
- **/adke-mcp**: FastAPI server, LangChain Agent, and MCP integration.
- **/frontend**: React + Vite dashboard with Recharts and Supabase Realtime.

## 🛠️ Getting Started

### 1. Backend Setup
```bash
cd adke-mcp
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Ensure your .env contains GROQ_API_KEY and SUPABASE_URL
python3 main.py