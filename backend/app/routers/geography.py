from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.all_models import District, Block, Panchayat, Village

router = APIRouter(prefix="/geography", tags=["Geography"])

@router.get("/tree")
def get_geography_tree(db: Session = Depends(get_db)):
    districts = db.query(District).all()
    result = []
    for d in districts:
        blocks_data = []
        for b in d.blocks:
            panchayats_data = []
            for p in b.panchayats:
                villages_data = [
                    {"id": v.id, "name_en": v.name_en, "name_hi": v.name_hi}
                    for v in p.villages
                ]
                panchayats_data.append({
                    "id": p.id,
                    "name_en": p.name_en,
                    "name_hi": p.name_hi,
                    "villages": villages_data
                })
            blocks_data.append({
                "id": b.id,
                "name_en": b.name_en,
                "name_hi": b.name_hi,
                "panchayats": panchayats_data
            })
        result.append({
            "id": d.id,
            "name_en": d.name_en,
            "name_hi": d.name_hi,
            "state": d.state,
            "blocks": blocks_data
        })
    return result

@router.get("/panchayats")
def get_panchayats(db: Session = Depends(get_db)):
    panchayats = db.query(Panchayat).all()
    return [
        {
            "id": p.id,
            "name_en": p.name_en,
            "name_hi": p.name_hi,
            "block_id": p.block_id,
            "villages_count": len(p.villages)
        }
        for p in panchayats
    ]
