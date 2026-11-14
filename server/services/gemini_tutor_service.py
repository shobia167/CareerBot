import os
import json
import logging
from typing import Dict, Any, List, Optional
from server.config import settings

logger = logging.getLogger("gemini_tutor_service")

class GeminiTutorService:
    def __init__(self):
        self.api_key = settings.gemini_api_key
        self.model = settings.gemini_model
        self._client = None

    def get_client(self):
        current_key = os.getenv("GEMINI_API_KEY", self.api_key)
        if not current_key:
            return None
        if not self._client or self.api_key != current_key:
            self.api_key = current_key
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.error(f"Failed to initialize google-genai client: {e}")
                self._client = None
        return self._client

    def build_user_context_prompt(self, user_data: Dict[str, Any]) -> str:
        """Constructs a concise, structured snapshot of the authenticated user's actual profile."""
        profile = user_data.get("profile", {})
        skills = user_data.get("skills", [])
        resume = user_data.get("resume_analysis", {})
        gap = user_data.get("skill_gap", {})
        career_match = user_data.get("career_match", {})
        roadmap = user_data.get("roadmap", {})
        activities = user_data.get("activities", [])
        assessments = user_data.get("assessments", [])
        recent_posts = user_data.get("learning_posts", [])

        skills_list = [f"{s.get('skill_name')} ({s.get('proficiency', 'Intermediate')})" for s in skills]
        completed_act = [a.get("skill_name") for a in activities if a.get("is_completed")]
        pending_act = [a.get("skill_name") for a in activities if not a.get("is_completed")]
        recent_scores = [f"{a.get('skill_name')}: {a.get('score', 0)}%" for a in assessments[:3]]
        posts_summary = [p.get("content", "")[:60] for p in recent_posts[:3]]

        context = f"""[AUTHENTICATED USER CONTEXT]
- Name: {profile.get('full_name') or 'Learner'}
- Target Career: {profile.get('target_career') or 'Not yet selected'}
- Education: {profile.get('education') or 'Not specified'} ({profile.get('college_organization') or ''})
- Bio: {profile.get('bio') or 'None'}
- Career Readiness Score: {career_match.get('readiness_score', profile.get('career_readiness_score', 0))}%
- Resume ATS Score: {resume.get('ats_score', 'N/A')}%
- Existing Skills ({len(skills)}): {', '.join(skills_list) or 'None registered'}
- Strong Skills: {', '.join([s.get('name', '') for s in gap.get('strong_skills', [])]) or 'None'}
- Missing / Target Skills: {', '.join([m.get('name', '') for m in gap.get('missing_skills', [])]) or 'None'}
- Completed Learning Activities ({len(completed_act)}): {', '.join(completed_act) or 'None yet'}
- Pending Roadmap Activities ({len(pending_act)}): {', '.join(pending_act) or 'None'}
- Recent Assessment Scores: {', '.join(recent_scores) or 'No assessments taken yet'}
- Recent Private Learning Log: {'; '.join(posts_summary) or 'No recent posts'}
"""
        return context

    async def chat(
        self,
        message: str,
        user_data: Dict[str, Any],
        history: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """Runs the personal AI career tutor conversation."""
        user_context = self.build_user_context_prompt(user_data)
        client = self.get_client()

        system_instruction = f"""You are the personal AI Career Tutor for CareerBot AI, named CareerBot Tutor.
You are powered by Google Gemini.
You are NOT a general-purpose assistant. You are the user's dedicated personal career advisor, mentor, and learning companion.

Rules:
1. Address the user warmly by their name: {user_data.get('profile', {}).get('full_name', 'there')}.
2. Always refer to their actual stored data (skills, current roadmap progress, assessment scores, resume ATS analysis).
3. Do not invent completed courses or credentials that do not exist in their profile.
4. If they ask about switching careers, compare their current skills with the new target role, explain which skills transfer, and suggest updating their career goal.
5. If they ask what to learn next, recommend the next pending activity from their active roadmap.
6. If an action is requested (e.g. changing career goal, creating a private learning post), specify the action in a JSON action block at the very end of your response, or explain the next steps clearly.
7. Maintain a professional, encouraging, highly analytical, and insightful tone.

{user_context}
"""

        if client:
            try:
                # Prepare conversation history for Gemini API
                formatted_contents = []
                for h in history[-8:]:
                    role = "user" if h.get("role") == "user" else "model"
                    formatted_contents.append({
                        "role": role,
                        "parts": [{"text": h.get("content", "")}]
                    })
                formatted_contents.append({
                    "role": "user",
                    "parts": [{"text": f"{system_instruction}\n\nUser Question: {message}"}]
                })

                response = client.models.generate_content(
                    model=self.model,
                    contents=formatted_contents,
                )
                answer_text = response.text or ""
                return {
                    "role": "assistant",
                    "content": answer_text,
                    "model": "gemini-2.5-flash"
                }
            except Exception as e:
                logger.warning(f"Gemini API call failed, using intelligent context fallback: {e}")

        # Intelligent context-aware fallback response when Gemini API key is not yet set or during rate limits
        return self._generate_context_aware_response(message, user_data, history)

    def _generate_context_aware_response(
        self,
        message: str,
        user_data: Dict[str, Any],
        history: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """Provides accurate personalized answers directly from the user's database records."""
        profile = user_data.get("profile", {})
        name = profile.get("full_name") or "there"
        target_career = profile.get("target_career") or "your chosen path"
        skills = user_data.get("skills", [])
        skill_names = [s.get("skill_name") for s in skills]
        activities = user_data.get("activities", [])
        completed_act = [a.get("skill_name") for a in activities if a.get("is_completed")]
        pending_act = [a.get("skill_name") for a in activities if not a.get("is_completed")]
        resume = user_data.get("resume_analysis", {})
        assessments = user_data.get("assessments", [])

        msg_lower = message.lower()

        if "status" in msg_lower or "progress" in msg_lower:
            total_act = len(activities)
            pct = round((len(completed_act) / max(total_act, 1)) * 100) if total_act else 0
            reply = (
                f"Hello {name}! You are currently working toward becoming a **{target_career}**.\n\n"
                f"Here is your current status:\n"
                f"- **Overall Roadmap Progress:** {pct}% ({len(completed_act)} of {total_act} activities completed)\n"
                f"- **Completed Milestones:** {', '.join(completed_act) if completed_act else 'None yet'}\n"
                f"- **Next Priority Activity:** {pending_act[0] if pending_act else 'All initial roadmap items completed!'}\n"
                f"- **Verified Skills:** {len(skills)} tracked skills in your profile.\n\n"
                f"What would you like to tackle today?"
            )
        elif "switch" in msg_lower or "change" in msg_lower or "career" in msg_lower and ("can i" in msg_lower or "should i" in msg_lower):
            reply = (
                f"Great question, {name}! Based on your current technical foundation in **{', '.join(skill_names[:4]) if skill_names else 'your profile'}**, "
                f"you already have transferable competencies. If you'd like to pivot to another specialization (such as AI Engineer, Cloud Engineer, or Data Analyst), "
                f"we can recalculate your skill gaps and generate a revised roadmap immediately while keeping all your existing completed progress intact.\n\n"
                f"Which career role are you considering exploring?"
            )
        elif "next" in msg_lower or "what should i learn" in msg_lower or "recommend" in msg_lower:
            next_topic = pending_act[0] if pending_act else "a Capstone Portfolio Project"
            reply = (
                f"Based on your latest profile and active roadmap for **{target_career}**, I recommend focusing on **{next_topic}** next.\n\n"
                f"You can review the recommended learning resources and practical hands-on task directly in your Roadmap section above. Once you complete the practical exercise, take the skill assessment to verify your mastery!"
            )
        elif "resume" in msg_lower or "ats" in msg_lower:
            ats_score = resume.get("ats_score", "Not calculated yet")
            missing = resume.get("missing_sections", [])
            reply = (
                f"{name}, your estimated Resume ATS score is **{ats_score}/100**.\n\n"
                f"Key areas to optimize:\n"
                f"- **Missing Sections:** {', '.join(missing) if missing else 'Standard sections detected'}\n"
                f"- **Recommendation:** Quantify your project achievements with clear impact metrics and ensure keywords matching **{target_career}** are present in both your summary and experience bullet points."
            )
        elif "assessment" in msg_lower or "quiz" in msg_lower or "score" in msg_lower:
            if assessments:
                last_test = assessments[0]
                reply = (
                    f"Your most recent assessment was in **{last_test.get('skill_name')}** where you achieved **{last_test.get('score', 0)}%**.\n\n"
                    f"Status: {'Demonstrated Mastery! Next activity unlocked.' if last_test.get('passed') else 'Needs more practice on core concepts before proceeding.'}"
                )
            else:
                reply = f"You haven't attempted any assessments yet, {name}. Pick any skill in your active roadmap and click **'Take Assessment'** to validate your proficiency!"
        else:
            reply = (
                f"Hello {name}! As your CareerBot Tutor, I'm here to support your journey to becoming a top-tier **{target_career}**.\n\n"
                f"You currently have **{len(skills)} skills** recorded, an ATS score of **{resume.get('ats_score', 'N/A')}/100**, and **{len(pending_act)} remaining roadmap modules**.\n\n"
                f"Feel free to ask me:\n"
                f"- *'What is my current learning status?'*\n"
                f"- *'What should I learn next?'*\n"
                f"- *'How can I improve my resume for {target_career}?'*\n"
                f"- *'Can I switch to an AI Engineer or Data Scientist role?'*"
            )

        return {
            "role": "assistant",
            "content": reply,
            "model": "careerbot-personal-tutor"
        }

gemini_tutor_service = GeminiTutorService()
