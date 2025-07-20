from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import ai_info, quiz, prompt, base_content, term, finance_info, finance_user_progress, finance_quiz, finance_stats, finance_ai_info, financial_quiz, financial_user_progress, financial_prompt, financial_base_content, financial_term

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
app.include_router(finance_quiz.router, prefix="/api")
app.include_router(finance_stats.router, prefix="/api")
app.include_router(finance_ai_info.router, prefix="/api/finance-ai-info")
app.include_router(financial_quiz.router, prefix="/api/financial-quiz")
app.include_router(financial_user_progress.router, prefix="/api/financial-user-progress")
app.include_router(financial_prompt.router, prefix="/api/financial-prompt")
app.include_router(financial_base_content.router, prefix="/api/financial-base-content")
app.include_router(financial_term.router, prefix="/api/financial-term") 