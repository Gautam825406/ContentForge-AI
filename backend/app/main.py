import logging
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.graph import run_generation
from app.schemas import ErrorDetail, ErrorResponse, GenerateRequest, GenerateResponse
from app.settings import get_settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger("contentforge")
settings = get_settings()

app = FastAPI(title="ContentForge AI", version="1.0.0", description="LangGraph blog generation powered by Groq")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1):\d+$" if settings.app_env == "development" else None,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request.state.request_id = request.headers.get("X-Request-ID") or uuid4().hex
    response = await call_next(request)
    response.headers["X-Request-ID"] = request.state.request_id
    return response


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    details = [
        {"field": ".".join(str(part) for part in error["loc"]), "message": error["msg"]}
        for error in exc.errors()
    ]
    payload = ErrorResponse(
        request_id=getattr(request.state, "request_id", uuid4().hex),
        error=ErrorDetail(code="invalid_request", message="Please check the supplied fields.", details=details),
    )
    return JSONResponse(status_code=422, content=payload.model_dump())


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/ready")
async def ready():
    configured = bool(settings.groq_api_key)
    return JSONResponse(
        status_code=200 if configured else 503,
        content={"ready": configured, "groq_configured": configured},
    )


@app.post("/api/v1/blogs/generate", response_model=GenerateResponse, response_model_exclude_none=True)
async def generate_blog(payload: GenerateRequest, request: Request):
    request_id = request.state.request_id
    if not settings.groq_api_key:
        error = ErrorResponse(
            request_id=request_id,
            error=ErrorDetail(code="service_not_configured", message="Set GROQ_API_KEY in the backend environment."),
        )
        return JSONResponse(status_code=503, content=error.model_dump())

    graph_state = {
        "source": payload.source,
        "source_type": payload.source_type,
        "audience": payload.audience,
        "tone": payload.tone,
        "target_length_words": payload.target_length_words,
        "target_language": payload.target_language.strip() if payload.target_language else None,
    }
    try:
        result = await run_generation(settings, graph_state)
        logger.info("Generation completed request_id=%s source_type=%s", request_id, payload.source_type)
        return GenerateResponse(
            request_id=request_id,
            status="completed",
            source_type=payload.source_type,
            title=result["title"],
            title_candidates=result["title_candidates"],
            article=result["article"],
            translation=(
                {"language": graph_state["target_language"], **result["translation"].model_dump()}
                if result.get("translation")
                else None
            ),
        )
    except Exception:
        logger.exception("Generation failed request_id=%s", request_id)
        error = ErrorResponse(
            request_id=request_id,
            error=ErrorDetail(
                code="generation_failed",
                message="The article could not be generated. Check the server logs and try again.",
            ),
        )
        return JSONResponse(status_code=502, content=error.model_dump())