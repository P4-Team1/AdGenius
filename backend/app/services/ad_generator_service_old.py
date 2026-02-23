import asyncio
import subprocess
import time
import sys
import os
import socket
import json
import urllib.request
import urllib.parse
import uuid
import websockets
import aiofiles
import aiohttp
from pathlib import Path
from PIL import Image
import io
from typing import Optional, Dict, Any, List
import logging
from datetime import datetime

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class QwenImageService:
    """
    ComfyUI 기반 Qwen Image 생성 서비스
    - 싱글톤 패턴으로 서버 상태 관리
    - 비동기 웹소켓 통신
    - 동적 프롬프트 교체
    """
    
    _instance = None
    _server_process = None
    _server_lock = asyncio.Lock()
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not hasattr(self, 'initialized'):
            self.initialized = True
            self.comfy_root = Path(__file__).parent.parent.parent / "utils_bck" / "internal_lib" / "comfy"
            self.main_py_path = self.comfy_root / "main.py"
            self.workflow_path = Path(__file__).parent.parent / "schemas" / "workflows" / "image_qwen_image_api.json"
            self.outputs_dir = Path(__file__).parent.parent.parent / "outputs" / "txt2img"
            
            self.server_host = "127.0.0.1"
            self.server_port = 8188
            self.server_addr = f"{self.server_host}:{self.server_port}"
            self.python_exec = sys.executable
            
            # 출력 디렉토리 생성
            self.outputs_dir.mkdir(parents=True, exist_ok=True)
            
            logger.info(f"QwenImageService initialized")
            logger.info(f"ComfyUI root: {self.comfy_root}")
            logger.info(f"Workflow path: {self.workflow_path}")
            logger.info(f"Outputs dir: {self.outputs_dir}")
    
    async def _is_port_open(self, host: str, port: int) -> bool:
        """서버가 켜졌는지 확인 (비동기)"""
        try:
            loop = asyncio.get_event_loop()
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                result = await loop.run_in_executor(None, s.connect_ex, (host, port))
                return result == 0
        except Exception as e:
            logger.error(f"Port check error: {e}")
            return False
    
    async def _start_comfyui_server(self) -> Optional[subprocess.Popen]:
        """ComfyUI 서버 백그라운드 실행 (싱글톤 관리)"""
        async with self._server_lock:
            if self._server_process is not None:
                # 프로세스가 살아있는지 확인
                if self._server_process.poll() is None:
                    logger.info("✅ ComfyUI 서버가 이미 실행 중입니다.")
                    return self._server_process
                else:
                    # 프로세스가 죽었으면 정리
                    self._server_process = None
            
            # 서버가 이미 실행 중인지 포트 확인
            if await self._is_port_open(self.server_host, self.server_port):
                logger.info("✅ ComfyUI 서버가 이미 실행 중입니다.")
                return None
            
            logger.info("🚀 ComfyUI 서버 시작 중...")
            try:
                # 서버 시작
                process = subprocess.Popen(
                    [self.python_exec, "main.py", "--listen", "--port", str(self.server_port)],
                    cwd=str(self.comfy_root),
                    stdout=None,
                    stderr=None
                )
                
                # 서버 부팅 대기
                for i in range(30):  # 최대 30초 대기
                    if await self._is_port_open(self.server_host, self.server_port):
                        logger.info("✅ 서버 연결 성공!")
                        await asyncio.sleep(2)  # 안정화 대기
                        self._server_process = process
                        return process
                    await asyncio.sleep(1)
                    print(".", end="", flush=True)
                
                print("\n❌ 서버 시작 실패. 로그 확인 필요.")
                # 에러 로그 출력
                _, err = process.communicate()
                logger.error(f"Server start error: {err.decode()}")
                return None
                
            except Exception as e:
                logger.error(f"Failed to start ComfyUI server: {e}")
                return None
    
    async def _queue_prompt(self, prompt: Dict[str, Any], client_id: str) -> Dict[str, Any]:
        """프롬프트를 큐에 추가 (비동기)"""
        p = {"prompt": prompt, "client_id": client_id}
        data = json.dumps(p).encode('utf-8')
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"http://{self.server_addr}/prompt",
                data=data,
                headers={'Content-Type': 'application/json'}
            ) as response:
                return await response.json()
    
    async def _get_image(self, filename: str, subfolder: str, folder_type: str) -> bytes:
        """이미지 데이터 가져오기 (비동기)"""
        params = {"filename": filename, "subfolder": subfolder, "type": folder_type}
        
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"http://{self.server_addr}/view",
                params=params
            ) as response:
                return await response.read()
    
    async def _get_history(self, prompt_id: str) -> Dict[str, Any]:
        """히스토리 가져오기 (비동기)"""
        async with aiohttp.ClientSession() as session:
            async with session.get(f"http://{self.server_addr}/history/{prompt_id}") as response:
                return await response.json()
    
    async def _get_images(self, ws, prompt: Dict[str, Any], client_id: str) -> Dict[str, List[bytes]]:
        """이미지 생성 및 수신 (비동기 웹소켓)"""
        # 프롬프트 큐에 추가
        queue_result = await self._queue_prompt(prompt, client_id)
        prompt_id = queue_result['prompt_id']
        output_images = {}
        
        # 웹소켓으로 결과 대기
        while True:
            try:
                out = await ws.recv()
                if isinstance(out, str):
                    message = json.loads(out)
                    if message['type'] == 'executing':
                        data = message['data']
                        if data['node'] is None and data['prompt_id'] == prompt_id:
                            break
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                break
        
        # 히스토리에서 이미지 정보 가져오기
        history = await self._get_history(prompt_id)
        if prompt_id in history:
            for node_id in history[prompt_id]['outputs']:
                node_output = history[prompt_id]['outputs'][node_id]
                if 'images' in node_output:
                    images_output = []
                    for image in node_output['images']:
                        image_data = await self._get_image(
                            image['filename'], 
                            image['subfolder'], 
                            image['type']
                        )
                        images_output.append(image_data)
                    output_images[node_id] = images_output
        
        return output_images
    
    def _find_node_by_title(self, workflow: Dict[str, Any], target_title: str) -> Optional[str]:
        """워크플로우에서 특정 제목을 가진 노드의 ID를 찾음"""
        try:
            for node_id, node_data in workflow.items():
                if node_id == "_meta":  # _meta는 건너뛰기
                    continue
                    
                if isinstance(node_data, dict):
                    # 노드 내부의 _meta에서 title 확인
                    node_meta = node_data.get("_meta", {})
                    if isinstance(node_meta, dict) and node_meta.get("title") == target_title:
                        return node_id
                        
            return None
        except Exception as e:
            logger.error(f"노드 찾기 실패: {e}")
            return None
    
    def _update_workflow_params(self, workflow: Dict[str, Any], params: Dict[str, Any]) -> Dict[str, Any]:
        """워크플로우 파라미터 동적 업데이트 (확장성 확보)"""
        workflow_copy = json.loads(json.dumps(workflow))  # 깊은 복사
        
        try:
            updated_nodes = []
            
            # 1. 샘플러 설정 (Node ID: "76:3")
            if "76:3" in workflow_copy:
                sampler_params = ["seed", "steps", "cfg", "sampler_name", "scheduler"]
                for param_name in sampler_params:
                    if param_name in params:
                        workflow_copy["76:3"]["inputs"][param_name] = params[param_name]
                        updated_nodes.append(f"76:3({param_name})")
                        logger.info(f"✅ {param_name} 업데이트됨 (Node ID: 76:3): {params[param_name]}")
            
            # 2. 이미지 사이즈 설정 (Node ID: "76:58")
            if "76:58" in workflow_copy:
                size_params = ["width", "height"]
                for param_name in size_params:
                    if param_name in params:
                        workflow_copy["76:58"]["inputs"][param_name] = params[param_name]
                        updated_nodes.append(f"76:58({param_name})")
                        logger.info(f"✅ {param_name} 업데이트됨 (Node ID: 76:58): {params[param_name]}")
            
            # 3. 프롬프트 설정 (Node ID: "76:6" - Positive, "76:7" - Negative)
            if "76:6" in workflow_copy and "prompt" in params:
                workflow_copy["76:6"]["inputs"]["text"] = params["prompt"]
                updated_nodes.append("76:6(text)")
                logger.info(f"✅ prompt 업데이트됨 (Node ID: 76:6): {params['prompt'][:50]}...")
            
            if "76:7" in workflow_copy and "negative_prompt" in params:
                workflow_copy["76:7"]["inputs"]["text"] = params["negative_prompt"]
                updated_nodes.append("76:7(text)")
                logger.info(f"✅ negative_prompt 업데이트됨 (Node ID: 76:7): {params['negative_prompt'][:50]}...")
            
            if updated_nodes:
                logger.info(f"🔧 총 {len(updated_nodes)}개 파라미터 업데이트됨: {', '.join(updated_nodes)}")
            else:
                logger.warning("⚠️ 업데이트된 파라미터가 없습니다.")
                
        except Exception as e:
            logger.error(f"워크플로우 파라미터 업데이트 실패: {e}")
        
        return workflow_copy
    
    def _update_prompt_text(self, workflow: Dict[str, Any], new_text: str) -> Dict[str, Any]:
        """워크플로우의 프롬프트 텍스트 업데이트 (하위 호환성용)"""
        return self._update_workflow_params(workflow, {"prompt": new_text})
    
    async def generate_image(self, prompt_text: str, text_in_image: Optional[str], ad_description: str, store_id: int, project_id: int, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        이미지 생성 메인 메서드
        
        Args:
            prompt_text: 생성할 이미지의 묘사 (image_prompt)
            text_in_image: 이미지 안의 텍스트 (선택)
            ad_description: 광고할 제품/가게 설명 (ad_description)
            store_id: 가게 ID (저장 경로용)
            project_id: 프로젝트 ID (저장 경로용)
            params: 추가 파라미터 (seed, steps, cfg, width, height, negative_prompt 등)
            
        Returns:
            생성된 이미지 파일의 경로와 LLM 결과를 포함한 딕셔너리
            {
                "image_path": str,
                "optimized_prompt": str,
                "ad_copy": str
            }
        """
        try:
            # 1. 서버 시작 확인
            await self._start_comfyui_server()
            
            # 2. 워크플로우 로드
            if not self.workflow_path.exists():
                logger.error(f"❌ 워크플로우 파일을 찾을 수 없습니다: {self.workflow_path}")
                return {"image_path": None, "optimized_prompt": None, "ad_copy": None}
            
            async with aiofiles.open(self.workflow_path, 'r', encoding='utf-8') as f:
                workflow_content = await f.read()
            workflow = json.loads(workflow_content)
            
            # 3. LLM을 통한 프롬프트 최적화 (이미지 묘사만 사용)
            from app.services.llm_service import llm_service
            optimized_prompt = await llm_service.optimize_prompt(prompt_text, text_in_image)
            logger.info(f"🧠 이미지 프롬프트 최적화 완료: {optimized_prompt[:50]}...")
            
            # 4. 파라미터 준비 및 업데이트
            update_params = {"prompt": optimized_prompt}  # 최적화된 프롬프트 사용
            if params:
                update_params.update(params)
            
            # width, height가 없으면 기본값 설정
            if 'width' not in update_params:
                update_params['width'] = 1024
            if 'height' not in update_params:
                update_params['height'] = 1024
            
            logger.info(f"🔧 워크플로우 파라미터 업데이트: {list(update_params.keys())}")
            logger.info(f"🔍 DEBUG: 이미지 사이즈 - width: {update_params['width']}, height: {update_params['height']}")
            updated_workflow = self._update_workflow_params(workflow, update_params)
            
            # 5. 저장 디렉토리 생성
            storage_dir = Path(__file__).parent.parent.parent / "storage" / f"store_{store_id}" / f"project_{project_id}"
            storage_dir.mkdir(parents=True, exist_ok=True)
            logger.info(f"📁 저장 디렉토리 생성: {storage_dir}")
            
            # 6. 웹소켓 연결
            client_id = str(uuid.uuid4())
            ws_url = f"ws://{self.server_addr}/ws?clientId={client_id}"
            
            # 웹소켓 연결 (네이티브 비동기)
            async with websockets.connect(ws_url) as ws:
                try:
                    logger.info(f"🎨 이미지 생성 요청 전송... (프롬프트: {optimized_prompt[:50]}...)")
                    images = await self._get_images(ws, updated_workflow, client_id)
                    
                    if not images:
                        logger.warning("⚠️ 생성된 이미지가 없습니다.")
                        return {"image_path": None, "optimized_prompt": optimized_prompt, "ad_copy": None}
                    
                    # 7. 이미지 저장
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    saved_paths = []
                    
                    for node_id, image_list in images.items():
                        for i, img_data in enumerate(image_list):
                            file_name = f"qwen_result_{timestamp}_{node_id}_{i}.png"
                            full_path = storage_dir / file_name
                            
                            # 이미지 저장
                            image = Image.open(io.BytesIO(img_data))
                            image.save(full_path)
                            saved_paths.append(str(full_path))
                            logger.info(f"🎉 이미지 저장 완료: {full_path}")
                    
                    # 8. 광고 문구 생성 (광고 내용만 사용)
                    ad_copy = await llm_service.generate_ad_copy(ad_description)
                    logger.info(f"✍️ 광고 문구 생성 완료: {ad_copy[:50]}...")
                    
                    # 결과 반환
                    result = {
                        "image_path": saved_paths[0] if saved_paths else None,
                        "optimized_prompt": optimized_prompt,
                        "ad_copy": ad_copy
                    }
                    
                    logger.info(f"🎊 이미지 생성 및 LLM 처리 완료")
                    return result
                    
                except Exception as e:
                    logger.error(f"❌ 이미지 생성 중 오류 발생: {e}")
                    return {"image_path": None, "optimized_prompt": optimized_prompt, "ad_copy": None}
                    
        except Exception as e:
            logger.error(f"❌ 이미지 생성 실패: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return {"image_path": None, "optimized_prompt": None, "ad_copy": None}
    
    async def cleanup(self):
        """서버 정리 (앱 종료 시 호출)"""
        if self._server_process:
            logger.info("🛑 ComfyUI 서버 종료 중...")
            self._server_process.terminate()
            try:
                self._server_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self._server_process.kill()
            logger.info("✅ 서버 종료 완료.")
            self._server_process = None

# 전역 서비스 인스턴스
qwen_image_service = QwenImageService()
