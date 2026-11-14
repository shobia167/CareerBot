from fastapi import APIRouter, Header, HTTPException, Body
from typing import Optional, Dict, Any, List
from server.services.supabase_service import supabase_service

router = APIRouter(prefix="/api/posts", tags=["posts"])

@router.get("")
async def get_private_learning_posts(authorization: Optional[str] = Header(None)):
    """Retrieves authenticated user's strictly private learning activity logs."""
    user = await supabase_service.get_current_user(authorization)
    user_id = user.get("id")

    posts = await supabase_service.query_table(
        "learning_posts",
        authorization,
        {"user_id": f"eq.{user_id}", "order": "created_at.desc"}
    )
    return {"posts": posts}

@router.post("")
async def create_private_learning_post(
    payload: Dict[str, Any] = Body(...),
    authorization: Optional[str] = Header(None)
):
    """Creates a private learning post for the authenticated user."""
    user = await supabase_service.get_current_user(authorization)
    user_id = user.get("id")

    content = payload.get("content", "").strip()
    if not content:
        raise HTTPException(status_code=400, detail="Post content cannot be empty.")

    new_post = {
        "user_id": user_id,
        "content": content,
        "skills_learned": payload.get("skills_learned", []),
        "image_url": payload.get("image_url"),
        "link_url": payload.get("link_url")
    }

    inserted = await supabase_service.insert_record("learning_posts", authorization, new_post)
    return {"success": True, "post": inserted[0] if inserted else new_post}

@router.put("/{post_id}")
async def update_private_learning_post(
    post_id: str,
    payload: Dict[str, Any] = Body(...),
    authorization: Optional[str] = Header(None)
):
    """Edits the authenticated user's private post."""
    user = await supabase_service.get_current_user(authorization)
    user_id = user.get("id")

    update_fields = {}
    if "content" in payload:
        update_fields["content"] = payload["content"].strip()
    if "skills_learned" in payload:
        update_fields["skills_learned"] = payload["skills_learned"]
    if "image_url" in payload:
        update_fields["image_url"] = payload["image_url"]
    if "link_url" in payload:
        update_fields["link_url"] = payload["link_url"]

    updated = await supabase_service.update_record(
        "learning_posts",
        authorization,
        {"id": f"eq.{post_id}", "user_id": f"eq.{user_id}"},
        update_fields
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Post not found or unauthorized.")
    return {"success": True, "post": updated[0]}

@router.delete("/{post_id}")
async def delete_private_learning_post(
    post_id: str,
    authorization: Optional[str] = Header(None)
):
    """Deletes the authenticated user's private post."""
    user = await supabase_service.get_current_user(authorization)
    user_id = user.get("id")

    deleted = await supabase_service.delete_record(
        "learning_posts",
        authorization,
        {"id": f"eq.{post_id}", "user_id": f"eq.{user_id}"}
    )
    return {"success": True, "message": "Post deleted successfully."}
