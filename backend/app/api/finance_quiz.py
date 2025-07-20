from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import FinanceQuiz
from ..schemas import FinanceQuizCreate, FinanceQuizUpdate, FinanceQuizResponse

router = APIRouter(prefix="/finance-quiz", tags=["finance-quiz"])

@router.get("/", response_model=List[FinanceQuizResponse])
def get_all_quizzes(db: Session = Depends(get_db)):
    """모든 금융 퀴즈 조회"""
    quizzes = db.query(FinanceQuiz).all()
    return quizzes

@router.get("/{quiz_id}", response_model=FinanceQuizResponse)
def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    """특정 금융 퀴즈 조회"""
    quiz = db.query(FinanceQuiz).filter(FinanceQuiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="퀴즈를 찾을 수 없습니다")
    return quiz

@router.post("/", response_model=FinanceQuizResponse)
def create_quiz(quiz: FinanceQuizCreate, db: Session = Depends(get_db)):
    """새 금융 퀴즈 생성"""
    db_quiz = FinanceQuiz(**quiz.dict())
    db.add(db_quiz)
    db.commit()
    db.refresh(db_quiz)
    return db_quiz

@router.put("/{quiz_id}", response_model=FinanceQuizResponse)
def update_quiz(quiz_id: int, quiz: FinanceQuizUpdate, db: Session = Depends(get_db)):
    """금융 퀴즈 수정"""
    db_quiz = db.query(FinanceQuiz).filter(FinanceQuiz.id == quiz_id).first()
    if not db_quiz:
        raise HTTPException(status_code=404, detail="퀴즈를 찾을 수 없습니다")
    
    for field, value in quiz.dict(exclude_unset=True).items():
        setattr(db_quiz, field, value)
    
    db.commit()
    db.refresh(db_quiz)
    return db_quiz

@router.delete("/{quiz_id}")
def delete_quiz(quiz_id: int, db: Session = Depends(get_db)):
    """금융 퀴즈 삭제"""
    db_quiz = db.query(FinanceQuiz).filter(FinanceQuiz.id == quiz_id).first()
    if not db_quiz:
        raise HTTPException(status_code=404, detail="퀴즈를 찾을 수 없습니다")
    
    db.delete(db_quiz)
    db.commit()
    return {"message": "퀴즈가 삭제되었습니다"}

@router.get("/random/{count}", response_model=List[FinanceQuizResponse])
def get_random_quizzes(count: int, difficulty: str = None, category: str = None, db: Session = Depends(get_db)):
    """랜덤 금융 퀴즈 조회"""
    query = db.query(FinanceQuiz)
    
    if difficulty:
        query = query.filter(FinanceQuiz.difficulty == difficulty)
    if category:
        query = query.filter(FinanceQuiz.category == category)
    
    quizzes = query.order_by(db.func.random()).limit(count).all()
    return quizzes 