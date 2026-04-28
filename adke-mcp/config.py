from pydantic_settings import BaseSettings, SettingsConfigDict

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

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()