from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import FinancialBaseContent
from ..schemas import FinancialBaseContentCreate, FinancialBaseContentResponse

router = APIRouter()

@router.get("/", response_model=List[FinancialBaseContentResponse])
def get_all_financial_base_contents(db: Session = Depends(get_db)):
    contents = db.query(FinancialBaseContent).order_by(FinancialBaseContent.created_at.desc()).all()
    return contents

@router.options("/")
def options_financial_base_content():
    return Response(status_code=200)

@router.post("/", response_model=FinancialBaseContentResponse)
def add_financial_base_content(content_data: FinancialBaseContentCreate, db: Session = Depends(get_db)):
    from datetime import datetime
    db_content = FinancialBaseContent(
        title=content_data.title,
        content=content_data.content,
        category=content_data.category,
        created_at=datetime.now()
    )
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    return db_content

@router.put("/{content_id}", response_model=FinancialBaseContentResponse)
def update_financial_base_content(content_id: int, content_data: FinancialBaseContentCreate, db: Session = Depends(get_db)):
    content = db.query(FinancialBaseContent).filter(FinancialBaseContent.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Financial base content not found")
    content.title = content_data.title
    content.content = content_data.content
    content.category = content_data.category
    db.commit()
    db.refresh(content)
    return content

@router.delete("/{content_id}")
def delete_financial_base_content(content_id: int, db: Session = Depends(get_db)):
    content = db.query(FinancialBaseContent).filter(FinancialBaseContent.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Financial base content not found")
    db.delete(content)
    db.commit()
    return {"message": "Financial base content deleted successfully"}

@router.get("/category/{category}", response_model=List[FinancialBaseContentResponse])
def get_financial_base_contents_by_category(category: str, db: Session = Depends(get_db)):
    contents = db.query(FinancialBaseContent).filter(FinancialBaseContent.category == category).all()
    return contents 