import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.graph import should_translate
from app.main import app
from app.schemas import GenerateRequest

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_vite_loopback_origin_is_allowed_by_cors():
    response = client.options(
        "/ready",
        headers={
            "Origin": "http://127.0.0.1:5174",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://127.0.0.1:5174"


def test_dynamic_vite_loopback_origin_is_allowed_by_cors():
    response = client.options(
        "/api/v1/blogs/generate",
        headers={
            "Origin": "http://127.0.0.1:5175",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://127.0.0.1:5175"


def test_invalid_api_request_uses_error_contract():
    response = client.post(
        "/api/v1/blogs/generate",
        json={"topic": "An idea", "transcript": "Some words"},
    )

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "invalid_request"
    assert response.json()["request_id"]


def test_topic_request_is_normalized():
    request = GenerateRequest(topic="  A small idea  ")

    assert request.source_type == "topic"
    assert request.source == "A small idea"


def test_transcript_request_is_normalized():
    request = GenerateRequest(transcript="  Spoken words  ")

    assert request.source_type == "transcript"
    assert request.source == "Spoken words"


@pytest.mark.parametrize(
    "payload",
    [{}, {"topic": "idea", "transcript": "words"}, {"topic": "  "}],
)
def test_request_requires_exactly_one_non_empty_source(payload):
    with pytest.raises(ValidationError):
        GenerateRequest(**payload)


def test_router_skips_translation_when_language_is_missing():
    assert should_translate({"target_language": None}) == "finish"


def test_router_translates_when_language_is_requested():
    assert should_translate({"target_language": "Spanish"}) == "translate"