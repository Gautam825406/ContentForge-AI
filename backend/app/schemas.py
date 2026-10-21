from typing import Literal

from pydantic import BaseModel, Field, model_validator


class GenerateRequest(BaseModel):
    topic: str | None = Field(default=None, max_length=5000)
    transcript: str | None = Field(default=None, max_length=40000)
    audience: str | None = Field(default=None, max_length=100)
    tone: str = Field(default="Warm and insightful", max_length=80)
    target_length_words: int = Field(default=1200, ge=600, le=2000)
    target_language: str | None = Field(default=None, max_length=60)

    @model_validator(mode="after")
    def validate_source(self) -> "GenerateRequest":
        has_topic = bool(self.topic and self.topic.strip())
        has_transcript = bool(self.transcript and self.transcript.strip())
        if has_topic == has_transcript:
            raise ValueError("Provide exactly one non-empty topic or transcript.")
        return self

    @property
    def source_type(self) -> Literal["topic", "transcript"]:
        return "topic" if self.topic and self.topic.strip() else "transcript"

    @property
    def source(self) -> str:
        return (self.topic if self.source_type == "topic" else self.transcript or "").strip()


class ArticleSection(BaseModel):
    heading: str
    body: str


class BlogArticle(BaseModel):
    introduction: str
    sections: list[ArticleSection] = Field(min_length=2, max_length=8)
    conclusion: str


class TitleIdeas(BaseModel):
    candidates: list[str] = Field(min_length=3, max_length=5)


class TranslationResult(BaseModel):
    language: str
    title: str
    article: BlogArticle


class GenerateResponse(BaseModel):
    request_id: str
    status: Literal["completed"]
    source_type: Literal["topic", "transcript"]
    title: str
    title_candidates: list[str]
    article: BlogArticle
    translation: TranslationResult | None = None


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: list[dict[str, str]] = Field(default_factory=list)


class ErrorResponse(BaseModel):
    request_id: str
    error: ErrorDetail