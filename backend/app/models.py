from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

class AIInfo(Base):
    __tablename__ = "ai_info"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, index=True)
    info1_title = Column(Text)
    info1_content = Column(Text)
    info1_terms = Column(Text)  # JSON 직렬화된 용어 리스트
    info2_title = Column(Text)
    info2_content = Column(Text)
    info2_terms = Column(Text)  # JSON 직렬화된 용어 리스트
    info3_title = Column(Text)
    info3_content = Column(Text)
    info3_terms = Column(Text)  # JSON 직렬화된 용어 리스트
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Quiz(Base):
    __tablename__ = "quiz"
    
    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String, index=True)
    question = Column(Text)
    option1 = Column(Text)
    option2 = Column(Text)
    option3 = Column(Text)
    option4 = Column(Text)
    correct = Column(Integer)
    explanation = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UserProgress(Base):
    __tablename__ = "user_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True)
    date = Column(String, index=True)
    learned_info = Column(Text)  # JSON 직렬화 문자열
    stats = Column(Text)         # JSON 직렬화 문자열
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Prompt(Base):
    __tablename__ = "prompt"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    content = Column(Text)
    category = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class BaseContent(Base):
    __tablename__ = "base_content"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    content = Column(Text)
    category = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now()) 

class Term(Base):
    __tablename__ = "term"
    id = Column(Integer, primary_key=True, index=True)
    term = Column(String, unique=True, index=True)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# 금융 관련 모델들
class FinanceInfo(Base):
    __tablename__ = "finance_info"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    date = Column(DateTime, nullable=False)
    source = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 관계 설정
    terms = relationship("FinanceTerm", back_populates="finance_info")

class FinanceTerm(Base):
    __tablename__ = "finance_terms"
    
    id = Column(Integer, primary_key=True, index=True)
    term = Column(String, nullable=False, index=True)
    definition = Column(Text, nullable=False)
    finance_info_id = Column(Integer, ForeignKey("finance_info.id"), nullable=False)
    difficulty = Column(String, default="초급")  # 초급, 중급, 고급
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 관계 설정
    finance_info = relationship("FinanceInfo", back_populates="terms")
    user_progress = relationship("UserFinanceProgress", back_populates="finance_term")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 관계 설정
    finance_progress = relationship("UserFinanceProgress", back_populates="user")
    finance_quizzes = relationship("UserFinanceQuiz", back_populates="user")

class UserFinanceProgress(Base):
    __tablename__ = "user_finance_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    finance_term_id = Column(Integer, ForeignKey("finance_terms.id"), nullable=False)
    is_learned = Column(Boolean, default=False)
    learned_at = Column(DateTime)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 관계 설정
    user = relationship("User", back_populates="finance_progress")
    finance_term = relationship("FinanceTerm", back_populates="user_progress")

class UserFinanceQuiz(Base):
    __tablename__ = "user_finance_quizzes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    score = Column(Integer, default=0)
    total_questions = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    quiz_date = Column(DateTime, nullable=False)
    quiz_data = Column(JSON)  # 퀴즈 상세 데이터
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 관계 설정
    user = relationship("User", back_populates="finance_quizzes")

class FinanceQuiz(Base):
    __tablename__ = "finance_quiz"
    
    id = Column(Integer, primary_key=True, index=True)
    question = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)  # ["옵션1", "옵션2", "옵션3", "옵션4"]
    correct_answer = Column(Integer, nullable=False)  # 0-3 인덱스
    explanation = Column(Text, nullable=False)
    difficulty = Column(String, default="초급")  # 초급, 중급, 고급
    category = Column(String, default="주식")  # 주식, 채권, 펀드, 보험, 부동산, 암호화폐
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class FinanceQuizScore(Base):
    __tablename__ = "finance_quiz_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quiz_id = Column(Integer, ForeignKey("finance_quiz.id"), nullable=False)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, nullable=False)
    answers = Column(JSON)  # 사용자 답변 기록
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 관계 설정
    user = relationship("User")
    quiz = relationship("FinanceQuiz") 