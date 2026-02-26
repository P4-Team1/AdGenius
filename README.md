# 프로젝트 시도 및 실험 내용 요약 (Project Attempts)

## 1. 이미지 모델 검증 및 환경 최적화 시도
16GB 시스템 RAM과 24GB VRAM (GCP L4) 이라는 제한적인 자원 환경에서 무거운 생성형 AI 모델들을 구동하기 위한 여러 최적화를 시도.

*   **Flux 2 Klein 모델 실험 (`verify_models.py`)**:
    *   **4B vs 9B 성능 및 로딩 테스트**: `Flux.2-klein-4B` (빠른 생성) 및 `Flux.2-klein-9B` (고품질) 모델을 각각 로드하여 테스트.
    *   **FP8 양자화 모델 적용**: `Flux.2-klein-9b-fp8` 단일 safetensors 파일을 불러와 모델 용량과 VRAM 사용량을 줄이려는 시도.
    *   **메모리 스왑 방지**: 시스템 RAM보다 VRAM이 큰 한계를 극복하기 위해 `cpu_offload`를 끄고 모델을 바로 `cuda`로 직행(`pipe.to("cuda")`)시켜 OOM(Out of Memory)을 방지하였으나 오히려 CPU RAM 부족 현상 발생.
    *   **bf16 적용**: 연산 속도와 호환성을 위해 `torch.bfloat16` 데이터 타입을 적극 사용.

*   **Qwen 이미지 편집 모델 (Image-to-Image) 검증**:
    *   `Qwen-Image-Edit-2511` 모델을 `QwenImageEditPlusPipeline`으로 로딩하여, 원본 이미지와 텍스트 프롬프트를 바탕으로 특정 영역을 수정하는(예: 커피를 딸기 라떼로 변경) 파이프라인 구축 및 검증.

*   **극한의 메모리 최적화 실험 (`zimage.py`)**:
    *   **Z-Image-Turbo 실험**: 더 적은 메모리 환경을 테스트하기 위해 `Tongyi-MAI/Z-Image-Turbo` 모델을 도입.
    *   **Sequential CPU Offload & VAE Tiling**: RAM 폭발을 막기 위해 파이프라인의 각 구성 요소를 순차적으로 GPU에 올리고 내리는 `enable_sequential_cpu_offload()` 기법과, 고해상도 이미지 처리 시 VRAM 부족을 막는 `enable_vae_tiling()` 기법을 도입하여 구동 안정성 확보.
    *   **Steps 수 최적화**: Turbo/Distilled 모델 특성에 맞춰 4~8 스텝만으로 빠르게 이미지를 생성해내는 구조를 구현.

## 2. 백엔드 아키텍처 및 자원 관리 시도
*   **싱글톤 기반 모델 스위칭 (`model_manager.py`)**:
    *   24GB VRAM 안에 Flux(생성)와 Qwen(편집) 두 거대 모델을 동시에 띄울 수 없다는 점을 파악.
    *   이에 따라 사용자의 요청(`generate` 또는 `edit`)에 맞춰 현재 로드된 모델이 다른 경우, 이전 모델을 삭제(`del self.pipe`)하고 가비지 컬렉터(`gc.collect()`)와 GPU 캐시(`torch.cuda.empty_cache()`)를 명시적으로 비운 뒤 새 모델을 로드하는 **ModelManager 싱글톤 패턴** 구현.

*   **LLM 기반 프롬프트 확장 및 카피라이팅 (`llm_service.py`)**:
    *   사용자가 "여름 느낌 딸기 생과일 주스" 처럼 짧은 키워드만 입력해도, OpenAI `gpt-4o-mini`를 거쳐 **(1) Flux용 세밀한 영문 고화질 프롬프트**와 **(2) 인스타그램용 한글 광고 문구**를 동시에 JSON 형태로 생성하도록 프롬프트 엔지니어링 적용.

*   **FastAPI RESTful API 구성 (`generation.py`)**:
    *   LLM 서비스와 이미지 모델(ModelManager)을 연결하는 `/generate`(생성), `/edit`(수정) 엔드포인트 구축.
    *   메모리를 아끼기 위해 이미지 생성 과정에서는 `torch.inference_mode()`를 적용해 Gradient 계산을 배제.
    *   생성된 PIL 이미지를 Base64 문자열로 인코딩하여 프론트엔드와 통신하는 규격을 확립.

## 3. 프론트엔드 프로토타입 시도
*   **Streamlit UI (`app.py`)**:
    *   사용자가 직관적으로 접근할 수 있도록 2가지 모드("Create Ad", "Edit Ad")를 제공하는 UI 스켈레톤 구성.
    *   서버(FastAPI)와 HTTP POST 통신을 통해 이미지를 Base64로 주고받으며 렌더링하도록 구현.

