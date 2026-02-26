from fastapi import APIRouter, HTTPException
from ..schemas import GenerationRequest, EditRequest, ImageResponse
from ..model_manager import model_manager
from ..services.llm_service import llm_service
import torch
import base64
from io import BytesIO

router = APIRouter()

def encode_image_to_base64(image):
    buffered = BytesIO()
    image.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")

@router.post("/generate", response_model=ImageResponse)
async def generate_image(req: GenerationRequest):
    # 1. Expand Prompt via LLM
    llm_result = llm_service.expand_prompt(req.prompt)
    refined_prompt = llm_result["image_prompt"]
    ad_copy = llm_result["ad_copy"]
    
    print(f"Original: {req.prompt}")
    print(f"Refined: {refined_prompt}")
    
    # 2. Load Flux Model
    try:
        pipe = model_manager.load_model("flux")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model Load Failed: {str(e)}")

    # 3. Generate Image
    try:
        with torch.inference_mode():
            image = pipe(
                prompt=refined_prompt,
                num_inference_steps=req.num_inference_steps,
                guidance_scale=req.guidance_scale,
                height=req.height,
                width=req.width
            ).images[0]
            
        return ImageResponse(
            image_base64=encode_image_to_base64(image),
            info=ad_copy
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation Failed: {str(e)}")

@router.post("/edit", response_model=ImageResponse)
async def edit_image(req: EditRequest):
    # 1. Decode Input Image
    try:
        from PIL import Image
        image_data = base64.b64decode(req.image_base64)
        input_image = Image.open(BytesIO(image_data)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image data")

    # 2. Load Qwen Model
    try:
        pipe = model_manager.load_model("qwen")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model Load Failed: {str(e)}")

    # 3. Edit Image
    try:
        # Qwen Edit requires dictionary inputs or specific call structure verified in verify_models.py
        inputs = {
            "image": [input_image],
            "prompt": req.prompt,
            "generator": torch.manual_seed(42),
            "true_cfg_scale": 4.0, 
            "negative_prompt": req.negative_prompt,
            "num_inference_steps": req.num_inference_steps,
            "guidance_scale": req.guidance_scale,
            "num_images_per_prompt": 1,
        }
        
        with torch.inference_mode():
            output = pipe(**inputs)
            output_image = output.images[0]

        return ImageResponse(
            image_base64=encode_image_to_base64(output_image),
            info="Edited successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Editing Failed: {str(e)}")
