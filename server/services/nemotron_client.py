import os
import re
import json
import logging
import asyncio
from typing import List, Dict, Any, Optional
from openai import OpenAI
from server.config import settings

logger = logging.getLogger("nemotron_client")

class NemotronClient:
    def __init__(self):
        self.api_key = settings.nvidia_api_key
        self.base_url = settings.nvidia_base_url
        self.model = settings.nvidia_model
        self._client: Optional[OpenAI] = None

    def get_client(self) -> Optional[OpenAI]:
        # Always check updated env var in case user added it at runtime
        current_key = os.getenv("NVIDIA_API_KEY", self.api_key)
        if not current_key:
            return None
        if not self._client or self.api_key != current_key:
            self.api_key = current_key
            self._client = OpenAI(
                base_url=self.base_url,
                api_key=self.api_key
            )
        return self._client

    @staticmethod
    def clean_output(content: str) -> str:
        """Strips internal reasoning tokens, <thought>...</thought> tags, and reasoning artifacts."""
        if not content:
            return ""
        # Strip <thought> tags
        cleaned = re.sub(r"<thought>.*?</thought>", "", content, flags=re.DOTALL)
        # Strip <think> tags if any
        cleaned = re.sub(r"<think>.*?</think>", "", cleaned, flags=re.DOTALL)
        return cleaned.strip()

    @staticmethod
    def extract_json(content: str) -> Any:
        """Safely parses JSON from LLM markdown code blocks or plain text."""
        cleaned = NemotronClient.clean_output(content)
        # Match json block
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned)
        if match:
            cleaned = match.group(1).strip()
        try:
            return json.loads(cleaned)
        except Exception:
            # If standard json fails, attempt lenient regex match for JSON objects or arrays
            json_match = re.search(r"(\{[\s\S]*\}|\[[\s\S]*\])", cleaned)
            if json_match:
                return json.loads(json_match.group(1))
            raise ValueError(f"Could not parse valid JSON from AI response: {cleaned[:200]}")

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.2,
        top_p: float = 0.7,
        max_tokens: int = 2048,
        retries: int = 3
    ) -> str:
        client = self.get_client()
        if not client:
            raise ValueError(
                "NVIDIA_API_KEY is not configured on the backend. "
                "Please set NVIDIA_API_KEY in server environment."
            )

        last_error = None
        for attempt in range(retries):
            try:
                # Run synchronous OpenAI SDK call in executor thread to not block asyncio event loop
                loop = asyncio.get_event_loop()
                response = await loop.run_in_executor(
                    None,
                    lambda: client.chat.completions.create(
                        model=self.model,
                        messages=messages,
                        temperature=temperature,
                        top_p=top_p,
                        max_tokens=max_tokens,
                    )
                )

                choice = response.choices[0]
                message = choice.message
                raw_content = message.content or ""
                # Ensure reasoning_content is ignored/discarded
                final_answer = self.clean_output(raw_content)
                return final_answer

            except Exception as e:
                last_error = e
                logger.warning(f"Nemotron API error (attempt {attempt + 1}/{retries}): {e}")
                if "rate limit" in str(e).lower() or "429" in str(e):
                    await asyncio.sleep(2 ** (attempt + 1))
                else:
                    await asyncio.sleep(1)

        raise RuntimeError(f"NVIDIA Nemotron API failed after {retries} retries: {last_error}")

nemotron_client = NemotronClient()
