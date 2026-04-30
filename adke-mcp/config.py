from pydantic_settings import BaseSettings, SettingsConfigDict
from os import path

# Dynamically find the absolute path to the .env file in the same folder as this script
base_dir = path.dirname(path.abspath(__file__))
env_path = path.join(base_dir, ".env")


class Settings(BaseSettings):
    # API Keys
    groq_api_key: str
    pinecone_api_key: str

    # Database
    supabase_url: str
    supabase_key: str

    # Infrastructure
    pinecone_index_name: str = "rag-index"
    llm_model: str = "llama-3.3-70b-versatile"

    model_config = SettingsConfigDict(
        env_file=env_path,
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
