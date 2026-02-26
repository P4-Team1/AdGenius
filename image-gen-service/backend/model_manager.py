import torch
import gc
from diffusers import Flux2KleinPipeline, QwenImageEditPlusPipeline
from .config import Config

class ModelManager:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelManager, cls).__new__(cls)
            cls._instance.current_model_type = None
            cls._instance.pipe = None
        return cls._instance

    def load_model(self, model_type: str):
        """
        Loads the requested model type ('flux' or 'qwen').
        Unloads the current model if it's different to save VRAM.
        """
        if self.current_model_type == model_type:
            return self.pipe

        # Unload previous model
        if self.pipe is not None:
            print(f"Unloading {self.current_model_type}...")
            del self.pipe
            self.pipe = None
            gc.collect()
            torch.cuda.empty_cache()

        print(f"Loading {model_type}...")
        
        if model_type == 'flux':
            self.pipe = Flux2KleinPipeline.from_pretrained(
                Config.FLUX_MODEL_ID,
                torch_dtype=torch.bfloat16,
                token=Config.HF_TOKEN
            )
            self.pipe.to("cuda") # Direct GPU load (assuming 24GB VRAM)
            
        elif model_type == 'qwen':
            self.pipe = QwenImageEditPlusPipeline.from_pretrained(
                Config.QWEN_MODEL_ID,
                torch_dtype=torch.bfloat16,
                trust_remote_code=True
            )
            # Qwen needs special handling or direct GPU load
            self.pipe.to("cuda")

        self.current_model_type = model_type
        return self.pipe

model_manager = ModelManager()
