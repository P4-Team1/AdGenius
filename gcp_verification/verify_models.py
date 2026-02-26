import torch
import os
from diffusers import FluxPipeline
from transformers import AutoModelForCausalLM, AutoTokenizer
from PIL import Image
import gc

def print_memory():
    if torch.cuda.is_available():
        free, total = torch.cuda.mem_get_info()
        print(f"[Memory] Free: {free/1024**3:.2f} GB | Total: {total/1024**3:.2f} GB")
    else:
        print("[Memory] CUDA not available.")

def verify_environment():
    print("=== 1. Environment Check ===")
    print(f"PyTorch Version: {torch.__version__}")
    if torch.cuda.is_available():
        print(f"CUDA Available: Yes")
        print(f"GPU: {torch.cuda.get_device_name(0)}")
        print_memory()
    else:
        print("CUDA NOT Available! Please check drivers.")
        return False
    return True

def test_flux_model(candidates):
    print("\n=== 2. Testing Flux 2 [klein] ===")

    for model_id, desc in candidates:
        print(f"\nAttempting to load: {model_id} [{desc}]...")
        try:
            # Use the specific pipeline for Flux 2 Klein
            from diffusers import Flux2KleinPipeline
        except ImportError:
            print("ERROR: Flux2KleinPipeline not found! You must install diffusers from git.")
            print("Run: uv pip install git+https://github.com/huggingface/diffusers.git")
            return

        try:
            print(f"Loading {desc}...")
            # For Flux 9B (~18GB), System RAM (16GB) is smaller than VRAM (24GB).
            # We MUST load directly to GPU and avoid CPU offloading to prevent OOM.
            pipe = Flux2KleinPipeline.from_pretrained(
                model_id, 
                torch_dtype=torch.bfloat16, 
                token=os.getenv("HF_TOKEN")
            )
            # CRITICAL: Do NOT use cpu_offload. Your 24GB VRAM > 16GB RAM.
            # Keep everything on GPU.
            pipe.to("cuda") 
            
            print(f"SUCCESS: {desc} loaded to GPU!")
            print_memory()
            
            print(f"Generating test image with {desc}...")
            # User requested specific prompt with Korean text
            prompt = (
                "A professional advertising poster for a coffee shop. "
                "A glass of iced latte on a wooden table. "
                "Neon sign text '오픈 세일' in the background. "
                "High quality, 8k, photorealistic"
            )
            image = pipe(
                prompt=prompt, 
                num_inference_steps=4, # Increased steps for better text quality
                guidance_scale=1.0, # Increased for better text adherence
                height=1024, 
                width=1024
            ).images[0]
            image.save(f"test_flux_{desc.split()[0]}.png")
            print(f"Saved 'test_flux_{desc.split()[0]}.png'")
            
            # Application Decision: 
            # If 9B works and memory is okay, we prefer it.
            # But for this test, we just want to see if it works.
            del pipe
            gc.collect()
            torch.cuda.empty_cache()
            # return # REMOVED: Continue to test next model (9B) even if 4B succeeds
            
        except Exception as e:
            print(f"Failed to load {desc}: {e}")
            print("Trying next candidate...")

    print("Flux testing complete.")

def test_qwen_model():
    print("\n=== 3. Testing Qwen Image Edit 2511 (High Consistency) ===")
    model_id = "Qwen/Qwen-Image-Edit-2511"
    
    # Check if input image exists
    input_image_path = "image3.png"
    if not os.path.exists(input_image_path):
        print(f"WARNING: '{input_image_path}' not found! Skipping Qwen inference test.")
        print("Please upload 'image3.png' to the same folder to test editing.")
        return

    print(f"Loading {model_id}...")
    try:
        # Use the specific pipeline for Qwen Image Edit
        from diffusers import QwenImageEditPlusPipeline
        
        pipe = QwenImageEditPlusPipeline.from_pretrained(
            model_id,
            torch_dtype=torch.bfloat16, # Use bfloat16 as requested (Best for L4)
            trust_remote_code=True
        )
        pipe.to("cuda")
        
        print("Model loaded successfully!")
        print_memory()
        
        print("Running Qwen Edit Inference...")
        # Load input image
        image_input = Image.open(input_image_path).convert("RGB")
        
        # User requested prompt
        prompt = "Replace the coffee in the glass with a creamy strawberry latte featuring fresh strawberry slices on top and red strawberry syrup swirls."
        
        # Qwen Edit requires specific inputs format based on your snippet
        # If it's single image edit, usually we pass just that image.
        # But based on the snippet: "image": [image1, image2]... if we have 1 input, maybe just [image_input]?
        # Let's try passing just the image object first, if pipeline supports standard call.
        # However, custom pipeline might want dict. Let's try standard call first which is safer if it's diffusers compatible.
        # Actually, let's follow the snippet structure roughly but for 1 image.
        
        print("Running Qwen Edit Inference...")
        # Load input image
        image_input = Image.open(input_image_path).convert("RGB")
        
        # User requested prompt
        prompt = "Replace the coffee in the glass with a creamy strawberry latte featuring fresh strawberry slices on top and red strawberry syrup swirls."
        
        # Parameters based on user's provided example/best practices
        inputs = {
            "image": [image_input], # Passing as list based on example
            "prompt": prompt,
            "generator": torch.manual_seed(42),
            "true_cfg_scale": 4.0, # Specific to Qwen Edit (controls prompt adherence separately)
            "negative_prompt": " ", # Standard negative prompt
            "num_inference_steps": 40, # Standard for editing
            "guidance_scale": 1.0, # Base guidance
            "num_images_per_prompt": 1,
        }
        
        # Use torch.inference_mode() to save VRAM and speed up (no gradients)
        with torch.inference_mode():
            output = pipe(**inputs)
            output_image = output.images[0]
            output_image.save("output_qwen_strawberry.png")
            print(f"Success! Saved 'output_qwen_strawberry.png' at {os.path.abspath('output_qwen_strawberry.png')}")
        
        # Cleanup
        del pipe
        gc.collect()
        torch.cuda.empty_cache()
        
    except Exception as e:
        print(f"FAILED to run Qwen Edit: {e}")
        print("Note: Qwen Image Edit 2511 might require specific input format. Check if input_image.png is valid.")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Verify specific models on GCP L4.")
    parser.add_argument("--model", type=str, default="all", choices=["flux-4b", "flux-9b", "qwen", "all"], 
                        help="Choose which model to verify. Run individually to avoid OOM.")
    args = parser.parse_args()

    if verify_environment():
        print(f"\nNOTE: Verification Mode: {args.model.upper()}")
        print("Ensure you have set your HuggingFace Token: export HF_TOKEN='your_token'")
        
        # Flux 4B
        if args.model in ["flux-4b", "all"]:
            # Only run 4B
            candidates = [("black-forest-labs/FLUX.2-klein-4B", "4B (High Speed)")]
            test_flux_model(candidates)
            
        # Flux 9B (Separate run recommended)
        if args.model in ["flux-9b", "all"]:
            candidates = [("black-forest-labs/FLUX.2-klein-9B", "9B (High Quality)")]
            test_flux_model(candidates)

        # Qwen
        if args.model in ["qwen", "all"]:
            test_qwen_model()
            
        print("\n=== Verification Complete ===")
