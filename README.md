
# QueryDesk\_AI

**QueryDesk\_AI** is a semantic search platform built with a FastAPI backend and a React (TypeScript) frontend. It enables users to upload internal documents (text, PDF, or DOCX), organize them by department, and perform intelligent semantic search with reranking, powered by Elasticsearch.


## Features

* Semantic search using embedding-based reranking
* Upload documents via text or file input
* Grouping by department and title metadata
* Automatic chunking and embedding of large documents
* Full document retrieval via `doc_id`
* Clean UI with expandable results in modal view
* Delete documents directly from the frontend
* Automatic Elasticsearch index creation


## Tech Stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Frontend     | React + TypeScript                  |
| Backend      | FastAPI (Python)                    |
| Search       | Elasticsearch                       |
| Embeddings   | `all-MiniLM-L6-v2` via HuggingFace  |
| File Parsing | `pdfplumber`, `python-docx`         |


## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/zinia94/querydesk_ai.git
cd querydesk_ai
```

### 2. Run Elasticsearch (Docker)

Elasticsearch must be running before starting the backend service.

#### For macOS users

Docker Desktop must be started manually before proceeding.

#### Start Elasticsearch

From the project root:

```bash
cd backend/scripts
./start_elasticsearch.sh
```

This will launch Elasticsearch in single-node mode using Docker Compose:

```bash
docker compose -f ../docker/elasticsearch-compose.yml up -d
```

Security features are disabled for local development.

#### Stop Elasticsearch (after finishing all tasks)

Once application tasks are complete, the Elasticsearch container can be shut down:

```bash
./stop_elasticsearch.sh
```

This ensures that resources are freed and the search service is gracefully terminated.

### 3. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

`.env` should contain backend config (Elasticsearch URL, index name, model, etc.)


### 4. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend environment variables must be defined in `frontend/.env`, for example:

```env
REACT_APP_API_BASE_URL=http://localhost:8000
```

## Running Tests (Backend)

`pytest` is used for testing the backend.

### Install `pytest` (if not already installed):

```bash
pip install pytest
```

### Run tests from the `backend` directory:

```bash
cd backend
PYTHONPATH=. pytest
```

> Note: The `PYTHONPATH=. ` prefix ensures test files can import from the `app/` module correctly.

Test files are located in `backend/tests` directory



## API Overview

| Endpoint                        | Method | Description                       |
| ------------------------------- | ------ | --------------------------------- |
| `/search`                       | POST   | Perform a semantic search         |
| `/upload`                       | POST   | Upload a text document            |
| `/upload-file`                  | POST   | Upload a file (.pdf, .docx)       |
| `/delete/doc_id/{doc_id}`       | DELETE | Delete all chunks by `doc_id`     |
| `/document/full/{key}/{doc_id}` | GET    | Retrieve the full merged document |

## Folder Structure

```
querydesk_ai/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── models.py
│   │   ├── seed_data.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── search_api.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── elastic.py
│   │   │   ├── embedding.py
│   │   │   └── utils.py
│   ├── docker/
│   │   └── elasticsearch-compose.yml
│   ├── scripts/
│   │   ├── check_elasticsearch.py
│   │   ├── start_elasticsearch.sh
│   │   └── stop_elasticsearch.sh
│   ├── tests/
|   |   ├── test_app.py
|   |   └── test_health.py
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── App.test.tsx
│   │   ├── App.css
│   │   ├── index.tsx
│   │   └── setupTests.ts
│   ├── public/
│   └── .env
├── README.md
```

## Future Improvements

* Document versioning
* User authentication and access control
* Multi-language embedding support
* Usage analytics dashboard

## About

QueryDesk\_AI was developed as part of a Master's Business Project in Computer Science, with a focus on bridging AI-powered semantic search and real-world enterprise document workflows.