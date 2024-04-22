import routers.gemini
import schemas.llm_schemas
from fastapi import APIRouter

router = APIRouter(prefix="/llm", tags=["llm"])


@router.get("/models", response_model=schemas.llm_schemas.ResModels)
async def get_models():
    gemini_models = [
        {
            "model": model.display_name,
            "deployment_id": model.name,
            "version": model.version,
        }
        for model in await routers.gemini.get_models()
    ]

    return {"models": {schemas.llm_schemas.LLMTypeEnum.GEMINI.value: gemini_models}}


@router.post("/chat")
async def chat(params: schemas.llm_schemas.ReqChat):
    if params.llm_type == schemas.llm_schemas.LLMTypeEnum.GEMINI.value:
        return await routers.gemini.chat(params)
