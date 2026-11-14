from fastapi import APIRouter, Header, UploadFile, File, Form, HTTPException
from typing import Optional, Dict, Any
from server.services.supabase_service import supabase_service
from server.services.resume_parser import resume_parser
from server.services.profile_analysis_agent import profile_analysis_agent

router = APIRouter(prefix="/api/resume", tags=["resume"])

@router.post("/analyze")
async def upload_and_analyze_resume(
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(None)
):
    """Uploads resume, parses text, runs Nemotron ATS analysis, and stores result."""
    user = await supabase_service.get_current_user(authorization)
    user_id = user.get("id")

    # File validation
    allowed_exts = (".pdf", ".docx", ".doc", ".txt")
    if not file.filename.lower().endswith(allowed_exts):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload a PDF or DOCX file."
        )

    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds maximum allowed 10MB limit.")

    # Extract text
    extracted_text, file_type = resume_parser.parse_resume(file.filename, file_bytes)
    if not extracted_text or len(extracted_text.strip()) < 20:
        raise HTTPException(
            status_code=400,
            detail="Could not extract readable text from document. Please ensure the document is not an image scan."
        )

    # Fetch user profile context
    profiles = await supabase_service.query_table("profiles", authorization, {"id": f"eq.{user_id}"})
    profile_ctx = profiles[0] if profiles else {}

    # Run Nemotron Profile Analysis Agent (Agent 1)
    analysis = await profile_analysis_agent.analyze_resume_text(extracted_text, profile_ctx)

    # Store analysis record in Supabase
    record = {
        "user_id": user_id,
        "resume_file_name": file.filename,
        "extracted_text": extracted_text[:10000],
        "ats_score": int(analysis.get("ats_score", 70)),
        "missing_sections": analysis.get("missing_sections", []),
        "strengths": analysis.get("strengths", []),
        "weaknesses": analysis.get("weaknesses", []),
        "suggestions": analysis.get("suggestions", []),
        "extracted_skills": analysis.get("extracted_skills", [])
    }

    try:
        inserted = await supabase_service.insert_record("resume_analyses", authorization, record)
        saved_record = inserted[0] if inserted else record
    except Exception as e:
        saved_record = record

    return {
        "success": True,
        "analysis": analysis,
        "saved_record": saved_record
    }

@router.get("/latest")
async def get_latest_resume_analysis(authorization: Optional[str] = Header(None)):
    """Retrieves the user's most recent ATS resume analysis."""
    user = await supabase_service.get_current_user(authorization)
    user_id = user.get("id")

    records = await supabase_service.query_table(
        "resume_analyses",
        authorization,
        {"user_id": f"eq.{user_id}", "order": "created_at.desc", "limit": "1"}
    )
    if not records:
        return {"analysis": None}
    return {"analysis": records[0]}
