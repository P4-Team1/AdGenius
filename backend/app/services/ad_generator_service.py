"""
광고 생성 서비스 - Flux 기반 이미지 생성 및 LLM 통합
"""
import logging
import time
from pathlib import Path
from typing import Dict, Any, Optional
import aiofiles

logger = logging.getLogger(__name__)

class AdGeneratorService:
    """
    Flux 기반 광고 생성 서비스
    - LLM을 통한 프롬프트 최적화 및 광고 문구 생성
    - Flux 모델을 통한 이미지 생성
    - 비동기 처리
    """
    
    def __init__(self):
        """광고 생성 서비스 초기화"""
        self.base_path = Path(__file__).parent.parent.parent  # backend/
        self.outputs_dir = self.base_path / "outputs" / "txt2images"
        self.outputs_dir.mkdir(parents=True, exist_ok=True)
        
        logger.info("✅ AdGeneratorService 초기화 완료")
    
    async def generate_image(
        self, 
        prompt_text: str, 
        text_in_image: Optional[str], 
        ad_description: str, 
        store_id: int, 
        project_id: int, 
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        이미지 생성 메인 메서드
        
        Args:
            prompt_text: 생성할 이미지의 묘사 (image_prompt)
            text_in_image: 이미지 안의 텍스트 (선택)
            ad_description: 광고할 제품/가게 설명 (ad_description)
            store_id: 가게 ID (저장 경로용)
            project_id: 프로젝트 ID (저장 경로용)
            params: 추가 파라미터 (seed, steps, cfg, width, height, negative_prompt 등)
            
        Returns:
            생성된 이미지 파일의 경로와 LLM 결과를 포함한 딕셔너리
            {
                "image_path": str,
                "optimized_prompt": str,
                "ad_copy": str
            }
        """
        start_time = time.time()
        
        try:
            # 1. LLM을 통한 프롬프트 최적화 (이미지 묘사만 사용)
            from app.services.llm_service import llm_service
            optimized_prompt = await llm_service.optimize_prompt(prompt_text, text_in_image)
            logger.info(f"🧠 이미지 프롬프트 최적화 완료: {optimized_prompt[:50]}...")
            
            # 2. LLM을 통한 광고 문구 생성
            ad_copy = await llm_service.generate_ad_copy(ad_description)
            logger.info(f"✍️ 광고 문구 생성 완료: {ad_copy[:50]}...")
            
            # 3. 파라미터 준비
            if params is None:
                params = {}
            
            # Flux 모델 파라미터 추출
            width = params.get('width', 1024)
            height = params.get('height', 1024)
            seed = params.get('seed', None)
            steps = params.get('steps', 4)  # Flux Schnell은 4스텝 권장
            
            # 4. Flux 모델로 이미지 생성
            from app.services.flux_service import flux_service
            image_result = await flux_service.generate_image(
                prompt=optimized_prompt,
                width=width,
                height=height,
                num_inference_steps=steps,
                guidance_scale=0.0,  # Flux Schnell은 0.0 권장
                seed=seed,
                store_id=store_id,
                project_id=project_id
            )
            
            image_path = image_result.get("image_path")
            
            # 5. 결과 반환
            result = {
                "image_path": image_path,
                "optimized_prompt": optimized_prompt,
                "ad_copy": ad_copy
            }
            
            generation_time = int(time.time() - start_time)
            logger.info(f"✅ 광고 생성 완료 (소요 시간: {generation_time}초)")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ 광고 생성 실패: {e}")
            return {
                "image_path": None,
                "optimized_prompt": None,
                "ad_copy": None
            }

# 전역 서비스 인스턴스
ad_generator_service = AdGeneratorService()
