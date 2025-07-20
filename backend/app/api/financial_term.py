from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import FinancialTerm
from ..schemas import FinancialTermResponse
import random

router = APIRouter()

@router.get("/random", response_model=FinancialTermResponse)
def get_random_financial_term(db: Session = Depends(get_db)):
    terms = db.query(FinancialTerm).all()
    if not terms:
        raise HTTPException(status_code=404, detail="No financial terms found")
    term = random.choice(terms)
    return term

@router.get("/all", response_model=list[FinancialTermResponse])
def get_all_financial_terms(db: Session = Depends(get_db)):
    return db.query(FinancialTerm).all() 