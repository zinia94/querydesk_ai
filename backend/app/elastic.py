from elasticsearch import Elasticsearch
from uuid import uuid4
import os

ELASTIC_HOST = os.getenv("ELASTIC_HOST", "http://localhost:9200")
INDEX_NAME = "querydesk_documents"

client = Elasticsearch(ELASTIC_HOST)

def index_document(text:str, embedding:list, metadata:dict, doc_id=None):
    doc_id = doc_id or str(uuid4())
    
    body = {
        "text": text,
        "embedding": embedding,
        "metadata": metadata
    }
    
    client.index(index=INDEX_NAME, id= doc_id, document = body)
    return {"id": doc_id}

def search_similar_documents(query_embedding: list, top_k: int = 5):
    search_query = {
        "size": top_k,
        "query": {
            "script_score": {
                "query": {"match_all": {}},
                "script": {
                    "source": "cosineSimilarity(params.query_vector, 'embedding') + 1.0",
                    "params": {"query_vector": query_embedding}
                }
            }
        }
    }
    
    response = client.search(index = INDEX_NAME, body = search_query)
    hits = response["hits"]["hits"]
    
    results = []
    for hit in hits:
        results.append({
            "id": hit["_id"],
            "score": hit["_score"],
            "text": hit["_source"]["text"],
            "metadata": hit["_source"].get("metadata", {})
        })
    return results