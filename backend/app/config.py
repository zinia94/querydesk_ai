
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    elasticsearch_url: str
    index_name: str
    frontend_url: str
    embed_model: str
    
    class Config:
        env_file = ".env"

settings = Settings()