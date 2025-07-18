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
    return {"message": "Progress updated successfully"}

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