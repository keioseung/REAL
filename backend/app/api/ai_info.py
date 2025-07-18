from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List
import json
import feedparser
import re
import html
from deep_translator import GoogleTranslator

from ..database import get_db
from ..models import AIInfo
from ..schemas import AIInfoCreate, AIInfoResponse, AIInfoItem

router = APIRouter()

def translate_to_ko(text):
    try:
        return GoogleTranslator(source='auto', target='ko').translate(text)
    except Exception:
        return text

def clean_summary(summary, title):
    text = re.sub(r'<[^>]+>', '', summary)
    text = html.unescape(text)
    text = text.replace('\xa0', ' ').replace('\n', ' ').strip()
    if len(text) < 10 or text.replace(' ', '') in title.replace(' ', ''):
        return None
    return text

def normalize_text(text):
    text = text.lower()
    text = re.sub(r'[-–—:·.,!?"\'\\|/]', '', text)
    text = re.sub(r'\s+', '', text)
    return text

@router.get("/{date}", response_model=List[AIInfoItem])
def get_ai_info_by_date(date: str, db: Session = Depends(get_db)):
    ai_info = db.query(AIInfo).filter(AIInfo.date == date).first()
    if not ai_info:
        return []
    
    infos = []
    if ai_info.info1_title and ai_info.info1_content:
        infos.append({"title": ai_info.info1_title, "content": ai_info.info1_content})
    if ai_info.info2_title and ai_info.info2_content:
        infos.append({"title": ai_info.info2_title, "content": ai_info.info2_content})
    if ai_info.info3_title and ai_info.info3_content:
        infos.append({"title": ai_info.info3_title, "content": ai_info.info3_content})
    
    return infos

@router.post("/", response_model=AIInfoResponse)
def add_ai_info(ai_info_data: AIInfoCreate, db: Session = Depends(get_db)):
    existing_info = db.query(AIInfo).filter(AIInfo.date == ai_info_data.date).first()
    
    if existing_info:
        # 기존 데이터 업데이트
        if len(ai_info_data.infos) >= 1:
            existing_info.info1_title = ai_info_data.infos[0].title
            existing_info.info1_content = ai_info_data.infos[0].content
        if len(ai_info_data.infos) >= 2:
            existing_info.info2_title = ai_info_data.infos[1].title
            existing_info.info2_content = ai_info_data.infos[1].content
        if len(ai_info_data.infos) >= 3:
            existing_info.info3_title = ai_info_data.infos[2].title
            existing_info.info3_content = ai_info_data.infos[2].content
        db.commit()
        db.refresh(existing_info)
        return existing_info
    else:
        # 새 데이터 생성
        db_ai_info = AIInfo(
            date=ai_info_data.date,
            info1_title=ai_info_data.infos[0].title if len(ai_info_data.infos) >= 1 else "",
            info1_content=ai_info_data.infos[0].content if len(ai_info_data.infos) >= 1 else "",
            info2_title=ai_info_data.infos[1].title if len(ai_info_data.infos) >= 2 else "",
            info2_content=ai_info_data.infos[1].content if len(ai_info_data.infos) >= 2 else "",
            info3_title=ai_info_data.infos[2].title if len(ai_info_data.infos) >= 3 else "",
            info3_content=ai_info_data.infos[2].content if len(ai_info_data.infos) >= 3 else ""
        )
        db.add(db_ai_info)
        db.commit()
        db.refresh(db_ai_info)
        return db_ai_info

@router.delete("/{date}")
def delete_ai_info(date: str, db: Session = Depends(get_db)):
    ai_info = db.query(AIInfo).filter(AIInfo.date == date).first()
    if not ai_info:
        raise HTTPException(status_code=404, detail="AI info not found")
    
    db.delete(ai_info)
    db.commit()
    return {"message": "AI info deleted successfully"}

@router.get("/dates/all")
def get_all_ai_info_dates(db: Session = Depends(get_db)):
    dates = [row.date for row in db.query(AIInfo).order_by(AIInfo.date).all()]
    return dates

@router.get("/news/fetch")
def fetch_ai_news():
    """AI 뉴스를 가져와서 번역하고 정리합니다."""
    try:
        feed = feedparser.parse('https://feeds.feedburner.com/TechCrunch/')
        news_items = []
        
        for entry in feed.entries[:10]:
            title = translate_to_ko(entry.title)
            summary = clean_summary(entry.summary, title)
            
            if summary and len(summary) > 50:
                news_items.append({
                    "title": title,
                    "content": summary,
                    "link": entry.link
                })
        
        return {"news": news_items[:3]}  # 상위 3개만 반환
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch news: {str(e)}") 

@router.options("/")
def options_ai_info():
    return Response(status_code=200) 