from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')

def embed_text(text: str) -> list:
    embedding = model.encode(text, normalize_embeddings = True)
    return embedding.tolist()

