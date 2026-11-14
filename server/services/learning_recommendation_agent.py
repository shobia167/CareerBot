import logging
from typing import Dict, Any, List
from server.services.nemotron_client import nemotron_client

logger = logging.getLogger("learning_recommendation_agent")

SYSTEM_PROMPT = """You are the Learning Recommendation Agent for CareerBot AI, powered by NVIDIA Nemotron.
Your role is to build a structured, sequential, personalized learning roadmap that bridges the learner's skill gaps to achieve their target career.

CRITICAL RULES:
1. Arrange learning activities in strict logical prerequisite order (Foundations -> Intermediate Specialization -> Production Applications & Capstone).
2. Each activity must have:
   - "skill_name": Exact name of skill
   - "learning_objective": Clear measurable learning objective
   - "resource_title": Realistic tutorial or official guide title
   - "resource_url": VERIFIED working URL (e.g., https://developer.mozilla.org, https://fastapi.tiangolo.com, https://react.dev, https://docs.python.org/3/, https://www.freecodecamp.org, https://docs.docker.com)
   - "difficulty_level": "Beginner", "Intermediate", or "Advanced"
   - "estimated_duration": e.g. "3-5 hours" or "1 week"
   - "practical_task": A concrete, portfolio-worthy hands-on task to build
3. Do not invent fake or non-existent URLs. Prefer established official documentation and educational platforms.
4. Return ONLY valid JSON matching the requested schema.
"""

class LearningRecommendationAgent:
    async def generate_roadmap(
        self,
        target_career: str,
        missing_skills: List[Dict[str, Any]],
        existing_skills: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generates a complete roadmap of 5-8 structured learning activities."""
        missing_names = [m.get("name") if isinstance(m, dict) else str(m) for m in missing_skills]
        existing_names = [s.get("skill_name") if isinstance(s, dict) else str(s) for s in existing_skills]

        user_prompt = f"""Generate a personalized learning roadmap for:
Target Career: {target_career}
Existing Skills: {', '.join(existing_names) or 'Beginner level'}
Identified Skill Gaps to Bridge: {', '.join(missing_names) or 'Core technologies'}

Respond with this exact JSON format:
{{
  "roadmap_title": "Mastery Roadmap: {target_career}",
  "roadmap_description": "A tailored step-by-step curriculum designed to bridge your high-priority skill gaps and prepare you for technical interviews and production workflows.",
  "activities": [
    {{
      "sequence_order": 1,
      "skill_name": "Docker Containerization",
      "learning_objective": "Containerize full-stack applications with multi-stage builds and compose environments.",
      "resource_title": "Docker Get Started & Best Practices Guide",
      "resource_url": "https://docs.docker.com/get-started/",
      "difficulty_level": "Beginner",
      "estimated_duration": "4 hours",
      "practical_task": "Create a multi-container Dockerfile and docker-compose.yml running a web service with a persistent PostgreSQL database."
    }},
    {{
      "sequence_order": 2,
      "skill_name": "FastAPI Production APIs",
      "learning_objective": "Design type-safe, asynchronous REST endpoints with dependency injection and OpenAPI documentation.",
      "resource_title": "FastAPI Official Tutorial & User Guide",
      "resource_url": "https://fastapi.tiangolo.com/tutorial/",
      "difficulty_level": "Intermediate",
      "estimated_duration": "6 hours",
      "practical_task": "Build an asynchronous CRUD API with JWT authentication and Pydantic validation schemas."
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
                max_tokens=2500
            )
            data = nemotron_client.extract_json(raw_response)
            return data
        except Exception as e:
            logger.warning(f"Nemotron learning roadmap fallback triggered: {e}")
            return self._heuristic_roadmap(target_career, missing_skills)

    def _heuristic_roadmap(self, target_career: str, missing_skills: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Verified curriculum fallback with working official resources."""
        skill_catalog = {
            "docker": {
                "skill": "Docker Containerization",
                "obj": "Package and containerize applications with reproducible builds",
                "resource": "Docker Official Documentation",
                "url": "https://docs.docker.com/get-started/",
                "level": "Intermediate",
                "duration": "5 hours",
                "task": "Write a multi-stage Dockerfile and docker-compose file running a web service and database."
            },
            "kubernetes": {
                "skill": "Kubernetes Orchestration",
                "obj": "Deploy and manage resilient container pods, services, and ingress rules",
                "resource": "Kubernetes Basics Tutorial",
                "url": "https://kubernetes.io/docs/tutorials/kubernetes-basics/",
                "level": "Advanced",
                "duration": "8 hours",
                "task": "Configure local Minikube deployment manifests with rolling updates and health checks."
            },
            "fastapi": {
                "skill": "FastAPI Web Architecture",
                "obj": "Build high-throughput async Python APIs with automatic OpenAPI docs",
                "resource": "FastAPI User Guide",
                "url": "https://fastapi.tiangolo.com/tutorial/",
                "level": "Intermediate",
                "duration": "6 hours",
                "task": "Build a secure REST API with Pydantic models, JWT bearer auth, and dependency injection."
            },
            "react": {
                "skill": "React & Modern UI",
                "obj": "Construct modular, performant single-page applications with hooks and state",
                "resource": "React Official Documentation",
                "url": "https://react.dev/learn",
                "level": "Beginner",
                "duration": "6 hours",
                "task": "Build an interactive dashboard component with optimistic UI updates and responsive layouts."
            },
            "sql": {
                "skill": "Advanced SQL & Database Design",
                "obj": "Optimize database schemas, indexes, joins, and window functions",
                "resource": "PostgreSQL Official Tutorial",
                "url": "https://www.postgresql.org/docs/current/tutorial.html",
                "level": "Intermediate",
                "duration": "4 hours",
                "task": "Write analytical queries using CTEs, window functions (ROW_NUMBER, RANK), and execution plans (EXPLAIN)."
            },
            "machine learning": {
                "skill": "Machine Learning Foundations",
                "obj": "Train, validate, and evaluate predictive models using supervised and unsupervised techniques",
                "resource": "Scikit-Learn User Guide",
                "url": "https://scikit-learn.org/stable/user_guide.html",
                "level": "Intermediate",
                "duration": "8 hours",
                "task": "Build an end-to-end classification pipeline with cross-validation and hyperparameter tuning."
            },
            "ci/cd": {
                "skill": "CI/CD & GitHub Actions",
                "obj": "Automate linting, unit testing, and continuous deployment workflows",
                "resource": "GitHub Actions Documentation",
                "url": "https://docs.github.com/en/actions",
                "level": "Intermediate",
                "duration": "4 hours",
                "task": "Create a GitHub Actions workflow that executes tests on pull requests and reports status."
            }
        }

        activities = []
        seq = 1

        # Match missing skills or fallback to role defaults
        for m in missing_skills[:5]:
            m_name = m.get("name", "") if isinstance(m, dict) else str(m)
            matched = False
            for k, val in skill_catalog.items():
                if k in m_name.lower():
                    activities.append({
                        "sequence_order": seq,
                        "skill_name": val["skill"],
                        "learning_objective": val["obj"],
                        "resource_title": val["resource"],
                        "resource_url": val["url"],
                        "difficulty_level": val["level"],
                        "estimated_duration": val["duration"],
                        "practical_task": val["task"]
                    })
                    seq += 1
                    matched = True
                    break
            if not matched and m_name:
                activities.append({
                    "sequence_order": seq,
                    "skill_name": m_name,
                    "learning_objective": f"Develop working technical competence in {m_name} for industry deployment.",
                    "resource_title": f"{m_name} Developer Reference & Official Guides",
                    "resource_url": "https://developer.mozilla.org/en-US/",
                    "difficulty_level": "Intermediate",
                    "estimated_duration": "5 hours",
                    "practical_task": f"Build a practical proof-of-concept module implementing {m_name} in a realistic project."
                })
                seq += 1

        if len(activities) < 4:
            # Add general capstone
            activities.append({
                "sequence_order": seq,
                "skill_name": "Production Capstone Project",
                "learning_objective": f"Synthesize all acquired skills into a complete, documented production portfolio piece for {target_career}.",
                "resource_title": "Full-Stack Software Architecture Guidelines",
                "resource_url": "https://github.com/kamranahmedse/developer-roadmap",
                "difficulty_level": "Advanced",
                "estimated_duration": "12 hours",
                "practical_task": f"Build, test, containerize, and deploy a full-scale portfolio application aligned with {target_career} standards."
            })

        return {
            "roadmap_title": f"Mastery Roadmap: {target_career}",
            "roadmap_description": f"Curated, step-by-step technical pathway targeting critical skill requirements for {target_career}.",
            "activities": activities
        }

learning_recommendation_agent = LearningRecommendationAgent()
