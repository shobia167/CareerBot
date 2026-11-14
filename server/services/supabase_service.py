import httpx
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, status
from server.config import settings

class SupabaseService:
    def __init__(self):
        self.url = settings.supabase_url.rstrip("/")
        self.anon_key = settings.supabase_anon_key

    def get_auth_headers(self, jwt_token: Optional[str] = None) -> Dict[str, str]:
        headers = {
            "apikey": self.anon_key,
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        if jwt_token:
            clean_token = jwt_token.replace("Bearer ", "").strip()
            headers["Authorization"] = f"Bearer {clean_token}"
        else:
            headers["Authorization"] = f"Bearer {self.anon_key}"
        return headers

    print("SUPABASE URL:", self.url)
    print("SUPABASE ANON KEY PRESENT:", bool(self.anon_key))
    print("AUTH ENDPOINT:", user_url)

    async def get_current_user(self, authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
        """Validates the JWT token with Supabase Auth and returns the user object."""
        if not authorization:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing authorization header"
            )
        token = authorization.replace("Bearer ", "").strip()
        user_url = f"{self.url}/auth/v1/user"
        headers = {
            "apikey": self.anon_key,
            "Authorization": f"Bearer {token}"
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(user_url, headers=headers)
            if resp.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Invalid or expired session: {resp.text}"
                )
            return resp.json()

    async def query_table(
        self,
        table: str,
        jwt_token: str,
        params: Optional[Dict[str, Any]] = None
    ) -> list:
        endpoint = f"{self.url}/rest/v1/{table}"
        headers = self.get_auth_headers(jwt_token)
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(endpoint, headers=headers, params=params or {})
            if resp.status_code >= 400:
                raise HTTPException(status_code=resp.status_code, detail=resp.text)
            return resp.json()

    async def insert_record(
        self,
        table: str,
        jwt_token: str,
        record: Dict[str, Any]
    ) -> list:
        endpoint = f"{self.url}/rest/v1/{table}"
        headers = self.get_auth_headers(jwt_token)
        headers["Prefer"] = "return=representation"
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(endpoint, headers=headers, json=record)
            if resp.status_code >= 400:
                raise HTTPException(status_code=resp.status_code, detail=resp.text)
            return resp.json()

    async def update_record(
        self,
        table: str,
        jwt_token: str,
        match_params: Dict[str, Any],
        update_data: Dict[str, Any]
    ) -> list:
        endpoint = f"{self.url}/rest/v1/{table}"
        headers = self.get_auth_headers(jwt_token)
        headers["Prefer"] = "return=representation"
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.patch(endpoint, headers=headers, params=match_params, json=update_data)
            if resp.status_code >= 400:
                raise HTTPException(status_code=resp.status_code, detail=resp.text)
            return resp.json()

    async def delete_record(
        self,
        table: str,
        jwt_token: str,
        match_params: Dict[str, Any]
    ) -> list:
        endpoint = f"{self.url}/rest/v1/{table}"
        headers = self.get_auth_headers(jwt_token)
        headers["Prefer"] = "return=representation"
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.delete(endpoint, headers=headers, params=match_params)
            if resp.status_code >= 400:
                raise HTTPException(status_code=resp.status_code, detail=resp.text)
            return resp.json()

supabase_service = SupabaseService()
