from fastapi import APIRouter, Header, HTTPException, Body
from typing import Optional, Dict, Any, List
from server.services.supabase_service import supabase_service
from server.services.skill_gap_agent import skill_gap_agent
from server.services.career_matching_agent import career_matching_agent
from server.services.nemotron_client import nemotron_client

router = APIRouter(prefix="/api/career", tags=["career"])

@router.post("/suggest")
async def suggest_careers(authorization: Optional[str] = Header(None)):
    """Nemotron analyzes the user's profile, resume, skills, and projects to suggest optimal career paths."""
    user = await supabase_service.get_current_user(authorization)
    user_id = user.get("id")

    profiles = await supabase_service.query_table("profiles", authorization, {"id": f"eq.{user_id}"})
    profile = profiles[0] if profiles else {}
    skills = await supabase_service.query_table("user_skills", authorization, {"user_id": f"eq.{user_id}"})
    projects = await supabase_service.query_table("projects", authorization, {"user_id": f"eq.{user_id}"})
    certs = await supabase_service.query_table("certifications", authorization, {"user_id": f"eq.{user_id}"})
    resumes = await supabase_service.query_table("resume_analyses", authorization, {"user_id": f"eq.{user_id}", "order": "created_at.desc", "limit": "1"})
    resume = resumes[0] if resumes else {}

    skills_str = ", ".join([s.get("skill_name", "") for s in skills]) or "General Programming"
    projects_str = ", ".join([p.get("title", "") for p in projects]) or "None"
    certs_str = ", ".join([c.get("name", "") for c in certs]) or "None"
    interests_str = ", ".join(profile.get("areas_of_interest", [])) or "Software, AI, Data"

    system_prompt = "You are an elite career discovery advisor for CareerBot AI, powered by NVIDIA Nemotron."
    user_prompt = f"""Suggest 3 highly suitable career paths for this learner:
Education: {profile.get('education', 'Computer Science / Engineering')}
Interests: {interests_str}
Skills: {skills_str}
Projects: {projects_str}
Certifications: {certs_str}
Extracted Resume Skills: {', '.join(resume.get('extracted_skills', []))}

Return ONLY a JSON array of 3 suggestions in this exact schema:
[
  {{
    "title": "AI Engineer",
    "compatibility_score": 88,
    "why_suitable": "Your Python proficiency and project experience match core AI engineering criteria.",
    "key_required_skills": ["Python", "PyTorch", "FastAPI", "Vector Databases", "Docker"],
    "market_demand": "High"
  }},
  {{
    "title": "Full Stack Developer",
    "compatibility_score": 82,
    "why_suitable": "Strong foundation in modern software engineering with rapid potential for full stack mastery.",
    "key_required_skills": ["React", "TypeScript", "Node.js / FastAPI", "PostgreSQL", "Docker"],
    "market_demand": "Very High"
  }},
  {{
    "title": "Data Analyst",
    "compatibility_score": 79,
    "why_suitable": "Solid analytical skills and structured data understanding.",
    "key_required_skills": ["SQL", "Python", "Power BI", "Exploratory Data Analysis"],
    "market_demand": "High"
  }}
]
"""
    try:
        raw_res = await nemotron_client.chat_completion(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=1500
        )
        suggestions = nemotron_client.extract_json(raw_res)
        if isinstance(suggestions, list) and len(suggestions) > 0:
            return {"suggestions": suggestions}
    except Exception:
        pass

    # Heuristic career suggestions fallback
    return {
        "suggestions": [
            {
                "title": "AI Engineer",
                "compatibility_score": 88,
                "why_suitable": "Your technical background and programming experience align directly with high-demand generative AI and machine learning engineering.",
                "key_required_skills": ["Python", "Transformers", "FastAPI", "Vector DBs", "Docker"],
                "market_demand": "High"
            },
            {
                "title": "Full Stack Developer",
                "compatibility_score": 85,
                "why_suitable": "Versatile capability building complete web solutions from database to modern responsive frontend architectures.",
                "key_required_skills": ["React", "TypeScript", "FastAPI / Node.js", "PostgreSQL", "Git"],
                "market_demand": "Very High"
            },
            {
                "title": "Data Analyst",
                "compatibility_score": 80,
                "why_suitable": "High analytical aptitude and capability for transforming raw relational datasets into actionable decision intelligence.",
                "key_required_skills": ["SQL", "Python", "Power BI / Tableau", "Statistics", "Data Cleaning"],
                "market_demand": "High"
            }
        ]
    }

@router.post("/select")
async def select_career_and_analyze(
    payload: Dict[str, Any] = Body(...),
    authorization: Optional[str] = Header(None)
):
    """Sets user target career, executes Skill Gap Analysis and Career Matching, and stores results."""
    user = await supabase_service.get_current_user(authorization)
    user_id = user.get("id")
    target_career = payload.get("target_career", "").strip()

    if not target_career:
        raise HTTPException(status_code=400, detail="Target career role cannot be empty.")

    # 1. Update target career in profile and career_goals
    await supabase_service.update_record(
        "profiles",
        authorization,
        {"id": f"eq.{user_id}"},
        {"target_career": target_career}
    )

    goal_record = {
        "user_id": user_id,
        "career_title": target_career,
        "is_primary": True
    }
    await supabase_service.insert_record("career_goals", authorization, goal_record)

    # 2. Fetch full profile and user skills
    profiles = await supabase_service.query_table("profiles", authorization, {"id": f"eq.{user_id}"})
    profile = profiles[0] if profiles else {}
    user_skills = await supabase_service.query_table("user_skills", authorization, {"user_id": f"eq.{user_id}"})
    projects = await supabase_service.query_table("projects", authorization, {"user_id": f"eq.{user_id}"})
    certs = await supabase_service.query_table("certifications", authorization, {"user_id": f"eq.{user_id}"})

    # 3. Run Agent 2 (Skill Gap Analysis)
    gap_result = await skill_gap_agent.analyze_skill_gap(target_career, user_skills, projects, certs)

    skill_analysis_record = {
        "user_id": user_id,
        "target_career": target_career,
        "existing_skills": gap_result.get("existing_skills", []),
        "strong_skills": gap_result.get("strong_skills", []),
        "intermediate_skills": gap_result.get("intermediate_skills", []),
        "weak_skills": gap_result.get("weak_skills", []),
        "missing_skills": gap_result.get("missing_skills", []),
        "gap_summary": gap_result.get("gap_summary", "")
    }
    await supabase_service.insert_record("skill_analyses", authorization, skill_analysis_record)

    # 4. Run Agent 3 (Career Matching)
    match_result = await career_matching_agent.match_career(target_career, profile, user_skills, projects, certs)

    career_match_record = {
        "user_id": user_id,
        "career_title": target_career,
        "readiness_score": int(match_result.get("readiness_score", 70)),
        "matching_skills": match_result.get("matching_skills", []),
        "missing_requirements": match_result.get("missing_requirements", []),
        "reasoning": match_result.get("reasoning", ""),
        "alternative_paths": match_result.get("alternative_paths", []),
        "is_selected": True
    }
    await supabase_service.insert_record("career_matches", authorization, career_match_record)

    # Update readiness score on profile
    await supabase_service.update_record(
        "profiles",
        authorization,
        {"id": f"eq.{user_id}"},
        {"career_readiness_score": int(match_result.get("readiness_score", 70))}
    )

    return {
        "success": True,
        "target_career": target_career,
        "gap_analysis": gap_result,
        "career_match": match_result
    }

@router.get("/current")
async def get_current_career_data(authorization: Optional[str] = Header(None)):
    """Retrieves current career goal, latest gap analysis, and latest career match."""
    user = await supabase_service.get_current_user(authorization)
    user_id = user.get("id")

    profiles = await supabase_service.query_table("profiles", authorization, {"id": f"eq.{user_id}"})
    profile = profiles[0] if profiles else {}

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

    return {
        "profile": profile,
        "gap_analysis": gaps[0] if gaps else None,
        "career_match": matches[0] if matches else None
    }
