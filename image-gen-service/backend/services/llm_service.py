from openai import OpenAI
from .config import Config

class LLMService:
    def __init__(self):
        self.client = OpenAI(api_key=Config.OPENAI_API_KEY)

    def expand_prompt(self, user_input: str) -> dict:
        """
        Takes a short user input and returns a dictionary with:
        - refined_prompt: Detailed prompt for Flux/Qwen
        - ad_copy: Creative ad copy text
        """
        system_prompt = (
            "You are an expert AI Ad Campaign Manager. "
            "Your goal is to take a simple product description and generate two things:\n"
            "1. A highly detailed, photorealistic image generation prompt for Flux AI. "
            "Focus on lighting, texture, composition, and high-quality keywords (4k, cinematic).\n"
            "2. A catchy, short advertising copy (1-2 sentences) in Korean suitable for Instagram.\n\n"
            "Return the result in JSON format with keys: 'image_prompt' and 'ad_copy'."
        )
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini", # Cost-effective and smart enough
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_input}
                ],
                response_format={"type": "json_object"}
            )
            content = response.choices[0].message.content
            import json
            return json.loads(content)
        except Exception as e:
            print(f"LLM Error: {e}")
            # Fallback if LLM fails
            return {
                "image_prompt": f"High quality photo of {user_input}, professional lighting, 4k",
                "ad_copy": f"{user_input} - 지금 만나보세요!"
            }

llm_service = LLMService()
