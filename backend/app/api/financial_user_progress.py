from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import json

from ..database import get_db
from ..models import FinancialUserProgress
from ..schemas import FinancialUserProgressCreate, FinancialUserProgressResponse

router = APIRouter()

@router.get("/{session_id}", response_model=Dict[str, Any])
def get_financial_user_progress(session_id: str, db: Session = Depends(get_db)):
    progress = db.query(FinancialUserProgress).filter(FinancialUserProgress.session_id == session_id).all()
    result = {}
    for p in progress:
        if p.learned_info and not p.date.startswith('__'):
            result[p.date] = json.loads(p.learned_info)
    # 통계 정보 추가
    stats_progress = db.query(FinancialUserProgress).filter(
        FinancialUserProgress.session_id == session_id,
        FinancialUserProgress.date == '__stats__'
    ).first()
    if stats_progress and stats_progress.stats:
        try:
            stats = json.loads(stats_progress.stats)
            result.update(stats)
        except json.JSONDecodeError:
            pass
    return result

@router.post("/{session_id}/{date}/{info_index}")
def update_financial_user_progress(session_id: str, date: str, info_index: int, db: Session = Depends(get_db)):
    progress = db.query(FinancialUserProgress).filter(
        FinancialUserProgress.session_id == session_id, 
        FinancialUserProgress.date == date
    ).first()
    if progress:
        learned = json.loads(progress.learned_info) if progress.learned_info else []
        if info_index not in learned:
            learned.append(info_index)
            progress.learned_info = json.dumps(learned)
    else:
        learned = [info_index]
        progress = FinancialUserProgress(
            session_id=session_id, 
            date=date, 
            learned_info=json.dumps(learned), 
            stats=None
        )
        db.add(progress)
    db.commit()
    update_financial_user_statistics(session_id, db)
    return {"message": "Progress updated successfully", "achievement_gained": True}

@router.post("/term-progress/{session_id}")
def update_financial_term_progress(session_id: str, term_data: dict, db: Session = Depends(get_db)):
    term = term_data.get('term', '')
    date = term_data.get('date', '')
    info_index = term_data.get('info_index', 0)
    term_progress = db.query(FinancialUserProgress).filter(
        FinancialUserProgress.session_id == session_id,
        FinancialUserProgress.date == f'__terms__{date}_{info_index}'
    ).first()
    if not term_progress:
        term_progress = FinancialUserProgress(
            session_id=session_id,
            date=f'__terms__{date}_{info_index}',
            learned_info=json.dumps([term]),
            stats=None
        )
        db.add(term_progress)
    else:
        learned_terms = json.loads(term_progress.learned_info) if term_progress.learned_info else []
        if term not in learned_terms:
            learned_terms.append(term)
            term_progress.learned_info = json.dumps(learned_terms)
    db.commit()
    update_financial_user_statistics(session_id, db)
    return {"message": "Term progress updated successfully", "achievement_gained": True}

def update_financial_user_statistics(session_id: str, db: Session):
    ai_progress = db.query(FinancialUserProgress).filter(
        FinancialUserProgress.session_id == session_id,
        ~FinancialUserProgress.date.like('__%')
    ).all()
    terms_progress = db.query(FinancialUserProgress).filter(
        FinancialUserProgress.session_id == session_id,
        FinancialUserProgress.date.like('__terms__%')
    ).all()
    total_learned = 0
    total_terms_learned = 0
    learned_dates = []
    for p in ai_progress:
        if p.learned_info:
            try:
                learned_data = json.loads(p.learned_info)
                total_learned += len(learned_data)
                learned_dates.append(p.date)
            except json.JSONDecodeError:
                continue
    for p in terms_progress:
        if p.learned_info:
            try:
                learned_data = json.loads(p.learned_info)
                total_terms_learned += len(learned_data)
            except json.JSONDecodeError:
                continue
    streak_days = 0
    last_learned_date = None
    if learned_dates:
        learned_dates.sort()
        last_learned_date = learned_dates[-1]
        current_date = last_learned_date
        streak_count = 0
        while current_date in learned_dates:
            streak_count += 1
            from datetime import datetime, timedelta
            current_dt = datetime.strptime(current_date, '%Y-%m-%d')
            current_dt = current_dt - timedelta(days=1)
            current_date = current_dt.strftime('%Y-%m-%d')
        streak_days = streak_count
    stats_progress = db.query(FinancialUserProgress).filter(
        FinancialUserProgress.session_id == session_id,
        FinancialUserProgress.date == '__stats__'
    ).first()
    current_stats = {}
    if stats_progress and stats_progress.stats:
        try:
            current_stats = json.loads(stats_progress.stats)
        except json.JSONDecodeError:
            current_stats = {}
    new_stats = {
        'total_learned': total_learned,
        'total_terms_learned': total_terms_learned,
        'total_terms_available': total_terms_learned,
        'streak_days': streak_days,
        'max_streak': current_stats.get('max_streak', streak_days),
        'last_learned_date': last_learned_date,
        'quiz_score': current_stats.get('quiz_score', 0),
        'achievements': current_stats.get('achievements', [])
    }
    if stats_progress:
        stats_progress.stats = json.dumps(new_stats)
    else:
        stats_progress = FinancialUserProgress(
            session_id=session_id,
            date='__stats__',
            learned_info=None,
            stats=json.dumps(new_stats)
        )
        db.add(stats_progress)
    db.commit()

@router.get("/stats/{session_id}")
def get_financial_user_stats(session_id: str, db: Session = Depends(get_db)):
    progress = db.query(FinancialUserProgress).filter(
        FinancialUserProgress.session_id == session_id, 
        FinancialUserProgress.date == '__stats__'
    ).first()
    from datetime import datetime
    today = datetime.now().strftime('%Y-%m-%d')
    today_ai_info = 0
    today_terms = 0
    today_quiz_score = 0
    today_quiz_correct = 0
    today_quiz_total = 0
    today_progress = db.query(FinancialUserProgress).filter(
        FinancialUserProgress.session_id == session_id,
        FinancialUserProgress.date == today
    ).first()
    if today_progress and today_progress.learned_info:
        try:
            today_ai_info = len(json.loads(today_progress.learned_info))
        except json.JSONDecodeError:
            today_ai_info = 0
    today_terms_progress = db.query(FinancialUserProgress).filter(
        FinancialUserProgress.session_id == session_id,
        FinancialUserProgress.date.like(f'__terms__{today}%')
    ).all()
    for term_progress in today_terms_progress:
        if term_progress.learned_info:
            try:
                today_terms += len(json.loads(term_progress.learned_info))
            except json.JSONDecodeError:
                continue
    today_quiz_correct = 0
    today_quiz_total = 0
    today_quiz_score = 0
    return {
        "today_ai_info": today_ai_info,
        "today_terms": today_terms,
        "today_quiz_score": today_quiz_score,
        "today_quiz_correct": today_quiz_correct,
        "today_quiz_total": today_quiz_total
    } 