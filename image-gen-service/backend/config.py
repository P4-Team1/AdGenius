import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    HF_TOKEN = os.getenv("HF_TOKEN")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    
    # Model IDs
    FLUX_MODEL_ID = "black-forest-labs/FLUX.2-klein-4B"
    QWEN_MODEL_ID = "Qwen/Qwen-Image-Edit-2511"
    
    # Service Config
    HOST = "0.0.0.0"
    PORT = 8000
