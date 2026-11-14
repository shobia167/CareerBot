from fastapi import APIRouter, Header, HTTPException, Depends
from typing import Dict, Any, Optional
from server.services.supabase_service import supabase_service

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.get("/me")
async def get_current_user_profile(authorization: Optional[str] = Header(None)):
    """Verifies JWT and returns the authenticated user's profile from Supabase."""
    user = await supabase_service.get_current_user(authorization)
    user_id = user.get("id")

    # Fetch profile record
    profiles = await supabase_service.query_table("profiles", authorization, {"id": f"eq.{user_id}"})
    if profiles:
        profile = profiles[0]
    else:
        # If not created by trigger yet, insert profile
        new_prof = {
            "id": user_id,
            "email": user.get("email"),
            "full_name": user.get("user_metadata", {}).get("full_name", "")
        }
        res = await supabase_service.insert_record("profiles", authorization, new_prof)
        profile = res[0] if res else new_prof

    return {"user": user, "profile": profile}

@router.put("/profile")
async def update_profile(profile_data: Dict[str, Any], authorization: Optional[str] = Header(None)):
    """Updates user profile information."""
    user = await supabase_service.get_current_user(authorization)
    user_id = user.get("id")

    # Clean update payload
    updatable_fields = [
        "full_name", "education", "college_organization", "current_qualification",
        "bio", "areas_of_interest", "avatar_url", "target_career"
    ]
    payload = {k: v for k, v in profile_data.items() if k in updatable_fields}

    updated = await supabase_service.update_record("profiles", authorization, {"id": f"eq.{user_id}"}, payload)
    return {"success": True, "profile": updated[0] if updated else payload}
