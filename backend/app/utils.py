import re

def chunk_text(text:str, max_words:int = 350) -> list:
    # Basic sentence splitter (for clean boundaries)
    sentences = re.split(r'(?<=[.!?]) +', text)
    
    chunks = []
    current_chunk = []
    
    for sentence in sentences:
        current_chunk.append(sentence)
        chunk = ' '.join(current_chunk)
        if len(chunk) >= max_words:
            chunks.append(chunk)
            current_chunk = []
    
    if current_chunk:
        chunks.append(' '.join(current_chunk))
    
    return chunks