from fastapi import APIRouter, Header, HTTPException, Body
from typing import Optional, Dict, Any, List
from server.services.supabase_service import supabase_service
from server.services.assessment_agent import assessment_agent

router = APIRouter(prefix="/api/assessment", tags=["assessment"])

@router.post("/generate")
async def generate_assessment(
    payload: Dict[str, Any] = Body(...),
    authorization: Optional[str] = Header(None)
):
    """Generates a 5-question multiple choice assessment for a skill and saves questions to Supabase."""
    user = await supabase_service.get_current_user(authorization)
    user_id = user.get("id")

    skill_name = payload.get("skill_name", "Core Technologies")
    target_career = payload.get("target_career", "")
    difficulty = payload.get("difficulty", "Intermediate")

    # Generate questions via Agent 5
    assessment_data = await assessment_agent.generate_skill_assessment(skill_name, target_career, difficulty)
    questions = assessment_data.get("questions", [])

    # Insert assessment record
    new_assessment = {
        "user_id": user_id,
        "skill_name": skill_name,
        "target_career": target_career,
        "difficulty": difficulty,
        "total_questions": len(questions)
    }
    inserted = await supabase_service.insert_record("assessments", authorization, new_assessment)
    assessment_id = inserted[0]["id"] if inserted else None

    # Insert questions
    saved_questions = []
    if assessment_id:
        for q in questions:
            q_record = {
                "assessment_id": assessment_id,
                "question_text": q.get("question_text"),
                "options": q.get("options"),
                "correct_option_index": q.get("correct_option_index", 0),
                "explanation": q.get("explanation"),
                "topic": q.get("topic", "Core Fundamentals")
            }
            res = await supabase_service.insert_record("assessment_questions", authorization, q_record)
            if res:
                saved_questions.append(res[0])

    return {
        "success": True,
        "assessment": inserted[0] if inserted else new_assessment,
        "questions": [
            {
                "id": q.get("id", str(i)),
                "question_text": q.get("question_text"),
                "options": q.get("options"),
                "topic": q.get("topic")
                # Do not leak correct_option_index or explanation to client prior to submit!
            }
            for i, q in enumerate(saved_questions or questions)
        ]
    }

@router.post("/submit/{assessment_id}")
async def submit_assessment_attempt(
    assessment_id: str,
    payload: Dict[str, Any] = Body(...),
    authorization: Optional[str] = Header(None)
):
    """Evaluates submission, updates database, triggers Adaptive Learning Scenario 1 or 2."""
    user = await supabase_service.get_current_user(authorization)
    user_id = user.get("id")
    submitted_answers = payload.get("answers", {})  # e.g. {"0": 1, "1": 3}

    # Fetch assessment and questions
    assessments = await supabase_service.query_table(
        "assessments",
        authorization,
        {"id": f"eq.{assessment_id}", "user_id": f"eq.{user_id}"}
    )
    if not assessments:
        raise HTTPException(status_code=404, detail="Assessment not found")
    assessment = assessments[0]

    questions = await supabase_service.query_table(
        "assessment_questions",
        authorization,
        {"assessment_id": f"eq.{assessment_id}"}
    )

    # Evaluate via Agent 5
    eval_result = await assessment_agent.evaluate_attempt(
        assessment.get("skill_name"), questions, submitted_answers
    )

    # Insert attempt record
    attempt_record = {
        "assessment_id": assessment_id,
        "user_id": user_id,
        "score": eval_result.get("score"),
        "total_points": eval_result.get("total_points", 100),
        "passed": eval_result.get("passed", False),
        "answers": submitted_answers,
        "weak_topics": eval_result.get("weak_topics", []),
        "ai_feedback": eval_result.get("ai_feedback", "")
    }
    saved_attempt = await supabase_service.insert_record("assessment_attempts", authorization, attempt_record)

    # Adaptive Learning Logic:
    skill_name = assessment.get("skill_name")
    if eval_result.get("passed"):
        # SCENARIO 1: Passed -> Mark skill as verified / upgraded in user_skills
        try:
            existing_skill = await supabase_service.query_table(
                "user_skills",
                authorization,
                {"user_id": f"eq.{user_id}", "skill_name": f"ilike.{skill_name}"}
            )
            if existing_skill:
                await supabase_service.update_record(
                    "user_skills",
                    authorization,
                    {"id": f"eq.{existing_skill[0]['id']}"},
                    {"verified": True, "proficiency": "Advanced"}
                )
            else:
                await supabase_service.insert_record(
                    "user_skills",
                    authorization,
                    {"user_id": user_id, "skill_name": skill_name, "proficiency": "Intermediate", "verified": True}
                )
        except Exception:
            pass

    return {
        "success": True,
        "evaluation": eval_result,
        "attempt": saved_attempt[0] if saved_attempt else attempt_record,
        "questions_with_answers": questions
    }

@router.get("/history")
async def get_assessment_history(authorization: Optional[str] = Header(None)):
    """Retrieves all past assessment attempts with performance metrics."""
    user = await supabase_service.get_current_user(authorization)
    user_id = user.get("id")

    attempts = await supabase_service.query_table(
        "assessment_attempts",
        authorization,
        {"user_id": f"eq.{user_id}", "order": "completed_at.desc"}
    )
    return {"attempts": attempts}
