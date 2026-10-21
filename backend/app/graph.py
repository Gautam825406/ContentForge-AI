from typing import Literal, TypedDict

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import END, START, StateGraph

from app.schemas import BlogArticle, TitleIdeas, TranslationResult
from app.settings import Settings


class WorkflowState(TypedDict, total=False):
    source: str
    source_type: Literal["topic", "transcript"]
    audience: str | None
    tone: str
    target_length_words: int
    target_language: str | None
    title_candidates: list[str]
    title: str
    article: BlogArticle
    translation: TranslationResult


def should_translate(state: WorkflowState) -> Literal["translate", "finish"]:
    return "translate" if state.get("target_language") else "finish"


def build_graph(settings: Settings):
    model = ChatGroq(
        model=settings.groq_model,
        api_key=settings.groq_api_key,
        temperature=0.5,
        max_retries=1,
    )

    async def brainstorm_titles(state: WorkflowState) -> dict:
        title_model = model.with_structured_output(TitleIdeas)
        source_label = "topic" if state["source_type"] == "topic" else "video transcript"
        result = await title_model.ainvoke(
            [
                SystemMessage(
                    content="You are an inventive, precise blog editor. Suggest distinct, specific titles; avoid clickbait."
                ),
                HumanMessage(
                    content=f"Suggest 4 blog titles based on this {source_label}. Return only the requested structured data.\n\n{state['source']}"
                ),
            ]
        )
        candidates = [candidate.strip() for candidate in result.candidates if candidate.strip()]
        if not candidates:
            raise ValueError("The title agent did not return any usable title candidates.")
        return {"title_candidates": candidates, "title": candidates[0]}

    async def generate_article(state: WorkflowState) -> dict:
        article_model = model.with_structured_output(BlogArticle)
        source_label = "topic" if state["source_type"] == "topic" else "transcript"
        audience = state.get("audience") or "general readers"
        result = await article_model.ainvoke(
            [
                SystemMessage(
                    content=(
                        "You are a careful blog editor. Return a complete, readable article using the required structure. "
                        "When using a transcript, preserve its key points, do not invent quotations or claim facts were verified, "
                        "and do not mention that you are an AI."
                    )
                ),
                HumanMessage(
                    content=(
                        f"Write a blog article of approximately {state['target_length_words']} words.\n"
                        f"Title: {state['title']}\nTone: {state['tone']}\nAudience: {audience}\n"
                        f"Source type: {source_label}\nSource:\n{state['source']}"
                    )
                ),
            ]
        )
        return {"article": result}

    async def translate_article(state: WorkflowState) -> dict:
        translation_model = model.with_structured_output(TranslationResult)
        language = state["target_language"] or ""
        result = await translation_model.ainvoke(
            [
                SystemMessage(
                    content=(
                        "Translate the provided blog title and article faithfully. Preserve meaning and section structure, "
                        "tone, and formatting. Return only the requested structured data."
                    )
                ),
                HumanMessage(
                    content=f"Translate this title and article into {language}.\n\nTitle: {state['title']}\n\nArticle:\n{state['article'].model_dump_json()}"
                ),
            ]
        )
        return {"translation": result}

    workflow = StateGraph(WorkflowState)
    workflow.add_node("brainstorm_titles", brainstorm_titles)
    workflow.add_node("generate_article", generate_article)
    workflow.add_node("translate_article", translate_article)
    workflow.add_edge(START, "brainstorm_titles")
    workflow.add_edge("brainstorm_titles", "generate_article")
    workflow.add_conditional_edges(
        "generate_article",
        should_translate,
        {"translate": "translate_article", "finish": END},
    )
    workflow.add_edge("translate_article", END)
    return workflow.compile()


async def run_generation(settings: Settings, state: WorkflowState) -> WorkflowState:
    return await build_graph(settings).ainvoke(state)