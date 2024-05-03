from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import gemini, groq, llm, prompts, sql
from starlette.responses import RedirectResponse

prefix = ""

app = FastAPI(docs_url=f"{prefix}/docs", openapi_url=f"{prefix}/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter()


@router.get("/", include_in_schema=False)
async def root():
    return RedirectResponse("docs")


app.include_router(router, prefix=prefix)
app.include_router(router=gemini.router, prefix=prefix)
app.include_router(router=llm.router, prefix=prefix)
app.include_router(router=prompts.router, prefix=prefix)
app.include_router(router=sql.router, prefix=prefix)
app.include_router(router=groq.router, prefix=prefix)
# app.include_router(openai.router, prefix="/api")
# app.include_router(faiss.router, prefix="/api")
# app.include_router(files.router, prefix="/api")
# app.include_router(translator.router, prefix="/api")
