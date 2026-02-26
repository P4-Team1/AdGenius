from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .routers import generation
from .config import Config

app = FastAPI(title="AI Image Gen Service")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev simplicity
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Includes
app.include_router(generation.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "gpu": "L4", "vram_free": "Check logs"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=Config.HOST, port=Config.PORT)
