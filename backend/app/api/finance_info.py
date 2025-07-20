from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import json

from ..database import get_db
from ..models import FinanceInfo, FinanceTerm, UserFinanceProgress, UserFinanceQuiz
from ..schemas import FinanceInfoCreate, FinanceInfoResponse, FinanceTermCreate, FinanceTermResponse

router = APIRouter()

@router.post("/finance-info", response_model=FinanceInfoResponse)
def create_finance_info(finance_info: FinanceInfoCreate, db: Session = Depends(get_db)):
    """금융 정보 생성"""
    db_finance_info = FinanceInfo(
        title=finance_info.title,
        content=finance_info.content,
        date=finance_info.date,
        source=finance_info.source
    )
    db.add(db_finance_info)
    db.commit()
    db.refresh(db_finance_info)
    return db_finance_info

@router.get("/finance-info", response_model=List[FinanceInfoResponse])
def get_finance_info(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """금융 정보 목록 조회"""
    finance_info = db.query(FinanceInfo).offset(skip).limit(limit).all()
    return finance_info

@router.get("/finance-info/{finance_info_id}", response_model=FinanceInfoResponse)
def get_finance_info_by_id(finance_info_id: int, db: Session = Depends(get_db)):
    """특정 금융 정보 조회"""
    finance_info = db.query(FinanceInfo).filter(FinanceInfo.id == finance_info_id).first()
    if not finance_info:
        raise HTTPException(status_code=404, detail="Finance info not found")
    return finance_info

@router.put("/finance-info/{finance_info_id}", response_model=FinanceInfoResponse)
def update_finance_info(
    finance_info_id: int,
    finance_info: FinanceInfoCreate,
    db: Session = Depends(get_db)
):
    """금융 정보 수정"""
    db_finance_info = db.query(FinanceInfo).filter(FinanceInfo.id == finance_info_id).first()
    if not db_finance_info:
        raise HTTPException(status_code=404, detail="Finance info not found")
    
    for field, value in finance_info.dict().items():
        setattr(db_finance_info, field, value)
    
    db.commit()
    db.refresh(db_finance_info)
    return db_finance_info

@router.delete("/finance-info/{finance_info_id}")
def delete_finance_info(finance_info_id: int, db: Session = Depends(get_db)):
    """금융 정보 삭제"""
    db_finance_info = db.query(FinanceInfo).filter(FinanceInfo.id == finance_info_id).first()
    if not db_finance_info:
        raise HTTPException(status_code=404, detail="Finance info not found")
    
    db.delete(db_finance_info)
    db.commit()
    return {"message": "Finance info deleted successfully"}

@router.post("/finance-terms", response_model=FinanceTermResponse)
def create_finance_term(finance_term: FinanceTermCreate, db: Session = Depends(get_db)):
    """금융 용어 생성"""
    db_finance_term = FinanceTerm(
        term=finance_term.term,
        definition=finance_term.definition,
        finance_info_id=finance_term.finance_info_id,
        difficulty=finance_term.difficulty
    )
    db.add(db_finance_term)
    db.commit()
    db.refresh(db_finance_term)
    return db_finance_term

@router.get("/finance-terms", response_model=List[FinanceTermResponse])
def get_finance_terms(
    finance_info_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """금융 용어 목록 조회"""
    query = db.query(FinanceTerm)
    if finance_info_id:
        query = query.filter(FinanceTerm.finance_info_id == finance_info_id)
    return query.all()

@router.get("/finance-terms/{term_id}", response_model=FinanceTermResponse)
def get_finance_term_by_id(term_id: int, db: Session = Depends(get_db)):
    """특정 금융 용어 조회"""
    finance_term = db.query(FinanceTerm).filter(FinanceTerm.id == term_id).first()
    if not finance_term:
        raise HTTPException(status_code=404, detail="Finance term not found")
    return finance_term

@router.put("/finance-terms/{term_id}", response_model=FinanceTermResponse)
def update_finance_term(
    term_id: int,
    finance_term: FinanceTermCreate,
    db: Session = Depends(get_db)
):
    """금융 용어 수정"""
    db_finance_term = db.query(FinanceTerm).filter(FinanceTerm.id == term_id).first()
    if not db_finance_term:
        raise HTTPException(status_code=404, detail="Finance term not found")
    
    for field, value in finance_term.dict().items():
        setattr(db_finance_term, field, value)
    
    db.commit()
    db.refresh(db_finance_term)
    return db_finance_term

@router.delete("/finance-terms/{term_id}")
def delete_finance_term(term_id: int, db: Session = Depends(get_db)):
    """금융 용어 삭제"""
    db_finance_term = db.query(FinanceTerm).filter(FinanceTerm.id == term_id).first()
    if not db_finance_term:
        raise HTTPException(status_code=404, detail="Finance term not found")
    
    db.delete(db_finance_term)
    db.commit()
    return {"message": "Finance term deleted successfully"}

@router.get("/finance-info-with-terms")
def get_finance_info_with_terms(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """금융 정보와 관련 용어들을 함께 조회"""
    finance_info_list = db.query(FinanceInfo).offset(skip).limit(limit).all()
    
    result = []
    for info in finance_info_list:
        terms = db.query(FinanceTerm).filter(FinanceTerm.finance_info_id == info.id).all()
        info_dict = {
            "id": info.id,
            "title": info.title,
            "content": info.content,
            "date": info.date,
            "source": info.source,
            "terms": [
                {
                    "id": term.id,
                    "term": term.term,
                    "definition": term.definition,
                    "difficulty": term.difficulty
                }
                for term in terms
            ]
        }
        result.append(info_dict)
    
    return result 