from fastapi import Request
from supabase import AsyncClient
from db import SupabaseService


async def get_db(request: Request) -> AsyncClient:
    """
    Dependency that provides the Supabase client from the app state.
    """

    if not hasattr(request.app.state, "supabase"):
        request.app.state.supabase = await SupabaseService.get_client()

    return request.app.state.supabase
