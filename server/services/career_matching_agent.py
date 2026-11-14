import logging
from typing import Dict, Any, List
from server.services.nemotron_client import nemotron_client

logger = logging.getLogger("career_matching_agent")

SYSTEM_PROMPT = """You are the Career Matching Agent for CareerBot AI, powered by NVIDIA Nemotron.
Your role is to evaluate a learner's full profile (skills, resume analysis, projects, education, certifications, interests) and calculate an explainable career-readiness score (0 to 100) for target and alternative roles.

Rules:
1. Explain clearly why the readiness score was assigned.
2. Provide 2-3 suitable alternative career paths that build on their existing strengths.
3. Highlight matching skills and missing requirements without exaggerating or claiming guaranteed job placement.
4. Return ONLY valid JSON in the specified schema.
"""

class CareerMatchingAgent:
    async def match_career(
        self,
        target_career: str,
        profile: Dict[str, Any],
        skills: List[Dict[str, Any]],
        projects: List[Dict[str, Any]],
        certifications: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Calculates career readiness and recommends alternative career paths."""
        skills_str = ", ".join([f"{s.get('skill_name')} ({s.get('proficiency', 'Beginner')})" for s in skills]) or "None"
        projects_str = ", ".join([p.get('title', '') for p in projects]) or "None"
        certs_str = ", ".join([c.get('name', '') for c in certifications]) or "None"
        interests_str = ", ".join(profile.get('areas_of_interest', [])) or "Technology & Software"

        user_prompt = f"""Evaluate Career Match for candidate:
Target Role: {target_career}
Education: {profile.get('education', 'Technical degree')}
Bio / Summary: {profile.get('bio', '')}
Interests: {interests_str}
Skills: {skills_str}
Projects: {projects_str}
Certifications: {certs_str}

Return this exact JSON format:
{{
  "career_title": "{target_career}",
  "readiness_score": 72,
  "matching_skills": ["Python", "SQL", "Git", "Problem Solving"],
  "missing_requirements": ["Production Cloud Experience", "Docker Orchestration", "Large-scale Database Tuning"],
  "reasoning": "The learner demonstrates solid fundamentals with strong programming and project execution. To increase competitiveness from 72% to 90%+, hands-on deployment and containerization experience is required.",
  "alternative_paths": [
    {{
      "title": "Backend Software Engineer",
      "match_score": 85,
      "why_good_fit": "Your Python and database skills directly match backend service engineering requirements.",
      "bridge_skills_needed": ["FastAPI / Django", "Docker", "REST API Design"]
    }},
    {{
      "title": "Data Analyst / Analytics Engineer",
      "match_score": 78,
      "why_good_fit": "Your analytical mindset, SQL querying, and Python data handling are strong assets.",
      "bridge_skills_needed": ["Power BI / Tableau", "Advanced Data Modeling"]
    }}
  ]
}}
"""
        try:
            raw_response = await nemotron_client.chat_completion(
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.2,
                max_tokens=2200
            )
            data = nemotron_client.extract_json(raw_response)
            return data
        except Exception as e:
            logger.warning(f"Nemotron career match fallback triggered: {e}")
            return self._heuristic_career_match(target_career, skills, profile)

    def _heuristic_career_match(self, target_career: str, skills: List[Dict[str, Any]], profile: Dict[str, Any]) -> Dict[str, Any]:
        user_skills_names = [s.get("skill_name", "") for s in skills]
        score = min(40 + len(user_skills_names) * 6, 85)

        # Generate intelligent alternatives
        t_lower = target_career.lower()
        if "ai" in t_lower or "machine learning" in t_lower:
            alts = [
                {
                    "title": "Data Scientist",
                    "match_score": min(score + 5, 88),
                    "why_good_fit": "Strong overlap in statistical analysis, Python data packages, and modeling fundamentals.",
                    "bridge_skills_needed": ["Exploratory Data Analysis", "Feature Engineering", "Storytelling with Data"]
                },
                {
                    "title": "MLOps Engineer",
                    "match_score": max(score - 8, 60),
                    "why_good_fit": "Bridges machine learning workflows with production automation and scalable infrastructure.",
                    "bridge_skills_needed": ["Kubernetes", "Docker", "Model Monitoring", "CI/CD"]
                }
            ]
        elif "full stack" in t_lower or "web" in t_lower or "software" in t_lower:
            alts = [
                {
                    "title": "Frontend Engineer",
                    "match_score": min(score + 6, 90),
                    "why_good_fit": "High demand for clean UI/UX implementation using modern component libraries.",
                    "bridge_skills_needed": ["TypeScript", "State Management", "Performance Optimization"]
                },
                {
                    "title": "Cloud Platform Engineer",
                    "match_score": max(score - 10, 58),
                    "why_good_fit": "Focuses on deploying and monitoring the backend architectures you develop.",
                    "bridge_skills_needed": ["AWS / GCP", "Terraform", "Docker Containerization"]
                }
            ]
        else:
            alts = [
                {
                    "title": "Business Intelligence Analyst",
                    "match_score": min(score + 8, 90),
                    "why_good_fit": "Translates technical data into strategic business insights.",
                    "bridge_skills_needed": ["Interactive Dashboards", "Executive Communication"]
                },
                {
                    "title": "Junior Software Engineer",
                    "match_score": score,
                    "why_good_fit": "Generalist software role allowing rapid rotation through diverse development teams.",
                    "bridge_skills_needed": ["Clean Code Practices", "Git Workflows", "Unit Testing"]
                }
            ]

        return {
            "career_title": target_career,
            "readiness_score": score,
            "matching_skills": user_skills_names[:5] or ["Analytical Thinking", "Core Programming", "Version Control"],
            "missing_requirements": [
                "Production System Deployment",
                "Advanced Cloud Infrastructure",
                "Automated Integration Testing"
            ],
            "reasoning": f"Based on your current skill profile ({len(skills)} verified skills) and background, you possess a solid baseline ({score}% readiness). Focusing on core architectural design and real-world project deployments will accelerate readiness for {target_career}.",
            "alternative_paths": alts
        }

career_matching_agent = CareerMatchingAgent()
