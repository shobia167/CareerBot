from fastapi import APIRouter, Header, HTTPException, Body
from typing import Optional, Dict, Any, List
from server.services.supabase_service import supabase_service
from server.services.gemini_tutor_service import gemini_tutor_service

router = APIRouter(prefix="/api/tutor", tags=["tutor"])

@router.post("/chat")
async def chat_with_tutor(
    payload: Dict[str, Any] = Body(...),
    authorization: Optional[str] = Header(None)
):
    """Conversational endpoint with user-aware memory powered by Gemini."""
    user = await supabase_service.get_current_user(authorization)
    user_id = user.get("id")
    message = payload.get("message", "").strip()

    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    # 1. Fetch authenticated user data in parallel
    profiles = await supabase_service.query_table("profiles", authorization, {"id": f"eq.{user_id}"})
    profile = profiles[0] if profiles else {}

    skills = await supabase_service.query_table("user_skills", authorization, {"user_id": f"eq.{user_id}"})
    resumes = await supabase_service.query_table(
        "resume_analyses",
        authorization,
        {"user_id": f"eq.{user_id}", "order": "created_at.desc", "limit": "1"}
    )
    gaps = await supabase_service.query_table(
        "skill_analyses",
        authorization,
        {"user_id": f"eq.{user_id}", "order": "created_at.desc", "limit": "1"}
    )
    matches = await supabase_service.query_table(
        "career_matches",
        authorization,
        {"user_id": f"eq.{user_id}", "order": "created_at.desc", "limit": "1"}
    )
    roadmaps = await supabase_service.query_table(
        "learning_roadmaps",
        authorization,
        {"user_id": f"eq.{user_id}", "is_active": "eq.true", "order": "created_at.desc", "limit": "1"}
    )
    active_roadmap = roadmaps[0] if roadmaps else {}
    activities = []
    if active_roadmap:
        activities = await supabase_service.query_table(
            "learning_activities",
            authorization,
            {"roadmap_id": f"eq.{active_roadmap['id']}"}
        )

    attempts = await supabase_service.query_table(
        "assessment_attempts",
        authorization,
        {"user_id": f"eq.{user_id}", "order": "completed_at.desc", "limit": "5"}
    )
    posts = await supabase_service.query_table(
        "learning_posts",
        authorization,
        {"user_id": f"eq.{user_id}", "order": "created_at.desc", "limit": "3"}
    )

    user_context_bundle = {
        "profile": profile,
        "skills": skills,
        "resume_analysis": resumes[0] if resumes else {},
        "skill_gap": gaps[0] if gaps else {},
        "career_match": matches[0] if matches else {},
        "roadmap": active_roadmap,
        "activities": activities,
        "assessments": attempts,
        "learning_posts": posts
    }

    # 2. Get or create primary AI conversation
    convos = await supabase_service.query_table(
        "ai_conversations",
        authorization,
        {"user_id": f"eq.{user_id}", "order": "updated_at.desc", "limit": "1"}
    )
    if convos:
        conversation_id = convos[0]["id"]
    else:
        new_convo = await supabase_service.insert_record(
            "ai_conversations",
            authorization,
            {"user_id": user_id, "title": "Career Mentorship Session"}
        )
        conversation_id = new_convo[0]["id"] if new_convo else None

    # Fetch recent message history
    history = []
    if conversation_id:
        history_msgs = await supabase_service.query_table(
            "ai_messages",
            authorization,
            {"conversation_id": f"eq.{conversation_id}", "order": "created_at.asc", "limit": "10"}
        )
        history = [{"role": m["role"], "content": m["content"]} for m in history_msgs]

        # Save user message
        await supabase_service.insert_record(
            "ai_messages",
            authorization,
            {"conversation_id": conversation_id, "user_id": user_id, "role": "user", "content": message}
        )

    # 3. Call Gemini Tutor Service
    ai_response = await gemini_tutor_service.chat(message, user_context_bundle, history)

    # Save assistant response
    if conversation_id:
        await supabase_service.insert_record(
            "ai_messages",
            authorization,
            {
                "conversation_id": conversation_id,
                "user_id": user_id,
                "role": "assistant",
                "content": ai_response.get("content", ""),
                "metadata": {"model": ai_response.get("model")}
            }
        )

    return {
        "success": True,
        "response": ai_response.get("content"),
        "conversation_id": conversation_id
    }

@router.get("/history")
async def get_tutor_history(authorization: Optional[str] = Header(None)):
    """Retrieves conversation history with CareerBot Tutor."""
    user = await supabase_service.get_current_user(authorization)
    user_id = user.get("id")

    convos = await supabase_service.query_table(
        "ai_conversations",
        authorization,
        {"user_id": f"eq.{user_id}", "order": "updated_at.desc", "limit": "1"}
    )
    if not convos:
        return {"messages": []}

    conversation_id = convos[0]["id"]
    messages = await supabase_service.query_table(
        "ai_messages",
        authorization,
        {"conversation_id": f"eq.{conversation_id}", "order": "created_at.asc", "limit": "50"}
    )
    return {"conversation_id": conversation_id, "messages": messages}

@router.delete("/history")
async def clear_tutor_history(authorization: Optional[str] = Header(None)):
    """Clears the AI chat conversation for the user."""
    user = await supabase_service.get_current_user(authorization)
    user_id = user.get("id")

    await supabase_service.delete_record("ai_messages", authorization, {"user_id": f"eq.{user_id}"})
    await supabase_service.delete_record("ai_conversations", authorization, {"user_id": f"eq.{user_id}"})

    return {"success": True, "message": "Conversation history cleared."}
