from typing import List
from app.services.utils import extract_text_from_docx, extract_text_from_pdf, process_and_index_text
from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from app.services.elastic import delete_all_by_document_id, get_full_document_text_by_group, search_similar_documents
from app.services.embedding import embed_text
from app.models import DocumentUpload, SearchRequest, SearchResult

router = APIRouter()


@router.get("/")
def root():
    return {"message": "QueryDesk_AI backend running successfully!"}

@router.post("/upload")
def upload_doc(doc: DocumentUpload):
    ids = process_and_index_text(
        text=doc.text,
        base_metadata=doc.metadata or {}
    )
    return {"message": f"{len(ids)} chunks uploaded", "ids": ids}

@router.post("/upload-file")
def upload_file(file: UploadFile = File(...), department: str = Form(...), title: str = Form(...)):
    filename = file.filename.lower()

    if filename.endswith(".pdf"):
        text = extract_text_from_pdf(file.file)
    elif filename.endswith(".docx"):
        text = extract_text_from_docx(file.file)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    base_metadata = {
        "department": department,
        "source": filename,
        "title": title
    }

    ids = process_and_index_text(text, base_metadata)
    return {"message": f"{len(ids)} chunks uploaded", "ids": ids}

@router.post("/search", response_model=List[SearchResult])
def search_docs(payload: SearchRequest):
    query_embedding = embed_text(payload.query)
    results = search_similar_documents(query_embedding, department=payload.department, top_k=payload.top_k)
    return results


@router.get("/document/full/{key}/{value}")
def get_full_document(key: str, value: str):
    doc = get_full_document_text_by_group(key, value)
    if doc["chunk_count"] == 0:
        raise HTTPException(status_code=404, detail=f"No chunks found for this document")
    return doc

@router.delete("/delete/doc_id/{doc_id}")
def delete_document_by_document_id(doc_id: str):
    result = delete_all_by_document_id(doc_id)
    deleted = result.get("deleted", 0)
    return {"message": f"Deleted {deleted} chunks from document '{doc_id}'."}