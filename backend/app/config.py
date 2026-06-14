from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    anthropic_bearer_token: str = ""
    anthropic_endpoint_url_bedrock_runtime: str = ""
    openai_api_key: str = ""
    openai_base_url: str = ""
    llm_provider: str = "anthropic"
    llm_model: str = "claude-sonnet-4-20250514"
    max_rounds: int = 5
    cors_origins: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()
