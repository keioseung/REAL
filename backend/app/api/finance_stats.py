from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from ..database import get_db
from ..models import FinanceInfo, FinanceQuiz, FinanceUserProgress, FinanceQuizScore, User

router = APIRouter(prefix="/finance-stats", tags=["finance-stats"])

@router.get("/overall")
def get_overall_stats(db: Session = Depends(get_db)):
    """전체 금융 학습 통계"""
    
    # 기본 통계
    total_users = db.query(User).count()
    total_terms = db.query(FinanceInfo).count()
    total_learned = db.query(FinanceUserProgress).count()
    total_quizzes = db.query(FinanceQuiz).count()
    total_quiz_attempts = db.query(FinanceQuizScore).count()
    
    # 평균 점수
    avg_score_result = db.query(func.avg(FinanceQuizScore.score)).scalar()
    average_score = float(avg_score_result) if avg_score_result else 0
    
    # 난이도별 통계
    difficulty_stats = {}
    for difficulty in ['초급', '중급', '고급']:
        total = db.query(FinanceInfo).filter(FinanceInfo.difficulty == difficulty).count()
        learned = db.query(FinanceUserProgress).join(FinanceInfo).filter(
            FinanceInfo.difficulty == difficulty
        ).count()
        percentage = (learned / total * 100) if total > 0 else 0
        difficulty_stats[difficulty] = {
            'total': total,
            'learned': learned,
            'percentage': round(percentage, 1)
        }
    
    # 카테고리별 통계
    categories = ['주식', '채권', '펀드', '보험', '부동산', '암호화폐']
    category_stats = {}
    for category in categories:
        total = db.query(FinanceInfo).filter(FinanceInfo.category == category).count()
        learned = db.query(FinanceUserProgress).join(FinanceInfo).filter(
            FinanceInfo.category == category
        ).count()
        percentage = (learned / total * 100) if total > 0 else 0
        category_stats[category] = {
            'total': total,
            'learned': learned,
            'percentage': round(percentage, 1)
        }
    
    # 주간 활동
    weekly_activity = []
    for i in range(4):
        week_start = datetime.now() - timedelta(weeks=i)
        week_end = week_start + timedelta(weeks=1)
        
        users = db.query(func.count(func.distinct(FinanceUserProgress.user_id))).filter(
            and_(
                FinanceUserProgress.created_at >= week_start,
                FinanceUserProgress.created_at < week_end
            )
        ).scalar()
        
        terms = db.query(func.count(FinanceUserProgress.id)).filter(
            and_(
                FinanceUserProgress.created_at >= week_start,
                FinanceUserProgress.created_at < week_end
            )
        ).scalar()
        
        quizzes = db.query(func.count(FinanceQuizScore.id)).filter(
            and_(
                FinanceQuizScore.created_at >= week_start,
                FinanceQuizScore.created_at < week_end
            )
        ).scalar()
        
        weekly_activity.append({
            'week': week_start.strftime('%Y-%m-%d'),
            'users': users,
            'terms': terms,
            'quizzes': quizzes
        })
    
    weekly_activity.reverse()
    
    # 월간 활동
    monthly_activity = []
    for i in range(6):
        month_start = datetime.now().replace(day=1) - timedelta(days=30*i)
        month_end = month_start.replace(day=28) + timedelta(days=4)
        month_end = month_end.replace(day=1) - timedelta(days=1)
        
        users = db.query(func.count(func.distinct(FinanceUserProgress.user_id))).filter(
            and_(
                FinanceUserProgress.created_at >= month_start,
                FinanceUserProgress.created_at <= month_end
            )
        ).scalar()
        
        terms = db.query(func.count(FinanceUserProgress.id)).filter(
            and_(
                FinanceUserProgress.created_at >= month_start,
                FinanceUserProgress.created_at <= month_end
            )
        ).scalar()
        
        quizzes = db.query(func.count(FinanceQuizScore.id)).filter(
            and_(
                FinanceQuizScore.created_at >= month_start,
                FinanceQuizScore.created_at <= month_end
            )
        ).scalar()
        
        monthly_activity.append({
            'month': month_start.strftime('%Y-%m'),
            'users': users,
            'terms': terms,
            'quizzes': quizzes
        })
    
    monthly_activity.reverse()
    
    # 상위 사용자
    top_users = db.query(
        User.id.label('user_id'),
        User.username,
        func.count(FinanceUserProgress.id).label('learned_count'),
        func.avg(FinanceQuizScore.score).label('quiz_score')
    ).outerjoin(FinanceUserProgress).outerjoin(FinanceQuizScore).group_by(
        User.id, User.username
    ).order_by(
        func.count(FinanceUserProgress.id).desc()
    ).limit(10).all()
    
    top_users_list = []
    for user in top_users:
        top_users_list.append({
            'user_id': user.user_id,
            'username': user.username,
            'learned_count': user.learned_count or 0,
            'quiz_score': round(float(user.quiz_score or 0), 1)
        })
    
    return {
        'total_users': total_users,
        'total_terms': total_terms,
        'total_learned': total_learned,
        'total_quizzes': total_quizzes,
        'total_quiz_attempts': total_quiz_attempts,
        'average_score': average_score,
        'difficulty_stats': difficulty_stats,
        'category_stats': category_stats,
        'weekly_activity': weekly_activity,
        'monthly_activity': monthly_activity,
        'top_users': top_users_list
    } 