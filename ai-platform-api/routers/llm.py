import routers.gemini
import routers.groq
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

    groq_res = await routers.groq.get_models()

    groq_models = [
        {
            "model": model.id,
            "deployment_id": model.id,
            "version": str(model.created),
        }
        for model in groq_res.data
    ]

    return {
        "models": {
            schemas.llm_schemas.LLMTypeEnum.GEMINI.value: gemini_models,
            schemas.llm_schemas.LLMTypeEnum.GROQ.value: groq_models,
        }
    }


@router.post("/chat")
async def chat(params: schemas.llm_schemas.ReqChat):
    if params.llm_type == schemas.llm_schemas.LLMTypeEnum.GEMINI.value:
        return await routers.gemini.chat(params)

    if params.llm_type == schemas.llm_schemas.LLMTypeEnum.GROQ.value:
        return await routers.groq.chat(params)

    raise ValueError(f"Unsupported LLM type: {params.llm_type}")
