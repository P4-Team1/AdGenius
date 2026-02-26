# AI Ad Generator Service Setup Guide

## 1. Directory Structure Check
Ensure your project folder (`s:/code/codeit_sprint/project-3/image-gen-service/`) looks like this:
```
image-gen-service/
├── backend/
│   ├── main.py
│   ├── model_manager.py
│   ├── config.py
│   ├── schemas.py
│   ├── services/
│   │   └── llm_service.py
│   └── routers/
│       └── generation.py
├── frontend/
│   └── app.py
└── requirements.txt
```

## 2. Environment Variables
You must set these before running (or create a `.env` file in `backend/`):
```bash
export HF_TOKEN="your_huggingface_token"
export OPENAI_API_KEY="your_openai_api_key_for_gpt4o"
```

## 3. Install Dependencies
```bash
cd image-gen-service
uv pip install -r requirements.txt
# Ensure diffusers is the git version if not already
uv pip install git+https://github.com/huggingface/diffusers.git
```

## 4. Run Services (Two Terminals Needed)

**Terminal 1: Backend (FastAPI)**
```bash
# From image-gen-service folder
uv run uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
*Wait until you see "Application startup complete".*

**Terminal 2: Frontend (Streamlit)**
```bash
# From image-gen-service folder
uv run streamlit run frontend/app.py
```
*Open the URL shown (usually http://localhost:8501).*

## 5. Usage
1. **Create Ad**: Enter "Strawberry Latte" -> Click Generate -> See detailed prompt & image.
2. **Edit Ad**: Upload an image -> Enter "Change to blue cup" -> See result.
