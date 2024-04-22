import schemas.llm_schemas
import utils.germini_utils
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/gemini", tags=["gemini"])


@router.get("/models")
async def get_models():
    try:
        return utils.germini_utils.genai.list_models()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat")
async def chat(params: schemas.llm_schemas.ReqChatBase):
    messages = [
        {"role": "system", "content": params.system_prompt},
        {"role": "assistant", "content": params.assistant_prompt},
        {"role": "user", "content": params.user_prompt},
    ]
    model = utils.germini_utils.genai.GenerativeModel(params.model)
    transformed_messages = utils.germini_utils.transform_to_gemini_style_messages(
        messages
    )

    try:
        if params.stream:
            res = model.generate_content(
                transformed_messages,
                stream=True,
            )

            def stream_generator(chunk):
                for r in chunk:
                    yield "data: " + r.text

            return StreamingResponse(
                stream_generator(res),
                media_type="text/stream",
            )
        return {"message": model.generate_content(transformed_messages).text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
