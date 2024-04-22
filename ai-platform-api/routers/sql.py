import utils.sql_alchemy_utils
from fastapi import APIRouter, Depends
from sqlalchemy.sql import text

router = APIRouter(prefix="/sql", tags=["sql"])


@router.get("/health_check")
async def health_check(db=Depends(utils.sql_alchemy_utils.get_db)):
    # This is a simple health check endpoint that returns 200 if the database is up and running
    result = db.execute(text("SELECT 1"))
    if result.scalar() == 1:
        return {"status": True}
    else:
        return {"status": False}
