from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://real-production-376e.up.railway.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록 예시 (실제 프로젝트에 맞게 아래 라인 추가 필요)
# from .api import ai_info
# app.include_router(ai_info.router, prefix="/api/ai-info")
# from .api import quiz
# app.include_router(quiz.router, prefix="/api/quiz")
# from .api import prompt
# app.include_router(prompt.router, prefix="/api/prompt")
# from .api import base_content
# app.include_router(base_content.router, prefix="/api/base-content") 