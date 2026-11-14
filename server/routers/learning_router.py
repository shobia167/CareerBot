from fastapi import APIRouter, Header, HTTPException, Body
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
from server.services.supabase_service import supabase_service
from server.services.learning_recommendation_agent import learning_recommendation_agent

router = APIRouter(prefix="/api/learning", tags=["learning"])

@router.post("/generate-roadmap")
async def generate_user_roadmap(
    payload: Dict[str, Any] = Body(default={}),
    authorization: Optional[str] = Header(None)
):
    """Invokes Agent 4 to create a structured personalized roadmap and saves activities to Supabase."""
    user = await supabase_service.get_current_user(authorization)
    user_id = user.get("id")

    profiles = await supabase_service.query_table("profiles", authorization, {"id": f"eq.{user_id}"})
    profile = profiles[0] if profiles else {}
    target_career = payload.get("target_career") or profile.get("target_career") or "Software Development"

    # Fetch latest skill gaps
    gap_records = await supabase_service.query_table(
        "skill_analyses",
        authorization,
        {"user_id": f"eq.{user_id}", "order": "created_at.desc", "limit": "1"}
    )
    missing_skills = gap_records[0].get("missing_skills", []) if gap_records else []
    existing_skills = gap_records[0].get("existing_skills", []) if gap_records else []

    # Generate roadmap via Agent 4
    roadmap_data = await learning_recommendation_agent.generate_roadmap(
        target_career, missing_skills, existing_skills
    )

    activities = roadmap_data.get("activities", [])

    # Mark existing active roadmaps as inactive
    await supabase_service.update_record(
        "learning_roadmaps",
        authorization,
        {"user_id": f"eq.{user_id}", "is_active": "eq.true"},
        {"is_active": False}
    )

    # Insert new roadmap
    new_roadmap = {
        "user_id": user_id,
        "target_career": target_career,
        "title": roadmap_data.get("roadmap_title", f"Mastery Roadmap: {target_career}"),
        "description": roadmap_data.get("roadmap_description", ""),
        "total_activities": len(activities),
        "completed_activities": 0,
        "progress_percentage": 0,
        "is_active": True
    }
    inserted_roadmap = await supabase_service.insert_record("learning_roadmaps", authorization, new_roadmap)
    roadmap_id = inserted_roadmap[0]["id"] if inserted_roadmap else None

    # Insert activities
    created_activities = []
    if roadmap_id:
        for act in activities:
            act_record = {
                "roadmap_id": roadmap_id,
                "user_id": user_id,
                "skill_name": act.get("skill_name"),
                "learning_objective": act.get("learning_objective"),
                "resource_title": act.get("resource_title"),
                "resource_url": act.get("resource_url"),
                "difficulty_level": act.get("difficulty_level", "Intermediate"),
                "estimated_duration": act.get("estimated_duration", "4 hours"),
                "practical_task": act.get("practical_task"),
                "sequence_order": act.get("sequence_order", 1),
                "is_completed": False
            }
            res = await supabase_service.insert_record("learning_activities", authorization, act_record)
            if res:
                created_activities.append(res[0])

    return {
        "success": True,
        "roadmap": inserted_roadmap[0] if inserted_roadmap else new_roadmap,
        "activities": created_activities
    }

@router.get("/active-roadmap")
async def get_active_roadmap(authorization: Optional[str] = Header(None)):
    """Fetches the user's active roadmap and ordered activities."""
    user = await supabase_service.get_current_user(authorization)
    user_id = user.get("id")

    roadmaps = await supabase_service.query_table(
        "learning_roadmaps",
        authorization,
        {"user_id": f"eq.{user_id}", "is_active": "eq.true", "order": "created_at.desc", "limit": "1"}
    )
    if not roadmaps:
        return {"roadmap": None, "activities": []}

    roadmap = roadmaps[0]
    activities = await supabase_service.query_table(
        "learning_activities",
        authorization,
        {"roadmap_id": f"eq.{roadmap['id']}", "order": "sequence_order.asc"}
    )

    return {"roadmap": roadmap, "activities": activities}

@router.patch("/activity/{activity_id}/toggle")
async def toggle_activity_completion(
    activity_id: str,
    payload: Dict[str, Any] = Body(...),
    authorization: Optional[str] = Header(None)
):
    """Marks a learning activity completed or pending, and updates actual database metrics."""
    user = await supabase_service.get_current_user(authorization)
    user_id = user.get("id")
    is_completed = payload.get("is_completed", True)

    completed_at = datetime.now(timezone.utc).isoformat() if is_completed else None

    # Update activity
    updated_act = await supabase_service.update_record(
        "learning_activities",
        authorization,
        {"id": f"eq.{activity_id}", "user_id": f"eq.{user_id}"},
        {"is_completed": is_completed, "completed_at": completed_at}
    )

    if not updated_act:
        raise HTTPException(status_code=404, detail="Activity not found")

    roadmap_id = updated_act[0]["roadmap_id"]

    # Re-calculate actual activity records from database
    all_acts = await supabase_service.query_table(
        "learning_activities",
        authorization,
        {"roadmap_id": f"eq.{roadmap_id}"}
    )
    total = len(all_acts)
    completed_count = sum(1 for a in all_acts if a.get("is_completed"))
    pct = round((completed_count / max(total, 1)) * 100, 1)

    # Update roadmap progress
    await supabase_service.update_record(
        "learning_roadmaps",
        authorization,
        {"id": f"eq.{roadmap_id}"},
        {
            "total_activities": total,
            "completed_activities": completed_count,
            "progress_percentage": pct
        }
    )

    return {
        "success": True,
        "activity": updated_act[0],
        "progress": {
            "total_activities": total,
            "completed_activities": completed_count,
            "progress_percentage": pct
        }
    }
