from pydantic import BaseModel
from typing import Optional, List

class GenerationRequest(BaseModel):
    prompt: str
    negative_prompt: Optional[str] = ""
    width: int = 1024
    height: int = 1024
    num_inference_steps: int = 4
    guidance_scale: float = 3.5

class EditRequest(BaseModel):
    image_base64: str
    prompt: str
    negative_prompt: Optional[str] = ""
    num_inference_steps: int = 30
    guidance_scale: float = 7.0

class ImageResponse(BaseModel):
    image_base64: str
    info: str
