from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# AI Info Schemas
class TermItem(BaseModel):
    term: str
    description: str

class AIInfoItem(BaseModel):
    title: str
    content: str
    terms: Optional[List[TermItem]] = []

class AIInfoCreate(BaseModel):
    date: str
    infos: List[AIInfoItem]

class AIInfoResponse(BaseModel):
    id: int
    date: str
    infos: List[AIInfoItem]
    created_at: str

    class Config:
        from_attributes = True

# Quiz Schemas
class QuizCreate(BaseModel):
    topic: str
    question: str
    option1: str
    option2: str
    option3: str
    option4: str
    correct: int
    explanation: str

class QuizResponse(BaseModel):
    id: int
    topic: str
    question: str
    option1: str
    option2: str
    option3: str
    option4: str
    correct: int
    explanation: str
    created_at: datetime

    class Config:
        from_attributes = True

# User Progress Schemas
class UserProgressCreate(BaseModel):
    session_id: str
    date: str
    learned_info: List[int]
    stats: Optional[dict] = None

class UserProgressResponse(BaseModel):
    id: int
    session_id: str
    date: str
    learned_info: List[int]
    stats: Optional[dict]
    created_at: datetime

    class Config:
        from_attributes = True

# Prompt Schemas
class PromptCreate(BaseModel):
    title: str
    content: str
    category: str

class PromptResponse(BaseModel):
    id: int
    title: str
    content: str
    category: str
    created_at: datetime

    class Config:
        from_attributes = True

# Base Content Schemas
class BaseContentCreate(BaseModel):
    title: str
    content: str
    category: str

class BaseContentResponse(BaseModel):
    id: int
    title: str
    content: str
    category: str
    created_at: str

    class Config:
        from_attributes = True 

# Term Schemas
class TermResponse(BaseModel):
    id: int
    term: str
    description: str
    created_at: datetime

    class Config:
        from_attributes = True

# 금융 관련 스키마들
class FinanceInfoCreate(BaseModel):
    title: str
    content: str
    date: datetime
    source: Optional[str] = None

class FinanceInfoResponse(BaseModel):
    id: int
    title: str
    content: str
    date: datetime
    source: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class FinanceTermCreate(BaseModel):
    term: str
    definition: str
    finance_info_id: int
    difficulty: str = "초급"

class FinanceTermResponse(BaseModel):
    id: int
    term: str
    definition: str
    finance_info_id: int
    difficulty: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserFinanceProgressCreate(BaseModel):
    user_id: int
    finance_term_id: int
    is_learned: bool

class UserFinanceProgressResponse(BaseModel):
    id: int
    user_id: int
    finance_term_id: int
    is_learned: bool
    learned_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

class UserFinanceQuizCreate(BaseModel):
    user_id: int
    score: int
    total_questions: int
    correct_answers: int
    quiz_data: Optional[dict] = None

class UserFinanceQuizResponse(BaseModel):
    id: int
    user_id: int
    score: int
    total_questions: int
    correct_answers: int
    quiz_date: datetime
    quiz_data: Optional[dict]
    created_at: datetime

    class Config:
        from_attributes = True

# 금융 퀴즈 스키마들
class FinanceQuizCreate(BaseModel):
    question: str
    options: List[str]
    correct_answer: int
    explanation: str
    difficulty: str = "초급"
    category: str = "주식"

class FinanceQuizUpdate(BaseModel):
    question: Optional[str] = None
    options: Optional[List[str]] = None
    correct_answer: Optional[int] = None
    explanation: Optional[str] = None
    difficulty: Optional[str] = None
    category: Optional[str] = None

class FinanceQuizResponse(BaseModel):
    id: int
    question: str
    options: List[str]
    correct_answer: int
    explanation: str
    difficulty: str
    category: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class FinanceQuizScoreCreate(BaseModel):
    user_id: int
    quiz_id: int
    score: int
    total_questions: int
    correct_answers: int
    answers: Optional[List[int]] = None

class FinanceQuizScoreResponse(BaseModel):
    id: int
    user_id: int
    quiz_id: int
    score: int
    total_questions: int
    correct_answers: int
    answers: Optional[List[int]]
    created_at: datetime

    class Config:
        from_attributes = True 

# 금융학습용 스키마 (AI학습과 1:1 구조)
class FinancialTermItem(BaseModel):
    term: str
    description: str

class FinanceAIInfoItem(BaseModel):
    title: str
    content: str
    terms: Optional[List[FinancialTermItem]] = []

class FinanceAIInfoCreate(BaseModel):
    date: str
    infos: List[FinanceAIInfoItem]

class FinanceAIInfoResponse(BaseModel):
    id: int
    date: str
    infos: List[FinanceAIInfoItem]
    created_at: str
    class Config:
        from_attributes = True

class FinancialQuizCreate(BaseModel):
    topic: str
    question: str
    option1: str
    option2: str
    option3: str
    option4: str
    correct: int
    explanation: str

class FinancialQuizResponse(BaseModel):
    id: int
    topic: str
    question: str
    option1: str
    option2: str
    option3: str
    option4: str
    correct: int
    explanation: str
    created_at: datetime
    class Config:
        from_attributes = True

class FinancialUserProgressCreate(BaseModel):
    session_id: str
    date: str
    learned_info: List[int]
    stats: Optional[dict] = None

class FinancialUserProgressResponse(BaseModel):
    id: int
    session_id: str
    date: str
    learned_info: List[int]
    stats: Optional[dict]
    created_at: datetime
    class Config:
        from_attributes = True

class FinancialPromptCreate(BaseModel):
    title: str
    content: str
    category: str

class FinancialPromptResponse(BaseModel):
    id: int
    title: str
    content: str
    category: str
    created_at: datetime
    class Config:
        from_attributes = True

class FinancialBaseContentCreate(BaseModel):
    title: str
    content: str
    category: str

class FinancialBaseContentResponse(BaseModel):
    id: int
    title: str
    content: str
    category: str
    created_at: str
    class Config:
        from_attributes = True

class FinancialTermResponse(BaseModel):
    id: int
    term: str
    description: str
    created_at: datetime
    class Config:
        from_attributes = True

class FinancialUsersCreate(BaseModel):
    username: str
    email: str
    hashed_password: str

class FinancialUsersResponse(BaseModel):
    id: int
    username: str
    email: str
    hashed_password: str
    created_at: datetime
    class Config:
        from_attributes = True 