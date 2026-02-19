"""
Flux 이미지 생성 서비스 - Diffusers 기반 In-App 생성
"""
import logging
import os
import uuid
import torch
from pathlib import Path
from typing import Optional
from PIL import Image
from diffusers import FluxPipeline
from app.core.config import settings

logger = logging.getLogger(__name__)

class FluxService:
    """Flux 이미지 생성 서비스 클래스 (Diffusers 기반)"""
    
    def __init__(self):
        """Flux 서비스 초기화"""
        self.pipe = None
        self.base_path = settings.BASE_DIR
        self.outputs_dir = self.base_path / "outputs" / "txt2img"
        self.outputs_dir.mkdir(parents=True, exist_ok=True)
        
        logger.info("✅ Flux 서비스 초기화 완료 (Diffusers 기반)")
    
    def _load_model(self):
        """
        Flux 모델 로드 (Lazy Loading)
        
        최초 실행 시 HuggingFace에서 모델을 자동 다운로드합니다.
        NF4 양자화 버전을 사용하여 VRAM 사용량을 75% 감소시킵니다.
        """
        if self.pipe is None:
            try:
                logger.info("🔄 Flux 모델 로딩 시작...")
                self.pipe = FluxPipeline.from_pretrained(
                    "Keffisor21/flux1-schnell-bnb-nf4",  # NF4 양자화 버전
                    torch_dtype=torch.bfloat16
                )
                # VRAM 절약을 위해 CPU 오프로드 활성화
                self.pipe.enable_model_cpu_offload()
                logger.info("✅ Flux 모델 로딩 완료 (NF4 양자화 + CPU 오프로드)")
            except Exception as e:
                logger.error(f"❌ Flux 모델 로딩 실패: {e}")
                raise
    
    async def generate_image(
        self,
        prompt: str,
        width: int = 1024,
        height: int = 1024,
        steps: int = 4,
        seed: Optional[int] = None
    ) -> dict:
        """
        Diffusers로 이미지 생성
        
        Args:
            prompt: 생성할 이미지 프롬프트 (영문 권장)
            width: 이미지 너비 (기본값: 1024, 8의 배수 권장)
            height: 이미지 높이 (기본값: 1024, 8의 배수 권장)
            steps: 추론 스텝 수 (기본값: 4, schnell 모델은 1-4 권장)
            seed: 시드 값 (선택사항, 재현성을 위해 사용)
            
        Returns:
            dict: 생성된 이미지 정보
            {
                "image_path": str,  # 순수 파일명 (flux_xxxx.png)
                "width": int,       # 이미지 너비
                "height": int,      # 이미지 높이
                "steps": int,       # 사용된 스텝 수
                "prompt": str,      # 사용된 프롬프트
                "success": bool     # 성공 여부
            }
        """
        try:
            # 모델 로드
            self._load_model()
            
            logger.info(f"🎨 이미지 생성 시작: {prompt[:50]}...")
            
            # 이미지 생성
            generator = None
            if seed is not None:
                generator = torch.Generator("cpu").manual_seed(seed)
            
            result = self.pipe(
                prompt,
                guidance_scale=0.0,  # schnell 모델은 0.0 권장
                num_inference_steps=steps,
                max_sequence_length=256,  # T5 인코더가 256 토큰까지 처리하도록 명시
                height=height,
                width=width,
                generator=generator
            )
            
            # 이미지 저장
            image = result.images[0]
            filename = f"flux_{uuid.uuid4().hex[:8]}.png"
            save_path = self.outputs_dir / filename
            
            # 이미지 파일로 저장
            image.save(save_path, "PNG")
            
            logger.info(f"✅ 이미지 생성 완료: {filename}")
            
            return {
                "image_path": filename,  # 순수 파일명만 반환
                "width": width,
                "height": height,
                "steps": steps,
                "prompt": prompt,
                "success": True
            }
            
        except Exception as e:
            logger.error(f"❌ 이미지 생성 실패: {e}")
            return {
                "image_path": None,
                "error": str(e),
                "width": width,
                "height": height,
                "steps": steps,
                "prompt": prompt,
                "success": False
            }

# 전역 Flux 서비스 인스턴스
flux_service = FluxService()
