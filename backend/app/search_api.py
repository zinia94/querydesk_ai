from typing import List
from fastapi import APIRouter

from app.elastic import index_document, search_similar_documents
from app.embedding import embed_text
from app.models import DocumentUpload, SearchRequest, SearchResult

router = APIRouter()

@router.get("/")
def root():
    return {"message": "QueryDesk_AI backend running successfully!"}

@router.post("/upload")
def upload_doc(doc: DocumentUpload):
    # TODO: need chunking for large documents
    embedding = embed_text(doc.text)
    result = index_document(doc.text, embedding, doc.metadata or {}, doc.id)
    return {"message": "Document Uploaded", "id" : result["id"] }

@router.post("/search", response_model=List[SearchResult])
def search_docs(payload: SearchRequest):
    query_embedding = embed_text(payload.query)
    results = search_similar_documents(query_embedding, top_k=payload.top_k)
    return results
