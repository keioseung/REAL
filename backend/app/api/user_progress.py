from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import json

from ..database import get_db
from ..models import UserProgress
from ..schemas import UserProgressCreate, UserProgressResponse

router = APIRouter()

@router.get("/{session_id}", response_model=Dict[str, Any])
def get_user_progress(session_id: str, db: Session = Depends(get_db)):
    progress = db.query(UserProgress).filter(UserProgress.session_id == session_id).all()
    result = {}
    for p in progress:
        if p.learned_info:
            result[p.date] = json.loads(p.learned_info)
    return result

@router.post("/{session_id}/{date}/{info_index}")
def update_user_progress(session_id: str, date: str, info_index: int, db: Session = Depends(get_db)):
    """사용자의 학습 진행상황을 업데이트하고 통계를 계산합니다."""
    progress = db.query(UserProgress).filter(
        UserProgress.session_id == session_id, 
        UserProgress.date == date
    ).first()
    
    if progress:
        learned = json.loads(progress.learned_info) if progress.learned_info else []
        if info_index not in learned:
            learned.append(info_index)
            progress.learned_info = json.dumps(learned)
    else:
        learned = [info_index]
        progress = UserProgress(
            session_id=session_id, 
            date=date, 
            learned_info=json.dumps(learned), 
            stats=None
        )
        db.add(progress)
    
    db.commit()
    
    # 통계 업데이트
    update_user_statistics(session_id, db)
    
    return {"message": "Progress updated successfully"}

def update_user_statistics(session_id: str, db: Session):
    """사용자의 통계를 계산하고 업데이트합니다."""
    # 모든 학습 기록 가져오기
    all_progress = db.query(UserProgress).filter(
        UserProgress.session_id == session_id,
        UserProgress.date != '__stats__'
    ).all()
    
    total_learned = 0
    learned_dates = []
    
    for p in all_progress:
        if p.learned_info:
            try:
                learned_indices = json.loads(p.learned_info)
                total_learned += len(learned_indices)
                learned_dates.append(p.date)
            except json.JSONDecodeError:
                continue
    
    # 연속 학습일 계산
    streak_days = 0
    last_learned_date = None
    
    if learned_dates:
        # 날짜 정렬
        learned_dates.sort()
        last_learned_date = learned_dates[-1]
        
        # 연속 학습일 계산
        current_date = last_learned_date
        streak_count = 0
        
        while current_date in learned_dates:
            streak_count += 1
            # 이전 날짜 계산
            from datetime import datetime, timedelta
            current_dt = datetime.strptime(current_date, '%Y-%m-%d')
            current_dt = current_dt - timedelta(days=1)
            current_date = current_dt.strftime('%Y-%m-%d')
        
        streak_days = streak_count
    
    # 기존 통계 가져오기
    stats_progress = db.query(UserProgress).filter(
        UserProgress.session_id == session_id,
        UserProgress.date == '__stats__'
    ).first()
    
    current_stats = {}
    if stats_progress and stats_progress.stats:
        try:
            current_stats = json.loads(stats_progress.stats)
        except json.JSONDecodeError:
            current_stats = {}
    
    # 새로운 통계
    new_stats = {
        'total_learned': total_learned,
        'streak_days': streak_days,
        'last_learned_date': last_learned_date,
        'quiz_score': current_stats.get('quiz_score', 0),
        'achievements': current_stats.get('achievements', [])
    }
    
    # 통계 저장
    if stats_progress:
        stats_progress.stats = json.dumps(new_stats)
    else:
        stats_progress = UserProgress(
            session_id=session_id,
            date='__stats__',
            learned_info=None,
            stats=json.dumps(new_stats)
        )
        db.add(stats_progress)
    
    db.commit()

@router.get("/stats/{session_id}")
def get_user_stats(session_id: str, db: Session = Depends(get_db)):
    progress = db.query(UserProgress).filter(
        UserProgress.session_id == session_id, 
        UserProgress.date == '__stats__'
    ).first()
    
    if progress and progress.stats:
        return json.loads(progress.stats)
    
    return {
        'total_learned': 0,
        'streak_days': 0,
        'last_learned_date': None,
        'quiz_score': 0,
        'achievements': []
    }

@router.post("/stats/{session_id}")
def update_user_stats(session_id: str, stats: Dict[str, Any], db: Session = Depends(get_db)):
    progress = db.query(UserProgress).filter(
        UserProgress.session_id == session_id, 
        UserProgress.date == '__stats__'
    ).first()
    
    if progress:
        progress.stats = json.dumps(stats)
    else:
        progress = UserProgress(
            session_id=session_id, 
            date='__stats__', 
            learned_info=None, 
            stats=json.dumps(stats)
        )
        db.add(progress)
    
    db.commit()
    return {"message": "Stats updated successfully"}

@router.post("/quiz-score/{session_id}")
def update_quiz_score(session_id: str, score_data: dict, db: Session = Depends(get_db)):
    """퀴즈 점수를 업데이트합니다."""
    score = score_data.get('score', 0)
    total_questions = score_data.get('total_questions', 1)
    
    # 점수 계산 (백분율)
    quiz_score = int((score / total_questions) * 100) if total_questions > 0 else 0
    
    # 기존 통계 가져오기
    stats_progress = db.query(UserProgress).filter(
        UserProgress.session_id == session_id,
        UserProgress.date == '__stats__'
    ).first()
    
    current_stats = {}
    if stats_progress and stats_progress.stats:
        try:
            current_stats = json.loads(stats_progress.stats)
        except json.JSONDecodeError:
            current_stats = {}
    
    # 새로운 통계 (퀴즈 점수 업데이트)
    new_stats = {
        'total_learned': current_stats.get('total_learned', 0),
        'streak_days': current_stats.get('streak_days', 0),
        'last_learned_date': current_stats.get('last_learned_date'),
        'quiz_score': quiz_score,
        'achievements': current_stats.get('achievements', [])
    }
    
    # 통계 저장
    if stats_progress:
        stats_progress.stats = json.dumps(new_stats)
    else:
        stats_progress = UserProgress(
            session_id=session_id,
            date='__stats__',
            learned_info=None,
            stats=json.dumps(new_stats)
        )
        db.add(stats_progress)
    
    db.commit()
    
    # 성취 확인
    check_achievements(session_id, db)
    
    return {"message": "Quiz score updated successfully", "quiz_score": quiz_score}

@router.get("/achievements/{session_id}")
def check_achievements(session_id: str, db: Session = Depends(get_db)):
    """사용자의 성취를 확인하고 업데이트합니다."""
    stats = get_user_stats(session_id, db)
    achievements = stats.get('achievements', [])
    new_achievements = []
    
    # 성취 조건 확인
    if stats['total_learned'] >= 10 and 'first_10' not in achievements:
        new_achievements.append('first_10')
        achievements.append('first_10')
    
    if stats['total_learned'] >= 50 and 'first_50' not in achievements:
        new_achievements.append('first_50')
        achievements.append('first_50')
    
    if stats['streak_days'] >= 7 and 'week_streak' not in achievements:
        new_achievements.append('week_streak')
        achievements.append('week_streak')
    
    if stats['quiz_score'] >= 80 and 'quiz_master' not in achievements:
        new_achievements.append('quiz_master')
        achievements.append('quiz_master')
    
    # 새로운 성취가 있으면 업데이트
    if new_achievements:
        stats['achievements'] = achievements
        update_user_stats(session_id, stats, db)
    
    return {
        "current_achievements": achievements,
        "new_achievements": new_achievements
    } 