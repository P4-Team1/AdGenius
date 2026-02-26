import torch
import gc
import os
from diffusers import DiffusionPipeline

# === 설정 ===
OUTPUT_DIR = "z_image_result"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 광고 텍스트 테스트용 프롬프트
PROMPT = (
    "A professional advertising poster for a coffee shop. "
    "A glass of iced latte on a wooden table. "
    "Neon sign text '오픈 세일' in the background. "
    "High quality, 8k, photorealistic."
)

# 모델 ID (Turbo 버전 선택)
MODEL_ID = "Tongyi-MAI/Z-Image-Turbo"

def flush():
    gc.collect()
    torch.cuda.empty_cache()

def run_z_image():
    print(f"🚀 Z-Image-Turbo 실행 시작 (Model: {MODEL_ID})")
    print(f"📝 Prompt: {PROMPT}\n")

    try:
        print("1. 모델 로딩 중... (시간이 조금 걸립니다)")
        
        # ★ 핵심: 메모리 부족 방지 로딩 설정
        pipe = DiffusionPipeline.from_pretrained(
            MODEL_ID,
            torch_dtype=torch.bfloat16,   # BF16으로 메모리 절약
            trust_remote_code=True,       # ★ 필수: Z-Image는 커스텀 코드를 씁니다
            low_cpu_mem_usage=True,       # ★ 필수: RAM 폭발 방지 (단계별 로딩)
        )

        # ★ 시스템 RAM 16GB 생존 전략: 순차적 CPU 오프로드
        # 모델을 한 번에 GPU에 올리지 않고, 필요한 부분만 올렸다 내립니다.
        pipe.enable_sequential_cpu_offload()
        
        # VAE 타일링 (고해상도 생성 시 VRAM 부족 방지)
        if hasattr(pipe, "enable_vae_tiling"):
            pipe.enable_vae_tiling()

        print("2. 이미지 생성 중... (Turbo 모드)")
        
        # Turbo 모델은 4~8 스텝이면 충분합니다.
        image = pipe(
            prompt=PROMPT,
            num_inference_steps=8,     # Turbo 권장 스텝 (4~8)
            guidance_scale=0.0         # Turbo/Distilled 모델은 보통 0.0 또는 낮은 값 사용
        ).images[0]

        save_path = f"{OUTPUT_DIR}/z_image_turbo.png"
        image.save(save_path)
        print(f"✅ 생성 완료: {save_path}")

    except Exception as e:
        print(f"❌ 실행 실패: {e}")
        if "OutOfMemory" in str(e):
            print("💡 팁: 해상도를 조금 낮추거나(예: height=768, width=768), 다른 앱을 종료하세요.")

    finally:
        if 'pipe' in locals():
            del pipe
        flush()

if __name__ == "__main__":
    run_z_image()