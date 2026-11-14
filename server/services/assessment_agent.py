import logging
from typing import Dict, Any, List
from server.services.nemotron_client import nemotron_client

logger = logging.getLogger("assessment_agent")

SYSTEM_PROMPT = """You are the Assessment & Evaluation Agent for CareerBot AI, powered by NVIDIA Nemotron.
Your role is twofold:
1. Generate high-quality, practical, multiple-choice skill assessments (5 questions) to test technical competency accurately.
2. Evaluate test attempts, pinpoint precise conceptual gaps, and provide clear remediation advice.

Assessment Question Guidelines:
- Questions must test applied reasoning and syntax understanding, not trivial trivia.
- Exactly 4 options per question.
- "correct_option_index" must be an integer (0, 1, 2, or 3).
- Provide a clear explanation of why the correct option is right and others are flawed.
- Tag each question with a specific sub-topic.
- Return ONLY valid JSON matching the exact schema.
"""

class AssessmentAgent:
    async def generate_skill_assessment(
        self,
        skill_name: str,
        target_career: str = "",
        difficulty: str = "Intermediate"
    ) -> Dict[str, Any]:
        """Generates 5 questions for the given skill."""
        user_prompt = f"""Generate a 5-question technical assessment for:
Skill: {skill_name}
Target Career Context: {target_career or 'Software / Data / AI Development'}
Target Difficulty: {difficulty}

Return this exact JSON schema:
{{
  "skill_name": "{skill_name}",
  "difficulty": "{difficulty}",
  "total_questions": 5,
  "questions": [
    {{
      "question_text": "Practical question scenario involving {skill_name}...",
      "options": [
        "A) Option A text",
        "B) Option B text",
        "C) Option C text",
        "D) Option D text"
      ],
      "correct_option_index": 1,
      "explanation": "Option B is correct because...",
      "topic": "Core Architecture / Syntax"
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
                temperature=0.3,
                max_tokens=2500
            )
            data = nemotron_client.extract_json(raw_response)
            if "questions" in data and len(data["questions"]) >= 3:
                return data
            raise ValueError("Incomplete question set returned")
        except Exception as e:
            logger.warning(f"Nemotron assessment generation fallback triggered: {e}")
            return self._heuristic_assessment(skill_name, difficulty)

    def _heuristic_assessment(self, skill_name: str, difficulty: str) -> Dict[str, Any]:
        """High-grade default questions for common skills."""
        s_lower = skill_name.lower()
        if "python" in s_lower:
            questions = [
                {
                    "question_text": "What is the primary difference between a list comprehension and a generator expression in Python?",
                    "options": [
                        "Generator expressions create immutable tuples while list comprehensions create lists",
                        "List comprehensions compute all items immediately in memory, while generator expressions yield items lazily on demand",
                        "Generator expressions cannot be iterated over using a for-loop",
                        "List comprehensions are strictly faster in memory-constrained environments"
                    ],
                    "correct_option_index": 1,
                    "explanation": "Generator expressions evaluate lazily, producing one item at a time using the iterator protocol, minimizing peak memory usage.",
                    "topic": "Memory & Iterators"
                },
                {
                    "question_text": "In Python, which built-in decorator is typically used to create a managed attribute with getter and setter methods?",
                    "options": [
                        "@staticmethod",
                        "@classmethod",
                        "@property",
                        "@dataclass"
                    ],
                    "correct_option_index": 2,
                    "explanation": "@property allows defining getter, setter, and deleter methods for clean attribute encapsulation.",
                    "topic": "OOP & Properties"
                },
                {
                    "question_text": "How does the Global Interpreter Lock (GIL) primarily impact Python programs?",
                    "options": [
                        "It prevents asynchronous event loops from running",
                        "It restricts execution of Python bytecode to a single thread at any given moment, affecting CPU-bound multi-threading",
                        "It prevents multiple processes from executing simultaneously",
                        "It automatically garbage collects circular object references"
                    ],
                    "correct_option_index": 1,
                    "explanation": "The GIL ensures only one native thread runs Python bytecode at a time, making multiprocessing preferable for CPU-bound tasks.",
                    "topic": "Concurrency & GIL"
                },
                {
                    "question_text": "What is the time complexity of searching for a key in a Python dictionary with a good hash distribution?",
                    "options": [
                        "O(n)",
                        "O(log n)",
                        "O(1) average time",
                        "O(n log n)"
                    ],
                    "correct_option_index": 2,
                    "explanation": "Python dictionaries use hash tables, providing average O(1) time complexity for key lookup and insertion.",
                    "topic": "Data Structures & Complexity"
                },
                {
                    "question_text": "Which module in Python's standard library provides cooperative multitasking using an event loop and async/await syntax?",
                    "options": [
                        "threading",
                        "multiprocessing",
                        "asyncio",
                        "concurrent.futures"
                    ],
                    "correct_option_index": 2,
                    "explanation": "asyncio is Python's standard framework for asynchronous I/O and coroutine execution via an event loop.",
                    "topic": "Asynchronous Programming"
                }
            ]
        elif "react" in s_lower:
            questions = [
                {
                    "question_text": "In React 18, what is the purpose of the `useMemo` hook?",
                    "options": [
                        "To memoize a callback function definition between renders",
                        "To memoize and cache the calculated result of an expensive calculation between renders",
                        "To directly manipulate real DOM elements without re-rendering",
                        "To perform side effects after every paint cycle"
                    ],
                    "correct_option_index": 1,
                    "explanation": "useMemo caches the result of an expensive computation across renders until its dependency array changes.",
                    "topic": "Performance & Hooks"
                },
                {
                    "question_text": "Why should keys passed to items rendered in a list be unique and stable rather than array indices?",
                    "options": [
                        "Indices cannot be converted to strings in JSX",
                        "Using indices can lead to incorrect component state and poor diffing performance when lists are re-ordered or filtered",
                        "React throws a fatal runtime exception if an index is passed as key",
                        "Keys determine CSS specificity in rendered nodes"
                    ],
                    "correct_option_index": 1,
                    "explanation": "React uses keys to identify which items have changed, been added, or removed. Index keys cause state mismatch when items re-order.",
                    "topic": "Reconciliation & Lists"
                },
                {
                    "question_text": "What happens when you call a state updater function with the previous state (e.g., `setCount(prev => prev + 1)`)?",
                    "options": [
                        "It forces a synchronous DOM update immediately",
                        "It guarantees the updater receives the most current state value regardless of batched updates",
                        "It creates a detached closure that ignores state changes",
                        "It creates a new component instance"
                    ],
                    "correct_option_index": 1,
                    "explanation": "The functional updater pattern ensures access to the pending, accurate state value during batched renders.",
                    "topic": "State Updates"
                },
                {
                    "question_text": "When does the cleanup function in a `useEffect` hook execute?",
                    "options": [
                        "Only when the browser window closes",
                        "Before the component unmounts and before the effect re-runs on dependency changes",
                        "Immediately before every DOM render starts",
                        "Never, unless explicitly triggered by error boundaries"
                    ],
                    "correct_option_index": 1,
                    "explanation": "Effect cleanups run prior to re-execution on new dependency values and when the component unmounts.",
                    "topic": "Lifecycle & Effects"
                },
                {
                    "question_text": "What is the primary benefit of React Server Components (RSC)?",
                    "options": [
                        "They allow running client-side event handlers directly on the server",
                        "They execute solely on the server, sending zero client bundle JavaScript for server components",
                        "They replace Redux and Context API entirely",
                        "They prevent CSS styles from loading"
                    ],
                    "correct_option_index": 1,
                    "explanation": "RSCs execute only on the server and stream UI without adding to the client-side JavaScript bundle footprint.",
                    "topic": "Modern React Architecture"
                }
            ]
        else:
            # Generic technical assessment questions for the specified skill
            questions = [
                {
                    "question_text": f"What is a core architectural principle when implementing {skill_name} in a production environment?",
                    "options": [
                        "Hardcode configuration parameters inside application logic",
                        "Isolate components, utilize configuration externalization, and implement comprehensive error boundaries",
                        "Avoid automated tests in order to accelerate deployment velocity",
                        "Use single-threaded synchronous processing for all network calls"
                    ],
                    "correct_option_index": 1,
                    "explanation": "Modern architectural standards emphasize separation of concerns, environment-driven configuration, and structured fault handling.",
                    "topic": "Architecture & Best Practices"
                },
                {
                    "question_text": f"Which approach is best practice when debugging high latency or unexpected errors in {skill_name}?",
                    "options": [
                        "Restart the host system without inspecting traces",
                        "Check structured telemetry logs, execution metrics, and isolate failing input parameters",
                        "Disable validation checks to see if throughput increases",
                        "Ignore error codes if the overall response status is 200"
                    ],
                    "correct_option_index": 1,
                    "explanation": "Structured logging and observability metrics enable engineers to identify root causes and bottlenecks precisely.",
                    "topic": "Debugging & Observability"
                },
                {
                    "question_text": f"How should sensitive secrets or credentials be handled when working with {skill_name}?",
                    "options": [
                        "Commit them into public source control repositories for team convenience",
                        "Store them in encrypted environment variables or dedicated secret management vaults",
                        "Encode them with Base64 in frontend JavaScript bundles",
                        "Print them to client browser consoles"
                    ],
                    "correct_option_index": 1,
                    "explanation": "Credentials must always be stored in secret managers or environment variables, never committed or exposed in clients.",
                    "topic": "Security"
                },
                {
                    "question_text": f"What is the recommended strategy for ensuring long-term maintainability when developing with {skill_name}?",
                    "options": [
                        "Write self-documenting code, unit test critical paths, and use continuous integration",
                        "Rely exclusively on manual testing prior to releases",
                        "Avoid refactoring working legacy codebases",
                        "Combine all functions into a single monolithic script"
                    ],
                    "correct_option_index": 0,
                    "explanation": "Automated testing, clean modular code, and CI pipelines guarantee reliable regressions and long-term code health.",
                    "topic": "Maintainability & Testing"
                },
                {
                    "question_text": f"When scaling systems that utilize {skill_name}, what is the primary consideration?",
                    "options": [
                        "Horizontal scaling with stateless services and appropriate caching layers",
                        "Deploying to a single larger machine indefinitely",
                        "Eliminating all database indices to save memory",
                        "Running without timeouts or rate limits"
                    ],
                    "correct_option_index": 0,
                    "explanation": "Stateless horizontal scaling and caching layers ensure reliable distributed performance under peak traffic.",
                    "topic": "Scalability"
                }
            ]

        return {
            "skill_name": skill_name,
            "difficulty": difficulty,
            "total_questions": len(questions),
            "questions": questions
        }

    async def evaluate_attempt(
        self,
        skill_name: str,
        questions: List[Dict[str, Any]],
        submitted_answers: Dict[str, int]
    ) -> Dict[str, Any]:
        """Calculates score, identifies weak topics, and generates personalized feedback."""
        total = len(questions)
        correct_count = 0
        weak_topics = []

        for idx, q in enumerate(questions):
            q_id = str(idx)
            chosen = submitted_answers.get(q_id)
            correct = q.get("correct_option_index", 0)
            topic = q.get("topic", "General Concept")

            if chosen is not None and int(chosen) == correct:
                correct_count += 1
            else:
                if topic not in weak_topics:
                    weak_topics.append(topic)

        score_pct = round((correct_count / max(total, 1)) * 100, 1)
        passed = score_pct >= 70.0

        feedback = (
            f"You scored {correct_count}/{total} ({score_pct}%). "
            + ("Excellent performance! You demonstrated solid mastery of core concepts." if passed
               else f"Keep practicing. Focus especially on: {', '.join(weak_topics) if weak_topics else 'core foundations'}.")
        )

        return {
            "score": score_pct,
            "total_points": 100,
            "correct_count": correct_count,
            "total_questions": total,
            "passed": passed,
            "weak_topics": weak_topics,
            "ai_feedback": feedback
        }

assessment_agent = AssessmentAgent()
