import schemas.llm_schemas
import utils.groq_utils
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/groq", tags=["groq"])


@router.get("/models")
async def get_models():
    try:
        return utils.groq_utils.groq.models.list()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat")
async def chat(params: schemas.llm_schemas.ReqChatBase):
    messages = [
        {"role": "system", "content": params.system_prompt},
        {"role": "assistant", "content": params.assistant_prompt},
        {"role": "user", "content": params.user_prompt},
    ]

    try:
        res = utils.groq_utils.groq.chat.completions.create(
            messages=messages,
            model=params.model,
            temperature=params.temperature,
            stream=params.stream,
        )
        if params.stream:

            def stream_generator(chunk):
                for r in chunk:
                    if r.choices[0].delta and r.choices[0].delta.content:
                        yield "data: " + r.choices[0].delta.content

            return StreamingResponse(
                stream_generator(res),
                media_type="text/stream",
            )

        return {"message": res.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
