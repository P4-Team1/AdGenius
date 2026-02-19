"""
LLM 서비스 - OpenAI API를 통한 프롬프트 최적화 및 광고 문구 생성
"""
import logging
from typing import Optional
from openai import AsyncOpenAI
from app.core.config import settings

logger = logging.getLogger(__name__)

class LLMService:
    """LLM 서비스 클래스"""
    
    def __init__(self):
        """LLM 서비스 초기화"""
        if not settings.OPENAI_API_KEY:
            logger.error("❌ OpenAI API Key가 설정되지 않았습니다.")
            raise ValueError("OpenAI API Key가 필요합니다.")
        
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        logger.info("✅ LLM 서비스 초기화 완료")
    
    async def optimize_prompt(self, image_prompt: str, text_in_image: Optional[str] = None) -> str:
        """
        이미지 프롬프트를 고퀄리티 영어 프롬프트로 최적화
        
        Args:
            image_prompt: 사용자가 입력한 이미지 묘사
            text_in_image: 이미지 안의 텍스트 (선택)
            
        Returns:
            최적화된 영어 프롬프트
        """
        try:
            system_prompt = """
You are a senior AI Art Director for text-to-image prompting.

Generate a JSON object with the following schema:
{
  "prompt": "string (single-line English prompt, comma-separated phrases, include specific text requests inside quotes if present)",
  "style_tags": ["string", "... (0-6)"],
  "aspect_ratio": "string (one of: 1:1, 4:5, 16:9, 9:16)",
  "notes": "string (very short, <= 120 chars, optional guidance like mood/lighting)"
}

Rules:
- Focus on visual content; no marketing copy.
- If user input is vague, fill gaps with reasonable neutral assumptions.
- Avoid generating text/typography in the image.
- CRITICAL: If the user input contains text enclosed in quotes (e.g., '한글'), YOU MUST KEEP IT EXACTLY AS IS in the output prompt. Do not translate quoted text. Example: `signboard saying '맛있는 빵집'`.
"""

            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": image_prompt}
                ],
                max_completion_tokens=1000,
                temperature=1
            )
            
            raw_response = response.choices[0].message.content
            logger.info(f"🔍 Raw LLM Response (optimize_prompt): {raw_response}")
            
            # JSON 마크다운 제거
            cleaned_response = raw_response.strip()
            if cleaned_response.startswith('```json'):
                cleaned_response = cleaned_response[7:]  # ```json 제거
            if cleaned_response.endswith('```'):
                cleaned_response = cleaned_response[:-3].strip()  # ``` 제거
            
            logger.info(f"🔍 Cleaned Response: {cleaned_response}")
            
            # JSON 파싱 시도
            try:
                import json
                parsed_json = json.loads(cleaned_response)
                # JSON에서 prompt 필드 추출
                if isinstance(parsed_json, dict) and 'prompt' in parsed_json:
                    base_prompt = parsed_json['prompt']
                    # text_in_image가 있으면 앞에 추가
                    if text_in_image and text_in_image.strip():
                        optimized_prompt = f"the big sign says '{text_in_image.strip()}' in stylish Korean calligraphy, {base_prompt}"
                    else:
                        optimized_prompt = base_prompt
                else:
                    optimized_prompt = cleaned_response
            except json.JSONDecodeError as json_e:
                logger.warning(f"⚠️ JSON 파싱 실패, 원본 입력과 텍스트 조합: {json_e}")
                # 파싱 실패 시 원본 입력과 텍스트 조합
                if text_in_image and text_in_image.strip():
                    optimized_prompt = f"the big sign says '{text_in_image.strip()}' in stylish Korean calligraphy, {image_prompt}"
                else:
                    optimized_prompt = image_prompt
            
            logger.info(f"✅ 프롬프트 최적화 완료: {optimized_prompt[:50]}...")
            return optimized_prompt
            
        except Exception as e:
            logger.error(f"❌ 프롬프트 최적화 실패: {e}")
            return image_prompt  # 실패 시 원본 반환
    
    async def generate_ad_copy(self, ad_description: str, platform: str = "instagram") -> str:
        """
        광고 내용을 바탕으로 이모지, 해시태그가 포함된 매력적인 인스타 게시글 작성
        
        Args:
            ad_description: 광고할 제품/가게 설명
            platform: 플랫폼 종류 (기본값: instagram)
            
        Returns:
            생성된 광고 문구
        """
        try:
            system_prompt = """
You are a Korean SNS copywriter specializing in small business Instagram posts.

Generate a JSON object with the following schema:
{
  "platform": "instagram",
  "hook": "string (1 sentence)",
  "caption": "string (2-5 sentences, natural Korean)",
  "cta": "string (1 sentence, action-oriented)",
  "emojis": ["string", "... (2-6 total)"],
  "hashtags": ["string", "... (3-5 total, without #)"]
}

Rules:
- Do not invent unverifiable facts (price/address/awards/certifications) unless provided by the user.
- No exaggerated or guaranteed claims.
- Keep total length of (hook + caption + cta) around 250–600 Korean characters.
- Hashtags: relevant, specific, no spammy repeats.
- Emojis must appear in the text naturally.
"""

            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": ad_description}
                ],
                max_completion_tokens=1000,
                temperature=1
            )
            
            raw_response = response.choices[0].message.content
            logger.info(f"🔍 Raw LLM Response (generate_ad_copy): {raw_response}")
            
            # JSON 마크다운 제거
            cleaned_response = raw_response.strip()
            if cleaned_response.startswith('```json'):
                cleaned_response = cleaned_response[7:]  # ```json 제거
            if cleaned_response.endswith('```'):
                cleaned_response = cleaned_response[:-3].strip()  # ``` 제거
            
            logger.info(f"🔍 Cleaned Response: {cleaned_response}")
            
            # JSON 파싱 시도
            try:
                import json
                parsed_json = json.loads(cleaned_response)
                # JSON에서 필드 추출하여 자연스러운 한국어 문구 생성
                if isinstance(parsed_json, dict):
                    hook = parsed_json.get('hook', '')
                    caption = parsed_json.get('caption', '')
                    cta = parsed_json.get('cta', '')
                    emojis = parsed_json.get('emojis', [])
                    hashtags = parsed_json.get('hashtags', [])
                    
                    # 자연스러운 인스타그램 게시글 조합
                    parts = []
                    if hook:
                        parts.append(hook)
                    if caption:
                        parts.append(caption)
                    if cta:
                        parts.append(cta)
                    
                    ad_copy = '\n\n'.join(parts)
                    
                    # 해시태그 추가
                    if hashtags:
                        hashtag_str = ' #' + ' #'.join(hashtags)
                        ad_copy += hashtag_str
                    
                    logger.info(f"✅ 광고 문구 생성 완료: {ad_copy[:50]}...")
                    return ad_copy
                else:
                    ad_copy = cleaned_response
            except json.JSONDecodeError as json_e:
                logger.warning(f"⚠️ JSON 파싱 실패, 원본 응답 사용: {json_e}")
                ad_copy = cleaned_response
            
            logger.info(f"✅ 광고 문구 생성 완료: {ad_copy[:50]}...")
            return ad_copy
            
        except Exception as e:
            logger.error(f"❌ 광고 문구 생성 실패: {e}")
            return f"📝 {ad_description} #광고 #마케팅"  # 실패 시 기본 문구 반환

# 전역 LLM 서비스 인스턴스
llm_service = LLMService()
