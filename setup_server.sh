#!/bin/bash
set -e

echo "=== 1. System Optimization: Setting up 32GB Swap ==="
# Check if swapfile exists
if [ -f /swapfile ]; then
    echo "Swapfile already exists. Skipping."
else
    echo "Creating 32GB Allocating /swapfile... (This may take a minute)"
    sudo fallocate -l 32G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "Swap enabled!"
fi

echo "=== 2. Installing System Dependencies ==="
sudo apt-get update && sudo apt-get install -y libgl1-mesa-glx git python3-venv

echo "=== 3. Setting up ComfyUI ==="
cd ~/image-gen
if [ -d "ComfyUI" ]; then
    echo "ComfyUI already exists."
else
    git clone https://github.com/comfyanonymous/ComfyUI
fi

cd ComfyUI
# Use uv for faster install if available, else pip
if command -v uv &> /dev/null; then
    uv pip install -r requirements.txt --system
else
    pip install -r requirements.txt
fi

echo "=== 4. Installing Custom Nodes (GGUF Support) ==="
cd custom_nodes
if [ -d "ComfyUI-GGUF" ]; then
    echo "ComfyUI-GGUF already exists."
else
    git clone https://github.com/city96/ComfyUI-GGUF
fi
cd ..

echo "=== 5. Downloading Optimized Models ==="
mkdir -p models/checkpoints
mkdir -p models/unet
mkdir -p models/vae
mkdir -p models/clip

# Ensure hugginface-cli is installed
pip install -U "huggingface_hub[cli]"

echo "Downloading Flux 1 Schnell (FP8) - Using verify_models.py logic for 4B equivalent..."
# Note: Flux 4B (Klein) might not have a direct Comfy checkpoint yet, using standard Flux Schnell FP8 as best 4-step alternative for Comfy
huggingface-cli download Comfy-Org/flux1-schnell --include "flux1-schnell-fp8.safetensors" --local-dir models/checkpoints

echo "Downloading Qwen Image Edit (GGUF) - ~7GB..."
# Downloading Qwen 2.5 VL / Image Edit GGUF
# Targeting a reliable GGUF quant (Q4_K_M)
huggingface-cli download city96/Qwen2.5-VL-7B-Instruct-gguf --include "Qwen2.5-VL-7B-Instruct-Q4_K_M.gguf" --local-dir models/unet

echo "=== Setup Complete! ==="
echo "You can now run ComfyUI with: python main.py --listen 0.0.0.0 --port 8188"
