import logging
from typing import Dict, Any, List
from server.services.nemotron_client import nemotron_client

logger = logging.getLogger("skill_gap_agent")

SYSTEM_PROMPT = """You are the Skill Gap Analysis Agent for CareerBot AI, powered by NVIDIA Nemotron.
Your role is to perform an in-depth, rigorous comparison between a learner's existing skills and the required market-demand skills for their desired career role.

Categories to return:
1. "strong_skills": Skills the learner possesses with high/advanced proficiency that directly match the role.
2. "intermediate_skills": Skills the learner possesses with moderate proficiency needing refinement.
3. "weak_skills": Skills the learner knows slightly or at a beginner level requiring substantial leveling up.
4. "missing_skills": Critical or recommended industry skills for the target career that the learner does NOT currently possess.
5. "gap_summary": A clear, empowering executive summary of their readiness and primary focus areas.

Ensure you prioritize missing skills by importance (Crucial vs Recommended).
Return ONLY valid JSON matching the exact schema.
"""

class SkillGapAgent:
    async def analyze_skill_gap(
        self,
        target_career: str,
        user_skills: List[Dict[str, Any]],
        projects: List[Dict[str, Any]] = None,
        certifications: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Compares user skills against target career role requirements."""
        skills_summary = ", ".join([f"{s.get('skill_name')} ({s.get('proficiency', 'Beginner')})" for s in user_skills]) or "None listed"
        projects_summary = ", ".join([p.get('title', '') for p in (projects or [])]) or "None listed"
        certs_summary = ", ".join([c.get('name', '') for c in (certifications or [])]) or "None listed"

        user_prompt = f"""Target Career Role: {target_career}

Learner Profile:
- Existing Skills & Proficiencies: {skills_summary}
- Projects Completed: {projects_summary}
- Certifications: {certs_summary}

Analyze the skill gaps and return this exact JSON schema:
{{
  "target_career": "{target_career}",
  "existing_skills": [
    {{"name": "Python", "proficiency": "Intermediate", "relevance": "High"}}
  ],
  "strong_skills": [
    {{"name": "Python", "reason": "Demonstrated through project experience and syntax fluency"}}
  ],
  "intermediate_skills": [
    {{"name": "SQL", "reason": "Basic querying known, requires optimization and window functions"}}
  ],
  "weak_skills": [
    {{"name": "Docker", "reason": "Basic containerization known, needs production compose & orchestration"}}
  ],
  "missing_skills": [
    {{
      "name": "Kubernetes",
      "priority": "High",
      "importance_reason": "Essential for container orchestration and cloud-native workflows",
      "estimated_learning_hours": 20
    }},
    {{
      "name": "CI/CD Pipelines",
      "priority": "Medium",
      "importance_reason": "Crucial for automated build, test, and deployment cycles",
      "estimated_learning_hours": 15
    }}
  ],
  "gap_summary": "The candidate has strong foundational programming skills in Python and SQL, but needs to acquire cloud deployment (Docker, Kubernetes) and CI/CD competencies to be fully competitive for the target role."
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
            logger.warning(f"Nemotron skill gap fallback triggered: {e}")
            return self._heuristic_gap_analysis(target_career, user_skills)

    def _heuristic_gap_analysis(self, target_career: str, user_skills: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Deterministic fallback mapping standard role requirements against user skills."""
        # Standard industry benchmark skillsets per role
        role_benchmarks = {
            "ai engineer": [
                "Python", "PyTorch", "TensorFlow", "Transformers", "LLM Fine-tuning",
                "LangChain", "Vector Databases", "FastAPI", "Docker", "MLOps"
            ],
            "machine learning engineer": [
                "Python", "Scikit-Learn", "PyTorch", "Pandas", "Feature Engineering",
                "Model Deployment", "MLflow", "SQL", "Docker", "Mathematics & Statistics"
            ],
            "full stack developer": [
                "JavaScript", "TypeScript", "React", "Node.js", "Express / FastAPI",
                "SQL / PostgreSQL", "REST APIs", "Git", "Tailwind CSS", "Docker"
            ],
            "data analyst": [
                "SQL", "Python", "Power BI", "Tableau", "Excel",
                "Data Cleaning", "Pandas", "Exploratory Data Analysis", "Statistics", "Data Storytelling"
            ],
            "data scientist": [
                "Python", "R", "SQL", "Machine Learning", "Deep Learning",
                "Pandas", "Numpy", "Statistical Modeling", "Data Visualization", "Hypothesis Testing"
            ],
            "cloud engineer": [
                "Linux", "AWS / GCP / Azure", "Terraform", "Docker", "Kubernetes",
                "CI/CD Pipelines", "Networking", "Security & IAM", "Python / Bash", "Monitoring"
            ],
            "software developer": [
                "Data Structures & Algorithms", "Python / Java / C++", "Object Oriented Design",
                "SQL Databases", "Git & GitHub", "REST APIs", "Unit Testing", "System Design"
            ]
        }

        # Normalize target career
        matched_benchmarks = []
        for role_key, reqs in role_benchmarks.items():
            if role_key in target_career.lower():
                matched_benchmarks = reqs
                break
        if not matched_benchmarks:
            matched_benchmarks = [
                "Problem Solving", "Modern Frameworks", "System Architecture",
                "Testing & CI/CD", "Database Optimization", "Security Best Practices"
            ]

        user_skill_names_lower = {s.get("skill_name", "").strip().lower(): s for s in user_skills}
        strong_skills = []
        intermediate_skills = []
        weak_skills = []
        existing_skills_list = []

        for s in user_skills:
            name = s.get("skill_name", "")
            prof = s.get("proficiency", "Intermediate")
            existing_skills_list.append({"name": name, "proficiency": prof, "relevance": "Direct"})
            if prof == "Advanced":
                strong_skills.append({"name": name, "reason": "Advanced proficiency indicated by candidate"})
            elif prof == "Intermediate":
                intermediate_skills.append({"name": name, "reason": "Solid practical foundation, ready for advanced topics"})
            else:
                weak_skills.append({"name": name, "reason": "Basic introductory knowledge, requires hands-on projects"})

        missing_skills = []
        for benchmark in matched_benchmarks:
            if benchmark.lower() not in user_skill_names_lower:
                missing_skills.append({
                    "name": benchmark,
                    "priority": "High" if len(missing_skills) < 3 else "Medium",
                    "importance_reason": f"Essential skill for industry competitiveness in {target_career}",
                    "estimated_learning_hours": 15
                })

        return {
            "target_career": target_career,
            "existing_skills": existing_skills_list,
            "strong_skills": strong_skills or [{"name": s.get("skill_name", "Core Tech"), "reason": "Strong baseline knowledge"} for s in user_skills[:2]],
            "intermediate_skills": intermediate_skills,
            "weak_skills": weak_skills,
            "missing_skills": missing_skills[:6],
            "gap_summary": f"Your current profile demonstrates solid capabilities in {', '.join([s.get('skill_name','') for s in user_skills[:3]]) or 'core fundamentals'}. To achieve your target role as a {target_career}, your primary focus should be closing gaps in {', '.join([m['name'] for m in missing_skills[:3]])}."
        }

skill_gap_agent = SkillGapAgent()
