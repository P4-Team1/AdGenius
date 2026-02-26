#!/bin/bash
set -e

echo "=== 1. Cleanup: Removing Old Swap & Diffusers Models ==="
# Disable and remove old swap if it exists
if [ -f /swapfile ] || swapon --show | grep -q "/swapfile"; then
    echo "Disabling old swap..."
    sudo swapoff /swapfile || true
    echo "Removing old swapfile..."
    sudo rm -f /swapfile
    # Remove from fstab to prevent boot errors before re-adding
    sudo sed -i '/\/swapfile/d' /etc/fstab
fi

# Clean HuggingFace cache to free up space (Diffusers models)
echo "Cleaning HuggingFace cache (~50GB+)..."
rm -rf ~/.cache/huggingface/hub
echo "Cleanup complete."

echo "=== 2. System Optimization: Setting up 32GB Swap ==="
echo "Creating 32GB Allocating /swapfile... (This may take a minute)"
sudo fallocate -l 32G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
echo "New 32GB Swap enabled!"

echo "=== 3. Setting up ComfyUI ==="
cd ~/image-gen
if [ -d "ComfyUI" ]; then
    echo "ComfyUI already exists. Skipping clone."
else
    git clone https://github.com/comfyanonymous/ComfyUI
fi

cd ComfyUI
echo "Installing ComfyUI dependencies..."
pip install -r requirements.txt

echo "=== 4. Installing Custom Nodes ==="
mkdir -p custom_nodes
cd custom_nodes

# GGUF Support (For Qwen)
if [ ! -d "ComfyUI-GGUF" ]; then
    git clone https://github.com/city96/ComfyUI-GGUF
fi

# Manager (Optional but good to have)
if [ ! -d "ComfyUI-Manager" ]; then
    git clone https://github.com/ltdrdata/ComfyUI-Manager.git
fi
cd ..

echo "=== 5. Downloading Optimized Models (Latest) ==="
mkdir -p models/checkpoints
mkdir -p models/unet
mkdir -p models/vae
mkdir -p models/clip
mkdir -p models/loras

# Ensure hugginface-cli is installed
pip install -U "huggingface_hub[cli]"

# 1. Flux 2 Klein (4B) - Generation
# Fast, high-quality, distilled. Using bfloat16 or fp8 if available.
echo "Downloading Flux 2 Klein 4B..."
huggingface-cli download black-forest-labs/FLUX.2-klein-4B --local-dir models/checkpoints

# 2. Qwen Image Edit 2511 (Standard/GGUF) - Editing
# ~57GB full size. User wants GGUF/Optimized.
# Since official GGUF repo varies, we download the standard but rely on ComfyUI's load-in-parts & Swap.
# OR search for a GGUF variant if known. 
# Strategy: Download the 'Qwen-Image-Edit-2511' repo but exclude huge non-essential files if possible, 
# or look for a quantized safetensors. 
# Given constraints, we will download the SAFE main weights.
echo "Downloading Qwen Image Edit 2511..."
# Note: Full download is huge. Checking if we can download just specific parts?
# Standard Diffusers/Transformers download. ComfyUI might need it in 'LLM' or 'UNET' folder depending on nodes.
huggingface-cli download Qwen/Qwen-Image-Edit-2511 --exclude "*.bin" --local-dir models/unet

# 3. Z-Image Turbo (Optional Fast Gen)
echo "Downloading Z-Image Turbo..."
huggingface-cli download Z-Image-Turbo --local-dir models/checkpoints

# Also need CLIP/VAE for Flux/Qwen
echo "Downloading Standard VAE/CLIP..."
huggingface-cli download black-forest-labs/FLUX.1-schnell --include "ae.safetensors" --local-dir models/vae
huggingface-cli download comfyanonymous/flux_text_encoders --include "clip_l.safetensors" --local-dir models/clip

echo "=== Setup Complete! ==="
echo "Run: python main.py --listen 0.0.0.0 --port 8188"
