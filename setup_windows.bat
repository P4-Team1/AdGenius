@echo off
echo === 1. Windows Local Setup: Checking Environment ===
echo Make sure you have python and git installed!

echo.
echo === 2. Setting up ComfyUI ===
cd /d %~dp0
if not exist "ComfyUI" (
    git clone https://github.com/comfyanonymous/ComfyUI
) else (
    echo ComfyUI already exists. Skipping clone.
)

cd ComfyUI

echo.
echo === 3. Creating Virtual Environment (uv) ===
if not exist ".venv" (
    uv venv .venv
)
call .venv\Scripts\activate.bat

echo.
echo === 4. Installing ComfyUI dependencies ===
uv pip install -r requirements.txt
uv pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

echo.
echo === 5. Installing Custom Nodes ===
if not exist "custom_nodes" mkdir custom_nodes
cd custom_nodes

if not exist "ComfyUI-GGUF" (
    git clone https://github.com/city96/ComfyUI-GGUF
    echo Installing GGUF node dependencies...
    uv pip install -r ComfyUI-GGUF\requirements.txt
)

if not exist "ComfyUI-Manager" (
    git clone https://github.com/ltdrdata/ComfyUI-Manager.git
)
cd ..

echo.
echo === 6. Downloading Optimized Models for 12GB VRAM ===
if not exist "models\checkpoints" mkdir models\checkpoints
if not exist "models\unet" mkdir models\unet
if not exist "models\vae" mkdir models\vae
if not exist "models\clip" mkdir models\clip

uv pip install huggingface_hub

echo.
echo [1/3] Downloading Flux 2 Klein (4B) or Flux Schnell FP8...
echo (Using huggingface-cli to download to models/checkpoints)
echo Download this manually or use: 
echo huggingface-cli download black-forest-labs/FLUX.2-klein-4B --local-dir models\checkpoints

echo.
echo [2/3] Downloading Qwen 2.5 VL GGUF (For Editing in 12GB VRAM)...
echo huggingface-cli download city96/Qwen2.5-VL-7B-Instruct-gguf --include "Qwen2.5-VL-7B-Instruct-Q4_K_M.gguf" --local-dir models\unet

echo.
echo [3/3] Downloading VAE / CLIP for Flux...
echo huggingface-cli download black-forest-labs/FLUX.1-schnell --include ae.safetensors --local-dir models\vae
echo huggingface-cli download comfyanonymous/flux_text_encoders --include clip_l.safetensors --local-dir models\clip
echo huggingface-cli download comfyanonymous/flux_text_encoders --include t5xxl_fp8_e4m3fn.safetensors --local-dir models\clip

echo.
echo === Setup Complete! ===
echo To run ComfyUI:
echo 1. Open a new terminal in the ComfyUI folder
echo 2. Run: .venv\Scripts\activate
echo 3. Run: python main.py
pause
