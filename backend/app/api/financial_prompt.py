from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import FinancialPrompt
from ..schemas import FinancialPromptCreate, FinancialPromptResponse

router = APIRouter()

@router.get("/", response_model=List[FinancialPromptResponse])
def get_all_financial_prompts(db: Session = Depends(get_db)):
    prompts = db.query(FinancialPrompt).order_by(FinancialPrompt.created_at.desc()).all()
    return prompts

@router.post("/", response_model=FinancialPromptResponse)
def add_financial_prompt(prompt_data: FinancialPromptCreate, db: Session = Depends(get_db)):
    from datetime import datetime
    db_prompt = FinancialPrompt(
        title=prompt_data.title,
        content=prompt_data.content,
        category=prompt_data.category,
        created_at=datetime.now()
    )
    db.add(db_prompt)
    db.commit()
    db.refresh(db_prompt)
    return db_prompt

@router.put("/{prompt_id}", response_model=FinancialPromptResponse)
def update_financial_prompt(prompt_id: int, prompt_data: FinancialPromptCreate, db: Session = Depends(get_db)):
    prompt = db.query(FinancialPrompt).filter(FinancialPrompt.id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Financial Prompt not found")
    prompt.title = prompt_data.title
    prompt.content = prompt_data.content
    prompt.category = prompt_data.category
    db.commit()
    db.refresh(prompt)
    return prompt

@router.delete("/{prompt_id}")
def delete_financial_prompt(prompt_id: int, db: Session = Depends(get_db)):
    prompt = db.query(FinancialPrompt).filter(FinancialPrompt.id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Financial Prompt not found")
    db.delete(prompt)
    db.commit()
    return {"message": "Financial Prompt deleted successfully"}

@router.get("/category/{category}", response_model=List[FinancialPromptResponse])
def get_financial_prompts_by_category(category: str, db: Session = Depends(get_db)):
    prompts = db.query(FinancialPrompt).filter(FinancialPrompt.category == category).all()
    return prompts

@router.options("/")
def options_financial_prompt():
    return Response(status_code=200) 