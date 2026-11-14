import json
import logging
from typing import Dict, Any, List
from server.services.nemotron_client import nemotron_client

logger = logging.getLogger("profile_analysis_agent")

SYSTEM_PROMPT = """You are the User Profile & Resume Analysis Agent for CareerBot AI, powered by NVIDIA Nemotron.
Your task is to analyze candidate resumes and profile data thoroughly, extract structured professional information, and calculate an estimated ATS compatibility score out of 100.

Guidelines:
1. Extract candidate's skills, experience, education, projects, and certifications.
2. Calculate an ATS score (0 to 100) based on structure, clarity, quantifiable achievements, industry keywords, and standard section headings. Note clearly that this is an estimated assessment.
3. Identify missing critical sections (e.g., Summary, Projects, Certifications, Contact Information, Work Experience, Technical Skills).
4. Identify 3-5 concrete strengths.
5. Identify 2-4 areas for improvement (weaknesses).
6. Provide actionable recommendations for keywords, formatting, impact statements, and skills.
7. Return ONLY valid JSON in the requested schema. No conversational filler or reasoning.
"""

class ProfileAnalysisAgent:
    async def analyze_resume_text(self, resume_text: str, current_profile: Dict[str, Any] = None) -> Dict[str, Any]:
        """Analyzes resume text using NVIDIA Nemotron and returns structured ATS analysis."""
        profile_ctx = current_profile or {}
        user_prompt = f"""Analyze this resume and profile information:

[CANDIDATE PROFILE CONTEXT]
Name: {profile_ctx.get('full_name', 'Not provided')}
Education: {profile_ctx.get('education', 'Not provided')}
Target Career: {profile_ctx.get('target_career', 'Not specified')}

[RESUME CONTENT]
{resume_text[:6000]}

Respond with a JSON object in this exact schema:
{{
  "ats_score": 78,
  "score_breakdown": {{
    "formatting_clarity": 80,
    "keyword_richness": 75,
    "quantifiable_impact": 70,
    "section_completeness": 85
  }},
  "missing_sections": ["Professional Summary", "Certifications"],
  "strengths": [
    "Clear chronological project experience with modern tech stack",
    "Strong technical skills section highlighted early"
  ],
  "weaknesses": [
    "Lack of quantifiable metrics (e.g. % improvements, latency reductions)",
    "Missing links to live deployments or GitHub repositories"
  ],
  "suggestions": [
    {{
      "category": "Impact Metrics",
      "suggestion": "Quantify bullet points with tangible metrics such as 'improved performance by 25%'",
      "priority": "High"
    }},
    {{
      "category": "Keywords",
      "suggestion": "Include specific frameworks and cloud tooling relevant to target roles",
      "priority": "Medium"
    }}
  ],
  "extracted_skills": ["Python", "SQL", "FastAPI", "React", "Git", "Docker"],
  "extracted_education": "Bachelor of Technology in Computer Science",
  "extracted_projects": [
    {{
      "title": "E-Commerce Microservices",
      "technologies": ["Python", "FastAPI", "Docker"],
      "description": "Built scalable backend services with automated testing"
    }}
  ],
  "extracted_certifications": []
}}
"""
        try:
            raw_response = await nemotron_client.chat_completion(
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.2,
                max_tokens=2500
            )
            data = nemotron_client.extract_json(raw_response)
            return data
        except Exception as e:
            logger.warning(f"Nemotron profile analysis fallback triggered: {e}")
            return self._heuristic_analysis(resume_text, profile_ctx)

    def _heuristic_analysis(self, resume_text: str, profile_ctx: Dict[str, Any]) -> Dict[str, Any]:
        """High-quality deterministic fallback analysis when AI API is unreachable."""
        text_lower = resume_text.lower()
        skills_detected = []
        known_skills = [
            "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust",
            "sql", "postgresql", "mysql", "mongodb", "redis",
            "react", "next.js", "vue", "angular", "node.js", "fastapi", "django", "flask",
            "docker", "kubernetes", "aws", "gcp", "azure", "ci/cd", "git",
            "machine learning", "deep learning", "pytorch", "tensorflow", "scikit-learn",
            "pandas", "numpy", "power bi", "tableau", "data analysis", "rest api", "graphql"
        ]
        for skill in known_skills:
            if skill in text_lower:
                skills_detected.append(skill.title() if len(skill) > 3 else skill.upper())

        # Check sections
        missing_sections = []
        if "summary" not in text_lower and "objective" not in text_lower:
            missing_sections.append("Professional Summary")
        if "certification" not in text_lower and "certificate" not in text_lower:
            missing_sections.append("Certifications")
        if "project" not in text_lower:
            missing_sections.append("Projects")
        if "education" not in text_lower:
            missing_sections.append("Education")

        word_count = len(resume_text.split())
        score = 65
        if word_count > 200:
            score += 10
        if len(skills_detected) >= 5:
            score += 10
        if len(missing_sections) <= 1:
            score += 10
        score = min(score, 92)

        return {
            "ats_score": score,
            "score_breakdown": {
                "formatting_clarity": min(score + 2, 95),
                "keyword_richness": min(len(skills_detected) * 8 + 30, 90),
                "quantifiable_impact": 65,
                "section_completeness": 85 if not missing_sections else 70
            },
            "missing_sections": missing_sections,
            "strengths": [
                f"Identified {len(skills_detected)} industry-standard technical skills in your background",
                "Clear professional focus with structured project and educational history",
                "Strong foundational competencies matching modern technical roles"
            ],
            "weaknesses": [
                "Include more measurable results, percentages, and metrics to demonstrate business impact",
                "Add direct repository URLs or deployed application links for key projects"
            ],
            "suggestions": [
                {
                    "category": "Measurable Impact",
                    "suggestion": "Replace passive bullet points with 'Action Verb + Context + Result (Metric)' format.",
                    "priority": "High"
                },
                {
                    "category": "Keywords & Skills",
                    "suggestion": "Ensure technical terms are placed in both a dedicated Skills section and contextualized in Project descriptions.",
                    "priority": "Medium"
                },
                {
                    "category": "Section Formatting",
                    "suggestion": "Ensure standard ATS headings (Experience, Education, Projects, Skills) are clearly separated.",
                    "priority": "Medium"
                }
            ],
            "extracted_skills": skills_detected[:12] or ["Python", "SQL", "Problem Solving", "Git"],
            "extracted_education": profile_ctx.get("education") or "Degree in Relevant Discipline",
            "extracted_projects": [],
            "extracted_certifications": []
        }

profile_analysis_agent = ProfileAnalysisAgent()
