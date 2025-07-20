from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import ai_info, quiz, prompt, base_content, term, finance_info, finance_user_progress

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai_info.router, prefix="/api/ai-info")
app.include_router(quiz.router, prefix="/api/quiz")
app.include_router(prompt.router, prefix="/api/prompt")
app.include_router(base_content.router, prefix="/api/base-content")
app.include_router(term.router, prefix="/api/term")

# 금융 관련 라우터들
app.include_router(finance_info.router, prefix="/api/finance")
app.include_router(finance_user_progress.router, prefix="/api/finance") 