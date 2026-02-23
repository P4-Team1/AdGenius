# Python 3.11 slim 기반
FROM python:3.11-slim

WORKDIR /app

# 시스템 의존성
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ libffi-dev && \
    rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip

# PyTorch (CUDA 포함 - GPU 있으면 자동 사용, 없으면 CPU fallback)
COPY requirements.txt .
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cu121 && \
    pip install --no-cache-dir -r requirements.txt

# 앱 코드 복사
COPY . .

# outputs 디렉토리 생성
RUN mkdir -p outputs/txt2img

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
