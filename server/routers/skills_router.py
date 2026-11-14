from fastapi import APIRouter, Header, HTTPException, Body
from typing import Optional, Dict, Any, List
from server.services.supabase_service import supabase_service

router = APIRouter(prefix="/api/profile-data", tags=["profile-data"])

# SKILLS
@router.get("/skills")
async def get_skills(authorization: Optional[str] = Header(None)):
    user = await supabase_service.get_current_user(authorization)
    skills = await supabase_service.query_table("user_skills", authorization, {"user_id": f"eq.{user['id']}"})
    return {"skills": skills}

@router.post("/skills")
async def add_skill(payload: Dict[str, Any] = Body(...), authorization: Optional[str] = Header(None)):
    user = await supabase_service.get_current_user(authorization)
    skill_name = payload.get("skill_name", "").strip()
    if not skill_name:
        raise HTTPException(status_code=400, detail="Skill name is required")
    record = {
        "user_id": user["id"],
        "skill_name": skill_name,
        "proficiency": payload.get("proficiency", "Intermediate"),
        "verified": payload.get("verified", False)
    }
    res = await supabase_service.insert_record("user_skills", authorization, record)
    return {"success": True, "skill": res[0] if res else record}

@router.delete("/skills/{skill_id}")
async def delete_skill(skill_id: str, authorization: Optional[str] = Header(None)):
    user = await supabase_service.get_current_user(authorization)
    await supabase_service.delete_record("user_skills", authorization, {"id": f"eq.{skill_id}", "user_id": f"eq.{user['id']}"})
    return {"success": True}

# CERTIFICATIONS
@router.get("/certifications")
async def get_certifications(authorization: Optional[str] = Header(None)):
    user = await supabase_service.get_current_user(authorization)
    certs = await supabase_service.query_table("certifications", authorization, {"user_id": f"eq.{user['id']}"})
    return {"certifications": certs}

@router.post("/certifications")
async def add_certification(payload: Dict[str, Any] = Body(...), authorization: Optional[str] = Header(None)):
    user = await supabase_service.get_current_user(authorization)
    name = payload.get("name", "").strip()
    issuing_org = payload.get("issuing_organization", "").strip()
    if not name or not issuing_org:
        raise HTTPException(status_code=400, detail="Name and issuing organization are required")
    record = {
        "user_id": user["id"],
        "name": name,
        "issuing_organization": issuing_org,
        "completion_date": payload.get("completion_date"),
        "credential_url": payload.get("credential_url")
    }
    res = await supabase_service.insert_record("certifications", authorization, record)
    return {"success": True, "certification": res[0] if res else record}

@router.delete("/certifications/{cert_id}")
async def delete_certification(cert_id: str, authorization: Optional[str] = Header(None)):
    user = await supabase_service.get_current_user(authorization)
    await supabase_service.delete_record("certifications", authorization, {"id": f"eq.{cert_id}", "user_id": f"eq.{user['id']}"})
    return {"success": True}

# PROJECTS
@router.get("/projects")
async def get_projects(authorization: Optional[str] = Header(None)):
    user = await supabase_service.get_current_user(authorization)
    projects = await supabase_service.query_table("projects", authorization, {"user_id": f"eq.{user['id']}"})
    return {"projects": projects}

@router.post("/projects")
async def add_project(payload: Dict[str, Any] = Body(...), authorization: Optional[str] = Header(None)):
    user = await supabase_service.get_current_user(authorization)
    title = payload.get("title", "").strip()
    if not title:
        raise HTTPException(status_code=400, detail="Project title is required")
    record = {
        "user_id": user["id"],
        "title": title,
        "description": payload.get("description", ""),
        "technologies": payload.get("technologies", []),
        "project_url": payload.get("project_url"),
        "github_url": payload.get("github_url"),
        "status": payload.get("status", "Completed")
    }
    res = await supabase_service.insert_record("projects", authorization, record)
    return {"success": True, "project": res[0] if res else record}

@router.delete("/projects/{project_id}")
async def delete_project(project_id: str, authorization: Optional[str] = Header(None)):
    user = await supabase_service.get_current_user(authorization)
    await supabase_service.delete_record("projects", authorization, {"id": f"eq.{project_id}", "user_id": f"eq.{user['id']}"})
    return {"success": True}
