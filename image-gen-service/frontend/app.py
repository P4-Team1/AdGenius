import streamlit as st
import requests
import base64
from PIL import Image
from io import BytesIO

# Configuration
API_URL = "http://localhost:8000"

st.set_page_config(page_title="AI Ad Generator", layout="wide")
st.title("🎨 AI Smart Ad Generator")

# Sidebar
mode = st.sidebar.radio("Mode", ["Create Ad (Flux)", "Edit Ad (Qwen)"])

def decode_image(base64_string):
    image_data = base64.b64decode(base64_string)
    return Image.open(BytesIO(image_data))

if mode == "Create Ad (Flux)":
    st.header("Create a New Ad Campaign")
    
    product_desc = st.text_input("Product Description", "Strawberry Latte on a wooden table, summer vibe")
    
    if st.button("Generate Ad"):
        with st.spinner("Generative AI is working magic... (Expanding prompt & Rendering)"):
            try:
                payload = {
                    "prompt": product_desc,
                    "num_inference_steps": 4, # Fast
                    "guidance_scale": 3.5
                }
                response = requests.post(f"{API_URL}/generate", json=payload)
                
                if response.status_code == 200:
                    data = response.json()
                    image = decode_image(data["image_base64"])
                    ad_copy = data["info"]
                    
                    col1, col2 = st.columns([2, 1])
                    with col1:
                        st.image(image, caption="Generated Image", use_column_width=True)
                    with col2:
                        st.subheader("Recommended Copy")
                        st.info(ad_copy)
                else:
                    st.error(f"Error: {response.text}")
                    
            except Exception as e:
                st.error(f"Connection Error: {e}")

elif mode == "Edit Ad (Qwen)":
    st.header("Refine Your Ad Asset")
    
    uploaded_file = st.file_uploader("Upload Image to Edit", type=["png", "jpg", "jpeg"])
    edit_instruction = st.text_input("Edit Instruction", "Replace the cup with a blue mug")
    
    if uploaded_file and st.button("Apply Edit"):
        with st.spinner("Editing image context..."):
            try:
                # Encode input image
                bytes_data = uploaded_file.getvalue()
                base64_img = base64.b64encode(bytes_data).decode('utf-8')
                
                payload = {
                    "image_base64": base64_img,
                    "prompt": edit_instruction,
                    "num_inference_steps": 30
                }
                response = requests.post(f"{API_URL}/edit", json=payload)
                
                if response.status_code == 200:
                    data = response.json()
                    image = decode_image(data["image_base64"])
                    st.image(image, caption="Edited Result")
                else:
                    st.error(f"Error: {response.text}")
                    
            except Exception as e:
                st.error(f"Connection Error: {e}")
