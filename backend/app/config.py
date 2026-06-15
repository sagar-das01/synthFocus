from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openai_api_key: str = ""
    openai_base_url: str = ""
    llm_provider: str = "openai"
    llm_model: str = "gpt-4o"
    max_rounds: int = 5
    cors_origins: str = "http://localhost:5173"

    redis_url: str = ""
    database_url: str = ""
    supabase_url: str = ""
    supabase_secret_key: str = ""
    supabase_jwt_secret: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
