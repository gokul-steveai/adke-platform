import logging
from typing import Optional
from supabase import create_async_client, AsyncClient
from config import settings
import asyncio

# Configure logging to track connection issues
logger = logging.getLogger(__name__)

class SupabaseService:
    """
    A Singleton service manager for the Supabase AsyncClient.
    Follows the 'Resource Acquisition Is Initialization' (RAII) pattern.
    """
    _instance: Optional[AsyncClient] = None

    @classmethod
    async def get_client(cls) -> AsyncClient:
        """
        Returns a singleton instance of the AsyncClient.
        Initializes the client if it doesn't already exist.
        """
        if cls._instance is None:
            try:
                cls._instance = await create_async_client(
                    settings.supabase_url, 
                    settings.supabase_key
                )
                logger.info("Supabase AsyncClient initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {e}")
                raise
        return cls._instance

    @classmethod
    async def close(cls):
        """Cleanly closes the client session."""
        if cls._instance:
            # Note: Depending on the supabase-py version, 
            # you might need to close the underlying httpx client
            cls._instance = None
            logger.info("Supabase connection cleared.")