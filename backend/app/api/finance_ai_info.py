from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List
import json

from ..database import get_db
from ..models import FinanceAIInfo
from ..schemas import FinanceAIInfoCreate, FinanceAIInfoResponse, FinanceAIInfoItem, FinancialTermItem

router = APIRouter()

@router.get("/{date}", response_model=List[FinanceAIInfoItem])
def get_finance_ai_info_by_date(date: str, db: Session = Depends(get_db)):
    try:
        finance_ai_info = db.query(FinanceAIInfo).filter(FinanceAIInfo.date == date).first()
        if not finance_ai_info:
            return []
        infos = []
        if finance_ai_info.info1_title and finance_ai_info.info1_content:
            try:
                terms1 = json.loads(finance_ai_info.info1_terms) if finance_ai_info.info1_terms else []
            except json.JSONDecodeError:
                terms1 = []
            infos.append({
                "title": finance_ai_info.info1_title,
                "content": finance_ai_info.info1_content,
                "terms": terms1
            })
        if finance_ai_info.info2_title and finance_ai_info.info2_content:
            try:
                terms2 = json.loads(finance_ai_info.info2_terms) if finance_ai_info.info2_terms else []
            except json.JSONDecodeError:
                terms2 = []
            infos.append({
                "title": finance_ai_info.info2_title,
                "content": finance_ai_info.info2_content,
                "terms": terms2
            })
        if finance_ai_info.info3_title and finance_ai_info.info3_content:
            try:
                terms3 = json.loads(finance_ai_info.info3_terms) if finance_ai_info.info3_terms else []
            except json.JSONDecodeError:
                terms3 = []
            infos.append({
                "title": finance_ai_info.info3_title,
                "content": finance_ai_info.info3_content,
                "terms": terms3
            })
        return infos
    except Exception as e:
        print(f"Error in get_finance_ai_info_by_date: {e}")
        return []

@router.post("/", response_model=FinanceAIInfoResponse)
def add_finance_ai_info(finance_ai_info_data: FinanceAIInfoCreate, db: Session = Depends(get_db)):
    try:
        existing_info = db.query(FinanceAIInfo).filter(FinanceAIInfo.date == finance_ai_info_data.date).first()

        def build_infos(obj):
            infos = []
            if obj.info1_title and obj.info1_content:
                try:
                    terms1 = json.loads(obj.info1_terms) if obj.info1_terms else []
                except json.JSONDecodeError:
                    terms1 = []
                infos.append({
                    "title": obj.info1_title,
                    "content": obj.info1_content,
                    "terms": terms1
                })
            if obj.info2_title and obj.info2_content:
                try:
                    terms2 = json.loads(obj.info2_terms) if obj.info2_terms else []
                except json.JSONDecodeError:
                    terms2 = []
                infos.append({
                    "title": obj.info2_title,
                    "content": obj.info2_content,
                    "terms": terms2
                })
            if obj.info3_title and obj.info3_content:
                try:
                    terms3 = json.loads(obj.info3_terms) if obj.info3_terms else []
                except json.JSONDecodeError:
                    terms3 = []
                infos.append({
                    "title": obj.info3_title,
                    "content": obj.info3_content,
                    "terms": terms3
                })
            return infos

        def terms_to_dict(terms):
            if not terms:
                return []
            return [{"term": term.term, "description": term.description} for term in terms]

        if existing_info:
            infos_to_add = [i for i in finance_ai_info_data.infos if i.title and i.content]
            fields = [
                ("info1_title", "info1_content", "info1_terms"),
                ("info2_title", "info2_content", "info2_terms"),
                ("info3_title", "info3_content", "info3_terms"),
            ]
            for i, (title_field, content_field, terms_field) in enumerate(fields):
                if getattr(existing_info, title_field) == '' or getattr(existing_info, content_field) == '':
                    if infos_to_add:
                        info = infos_to_add.pop(0)
                        setattr(existing_info, title_field, info.title)
                        setattr(existing_info, content_field, info.content)
                        setattr(existing_info, terms_field, json.dumps(terms_to_dict(info.terms or [])))
            db.commit()
            db.refresh(existing_info)
            return {
                "id": existing_info.id,
                "date": existing_info.date,
                "infos": build_infos(existing_info),
                "created_at": str(existing_info.created_at) if existing_info.created_at else None
            }
        else:
            db_finance_ai_info = FinanceAIInfo(
                date=finance_ai_info_data.date,
                info1_title=finance_ai_info_data.infos[0].title if len(finance_ai_info_data.infos) >= 1 else "",
                info1_content=finance_ai_info_data.infos[0].content if len(finance_ai_info_data.infos) >= 1 else "",
                info1_terms=json.dumps(terms_to_dict(finance_ai_info_data.infos[0].terms or [])) if len(finance_ai_info_data.infos) >= 1 else "[]",
                info2_title=finance_ai_info_data.infos[1].title if len(finance_ai_info_data.infos) >= 2 else "",
                info2_content=finance_ai_info_data.infos[1].content if len(finance_ai_info_data.infos) >= 2 else "",
                info2_terms=json.dumps(terms_to_dict(finance_ai_info_data.infos[1].terms or [])) if len(finance_ai_info_data.infos) >= 2 else "[]",
                info3_title=finance_ai_info_data.infos[2].title if len(finance_ai_info_data.infos) >= 3 else "",
                info3_content=finance_ai_info_data.infos[2].content if len(finance_ai_info_data.infos) >= 3 else "",
                info3_terms=json.dumps(terms_to_dict(finance_ai_info_data.infos[2].terms or [])) if len(finance_ai_info_data_data.infos) >= 3 else "[]"
            )
            db.add(db_finance_ai_info)
            db.commit()
            db.refresh(db_finance_ai_info)
            return {
                "id": db_finance_ai_info.id,
                "date": db_finance_ai_info.date,
                "infos": build_infos(db_finance_ai_info),
                "created_at": str(db_finance_ai_info.created_at) if db_finance_ai_info.created_at else None
            }
    except Exception as e:
        print(f"Error in add_finance_ai_info: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to add Finance AI info: {str(e)}")

@router.delete("/{date}")
def delete_finance_ai_info(date: str, db: Session = Depends(get_db)):
    finance_ai_info = db.query(FinanceAIInfo).filter(FinanceAIInfo.date == date).first()
    if not finance_ai_info:
        raise HTTPException(status_code=404, detail="Finance AI info not found")
    db.delete(finance_ai_info)
    db.commit()
    return {"message": "Finance AI info deleted successfully"}

@router.get("/dates/all")
def get_all_finance_ai_info_dates(db: Session = Depends(get_db)):
    dates = [row.date for row in db.query(FinanceAIInfo).order_by(FinanceAIInfo.date).all()]
    return dates 