from langchain_core.language_models import BaseChatModel

from app.config import settings


def get_llm() -> BaseChatModel:
    if settings.llm_provider == "anthropic":
        from langchain_anthropic import ChatAnthropic

        kwargs: dict = {
            "model": settings.llm_model,
            "max_tokens": 1024,
        }

        if settings.anthropic_bearer_token:
            kwargs["api_key"] = settings.anthropic_bearer_token

        if settings.anthropic_endpoint_url_bedrock_runtime:
            kwargs["base_url"] = settings.anthropic_endpoint_url_bedrock_runtime

        return ChatAnthropic(**kwargs)
    else:
        from langchain_openai import ChatOpenAI

        kwargs: dict = {
            "model": settings.llm_model,
            "max_tokens": 1024,
        }

        if settings.openai_api_key:
            kwargs["api_key"] = settings.openai_api_key
        if settings.openai_base_url:
            kwargs["base_url"] = settings.openai_base_url

        default_headers = {}
        if settings.openai_base_url:
            default_headers["Referer"] = settings.openai_base_url.rsplit("/v1", 1)[0] + "/"
        if default_headers:
            kwargs["default_headers"] = default_headers

        return ChatOpenAI(**kwargs)
