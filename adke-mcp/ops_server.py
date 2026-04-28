import subprocess
from fastmcp import FastMCP
from pinecone import Pinecone
from config import settings


# Initilize FastMCP and Pinecone
mcp = FastMCP(
    name="Ubuntu Devops Knowledge",
    version="1.0.0",
)

pinecone = Pinecone(api_key=settings.pinecone_api_key)

if not pinecone.has_index(settings.pinecone_index_name):
    pinecone.create_index_for_model(
        name=settings.pinecone_index_name,
        cloud="aws",
        region="us-east-1",
        dimension=384,
        metric="cosine",
    )


@mcp.tool()
def check_disk_usage() -> str:
    """Check disk usage on the server."""
    result = subprocess.run(["df", "-h"], capture_output=True, text=True)
    return result.stdout


@mcp.tool()
def search_ops_knowledge(query: str) -> str:
    """Search past DevOps knowledge from Pinecone."""

    return f"Retrieved context for '{query}': Truncate /var/log/syslog if > 10GB."


@mcp.tool()
def clear_syslog() -> str:
    """Clear the syslog file."""
    try:
        subprocess.run(["sudo", "truncate", "-s", "0", "/var/log/syslog"], check=True)
        return "Successfully cleared /var/log/syslog."
    except subprocess.CalledProcessError as e:
        return f"Failed to clear /var/log/syslog: {e}. Make sure you have the necessary permissions."


if __name__ == "__main__":
    mcp.run(transport="stdio")
