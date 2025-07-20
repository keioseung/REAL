from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json

from ..database import get_db
from ..models import UserFinanceProgress, UserFinanceQuiz, FinanceTerm, FinanceInfo, User
from ..schemas import UserFinanceProgressCreate, UserFinanceProgressResponse

router = APIRouter()

@router.post("/finance-progress", response_model=UserFinanceProgressResponse)
def create_finance_progress(progress: UserFinanceProgressCreate, db: Session = Depends(get_db)):
    """금융 학습 진행률 생성"""
    # 기존 진행률이 있는지 확인
    existing_progress = db.query(UserFinanceProgress).filter(
        and_(
            UserFinanceProgress.user_id == progress.user_id,
            UserFinanceProgress.finance_term_id == progress.finance_term_id
        )
    ).first()
    
    if existing_progress:
        # 기존 진행률 업데이트
        existing_progress.is_learned = progress.is_learned
        existing_progress.learned_at = datetime.now() if progress.is_learned else None
        db.commit()
        db.refresh(existing_progress)
        return existing_progress
    
    # 새로운 진행률 생성
    db_progress = UserFinanceProgress(
        user_id=progress.user_id,
        finance_term_id=progress.finance_term_id,
        is_learned=progress.is_learned,
        learned_at=datetime.now() if progress.is_learned else None
    )
    db.add(db_progress)
    db.commit()
    db.refresh(db_progress)
    return db_progress

@router.get("/finance-progress/{user_id}")
def get_user_finance_progress(user_id: int, db: Session = Depends(get_db)):
    """사용자의 금융 학습 진행률 조회"""
    # 사용자 확인
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 전체 금융 용어 수
    total_terms = db.query(FinanceTerm).count()
    
    # 학습한 용어 수
    learned_terms = db.query(UserFinanceProgress).filter(
        and_(
            UserFinanceProgress.user_id == user_id,
            UserFinanceProgress.is_learned == True
        )
    ).count()
    
    # 학습 진행률
    progress_percentage = (learned_terms / total_terms * 100) if total_terms > 0 else 0
    
    # 최근 학습한 용어들 (최근 7일)
    recent_learned = db.query(UserFinanceProgress).filter(
        and_(
            UserFinanceProgress.user_id == user_id,
            UserFinanceProgress.is_learned == True,
            UserFinanceProgress.learned_at >= datetime.now() - timedelta(days=7)
        )
    ).count()
    
    # 일별 학습 통계 (최근 30일)
    daily_stats = []
    for i in range(30):
        date = datetime.now() - timedelta(days=i)
        start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = start_of_day + timedelta(days=1)
        
        daily_learned = db.query(UserFinanceProgress).filter(
            and_(
                UserFinanceProgress.user_id == user_id,
                UserFinanceProgress.is_learned == True,
                UserFinanceProgress.learned_at >= start_of_day,
                UserFinanceProgress.learned_at < end_of_day
            )
        ).count()
        
        daily_stats.append({
            "date": start_of_day.strftime("%Y-%m-%d"),
            "learned_count": daily_learned
        })
    
    daily_stats.reverse()
    
    return {
        "user_id": user_id,
        "total_terms": total_terms,
        "learned_terms": learned_terms,
        "progress_percentage": round(progress_percentage, 2),
        "recent_learned": recent_learned,
        "daily_stats": daily_stats
    }

@router.get("/finance-learned-terms/{user_id}")
def get_user_finance_learned_terms(
    user_id: int,
    date_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """사용자가 학습한 금융 용어들 조회"""
    # 사용자 확인
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 기본 쿼리
    query = db.query(UserFinanceProgress, FinanceTerm, FinanceInfo).join(
        FinanceTerm, UserFinanceProgress.finance_term_id == FinanceTerm.id
    ).join(
        FinanceInfo, FinanceTerm.finance_info_id == FinanceInfo.id
    ).filter(
        and_(
            UserFinanceProgress.user_id == user_id,
            UserFinanceProgress.is_learned == True
        )
    )
    
    # 날짜 필터 적용
    if date_filter and date_filter != "all":
        try:
            filter_date = datetime.strptime(date_filter, "%Y-%m-%d")
            start_of_day = filter_date.replace(hour=0, minute=0, second=0, microsecond=0)
            end_of_day = start_of_day + timedelta(days=1)
            
            query = query.filter(
                and_(
                    UserFinanceProgress.learned_at >= start_of_day,
                    UserFinanceProgress.learned_at < end_of_day
                )
            )
        except ValueError:
            pass
    
    results = query.order_by(UserFinanceProgress.learned_at.desc()).all()
    
    # 결과 정리
    learned_terms = []
    for progress, term, info in results:
        learned_terms.append({
            "id": term.id,
            "term": term.term,
            "definition": term.definition,
            "difficulty": term.difficulty,
            "learned_at": progress.learned_at.strftime("%Y-%m-%d %H:%M:%S") if progress.learned_at else None,
            "finance_info": {
                "id": info.id,
                "title": info.title,
                "date": info.date.strftime("%Y-%m-%d") if info.date else None
            }
        })
    
    return learned_terms

@router.get("/finance-stats/{user_id}")
def get_user_finance_stats(user_id: int, db: Session = Depends(get_db)):
    """사용자의 금융 학습 통계 조회"""
    # 사용자 확인
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 전체 통계
    total_terms = db.query(FinanceTerm).count()
    learned_terms = db.query(UserFinanceProgress).filter(
        and_(
            UserFinanceProgress.user_id == user_id,
            UserFinanceProgress.is_learned == True
        )
    ).count()
    
    # 난이도별 통계
    difficulty_stats = {}
    for difficulty in ["초급", "중급", "고급"]:
        total_by_difficulty = db.query(FinanceTerm).filter(
            FinanceTerm.difficulty == difficulty
        ).count()
        
        learned_by_difficulty = db.query(UserFinanceProgress).join(
            FinanceTerm, UserFinanceProgress.finance_term_id == FinanceTerm.id
        ).filter(
            and_(
                UserFinanceProgress.user_id == user_id,
                UserFinanceProgress.is_learned == True,
                FinanceTerm.difficulty == difficulty
            )
        ).count()
        
        difficulty_stats[difficulty] = {
            "total": total_by_difficulty,
            "learned": learned_by_difficulty,
            "percentage": round((learned_by_difficulty / total_by_difficulty * 100) if total_by_difficulty > 0 else 0, 2)
        }
    
    # 주간 통계 (최근 4주)
    weekly_stats = []
    for i in range(4):
        week_start = datetime.now() - timedelta(weeks=i+1)
        week_end = datetime.now() - timedelta(weeks=i)
        
        weekly_learned = db.query(UserFinanceProgress).filter(
            and_(
                UserFinanceProgress.user_id == user_id,
                UserFinanceProgress.is_learned == True,
                UserFinanceProgress.learned_at >= week_start,
                UserFinanceProgress.learned_at < week_end
            )
        ).count()
        
        weekly_stats.append({
            "week": f"{(i+1)}주 전",
            "learned_count": weekly_learned
        })
    
    weekly_stats.reverse()
    
    # 월간 통계 (최근 6개월)
    monthly_stats = []
    for i in range(6):
        month_start = datetime.now().replace(day=1) - timedelta(days=30*i)
        month_end = month_start.replace(day=1) + timedelta(days=32)
        month_end = month_end.replace(day=1) - timedelta(days=1)
        
        monthly_learned = db.query(UserFinanceProgress).filter(
            and_(
                UserFinanceProgress.user_id == user_id,
                UserFinanceProgress.is_learned == True,
                UserFinanceProgress.learned_at >= month_start,
                UserFinanceProgress.learned_at <= month_end
            )
        ).count()
        
        monthly_stats.append({
            "month": month_start.strftime("%Y-%m"),
            "learned_count": monthly_learned
        })
    
    monthly_stats.reverse()
    
    return {
        "user_id": user_id,
        "total_terms": total_terms,
        "learned_terms": learned_terms,
        "overall_percentage": round((learned_terms / total_terms * 100) if total_terms > 0 else 0, 2),
        "difficulty_stats": difficulty_stats,
        "weekly_stats": weekly_stats,
        "monthly_stats": monthly_stats
    }

@router.get("/finance-period-stats/{user_id}")
def get_user_finance_period_stats(
    user_id: int,
    period: str = Query("week", regex="^(week|month)$"),
    db: Session = Depends(get_db)
):
    """사용자의 금융 학습 기간별 통계 조회"""
    # 사용자 확인
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    stats = []
    
    if period == "week":
        # 주간 통계 (최근 12주)
        for i in range(12):
            week_start = datetime.now() - timedelta(weeks=i+1)
            week_end = datetime.now() - timedelta(weeks=i)
            
            weekly_learned = db.query(UserFinanceProgress).filter(
                and_(
                    UserFinanceProgress.user_id == user_id,
                    UserFinanceProgress.is_learned == True,
                    UserFinanceProgress.learned_at >= week_start,
                    UserFinanceProgress.learned_at < week_end
                )
            ).count()
            
            stats.append({
                "period": f"{(i+1)}주 전",
                "learned_count": weekly_learned,
                "date": week_start.strftime("%Y-%m-%d")
            })
    else:
        # 월간 통계 (최근 12개월)
        for i in range(12):
            month_start = datetime.now().replace(day=1) - timedelta(days=30*i)
            month_end = month_start.replace(day=1) + timedelta(days=32)
            month_end = month_end.replace(day=1) - timedelta(days=1)
            
            monthly_learned = db.query(UserFinanceProgress).filter(
                and_(
                    UserFinanceProgress.user_id == user_id,
                    UserFinanceProgress.is_learned == True,
                    UserFinanceProgress.learned_at >= month_start,
                    UserFinanceProgress.learned_at <= month_end
                )
            ).count()
            
            stats.append({
                "period": month_start.strftime("%Y-%m"),
                "learned_count": monthly_learned,
                "date": month_start.strftime("%Y-%m-%d")
            })
    
    stats.reverse()
    return stats

@router.post("/finance-quiz-result")
def record_finance_quiz_result(
    user_id: int,
    quiz_data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """금융 퀴즈 결과 기록"""
    # 사용자 확인
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 퀴즈 결과 저장
    quiz_result = UserFinanceQuiz(
        user_id=user_id,
        score=quiz_data.get("score", 0),
        total_questions=quiz_data.get("total_questions", 0),
        correct_answers=quiz_data.get("correct_answers", 0),
        quiz_date=datetime.now(),
        quiz_data=json.dumps(quiz_data)
    )
    
    db.add(quiz_result)
    db.commit()
    db.refresh(quiz_result)
    
    return {
        "message": "Quiz result recorded successfully",
        "quiz_id": quiz_result.id
    }

@router.get("/finance-quiz-history/{user_id}")
def get_user_finance_quiz_history(user_id: int, db: Session = Depends(get_db)):
    """사용자의 금융 퀴즈 기록 조회"""
    # 사용자 확인
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    quiz_history = db.query(UserFinanceQuiz).filter(
        UserFinanceQuiz.user_id == user_id
    ).order_by(UserFinanceQuiz.quiz_date.desc()).all()
    
    return [
        {
            "id": quiz.id,
            "score": quiz.score,
            "total_questions": quiz.total_questions,
            "correct_answers": quiz.correct_answers,
            "percentage": round((quiz.correct_answers / quiz.total_questions * 100) if quiz.total_questions > 0 else 0, 2),
            "quiz_date": quiz.quiz_date.strftime("%Y-%m-%d %H:%M:%S") if quiz.quiz_date else None
        }
        for quiz in quiz_history
    ] 