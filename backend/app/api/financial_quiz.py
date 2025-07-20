from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import FinancialQuiz
from ..schemas import FinancialQuizCreate, FinancialQuizResponse

router = APIRouter()

@router.get("/topics", response_model=List[str])
def get_all_financial_quiz_topics(db: Session = Depends(get_db)):
    topics = list(set([row.topic for row in db.query(FinancialQuiz).all()]))
    return topics

@router.get("/{topic}", response_model=List[FinancialQuizResponse])
def get_financial_quiz_by_topic(topic: str, db: Session = Depends(get_db)):
    quizzes = db.query(FinancialQuiz).filter(FinancialQuiz.topic == topic).all()
    return quizzes

@router.post("/", response_model=FinancialQuizResponse)
def add_financial_quiz(quiz_data: FinancialQuizCreate, db: Session = Depends(get_db)):
    db_quiz = FinancialQuiz(
        topic=quiz_data.topic,
        question=quiz_data.question,
        option1=quiz_data.option1,
        option2=quiz_data.option2,
        option3=quiz_data.option3,
        option4=quiz_data.option4,
        correct=quiz_data.correct,
        explanation=quiz_data.explanation
    )
    db.add(db_quiz)
    db.commit()
    db.refresh(db_quiz)
    return db_quiz

@router.put("/{quiz_id}", response_model=FinancialQuizResponse)
def update_financial_quiz(quiz_id: int, quiz_data: FinancialQuizCreate, db: Session = Depends(get_db)):
    quiz = db.query(FinancialQuiz).filter(FinancialQuiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Financial Quiz not found")
    quiz.topic = quiz_data.topic
    quiz.question = quiz_data.question
    quiz.option1 = quiz_data.option1
    quiz.option2 = quiz_data.option2
    quiz.option3 = quiz_data.option3
    quiz.option4 = quiz_data.option4
    quiz.correct = quiz_data.correct
    quiz.explanation = quiz_data.explanation
    db.commit()
    db.refresh(quiz)
    return quiz

@router.delete("/{quiz_id}")
def delete_financial_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(FinancialQuiz).filter(FinancialQuiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Financial Quiz not found")
    db.delete(quiz)
    db.commit()
    return {"message": "Financial Quiz deleted successfully"}

@router.options("/")
def options_financial_quiz():
    return Response(status_code=200)

@router.get("/generate/{topic}")
def generate_financial_quiz(topic: str):
    quiz_templates = {
        "금융": {
            "question": "금융의 정의로 가장 적절한 것은?",
            "options": [
                "돈을 관리하는 기술",
                "금융 상품을 파는 행위",
                "자산을 운용하는 모든 활동",
                "은행 업무만을 의미함"
            ],
            "correct": 2,
            "explanation": "금융은 자산을 운용하고 관리하는 모든 활동을 의미합니다."
        }
    }
    if topic in quiz_templates:
        return quiz_templates[topic]
    else:
        return {
            "question": f"{topic}에 대한 기본 금융 퀴즈",
            "options": ["옵션 1", "옵션 2", "옵션 3", "옵션 4"],
            "correct": 0,
            "explanation": "기본 설명입니다."
        } 