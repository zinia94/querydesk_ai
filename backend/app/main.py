
from app.seed_data import insert_seed_data
from app.services.elastic import does_index_exist, setup_index
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.search import router as search_router
from app.config import settings
from app.api.search import router as search_router

load_dotenv()

app = FastAPI(title = "QueryDesk_AI")

@app.get("/config-check")
def show_config():
    return {
        "index": settings.index_name,
        "elastic_url": settings.elasticsearch_url,
        "frontend_url": settings.frontend_url,
        "embed_model": settings.embed_model
    }

index_exist = does_index_exist()


if not index_exist:
    setup_index()
    insert_seed_data()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],  # frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(search_router)