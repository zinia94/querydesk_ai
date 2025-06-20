// React + TypeScript Semantic Search Frontend with Styled Split Layout + File OR Text Upload + Modal with Delete
// Project: QueryDesk_AI

import React, { useRef, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import './App.css';

interface SearchResult {
  id: string;
  score: number;
  text: string;
  metadata: Record<string, any>;
}

type SearchPayload = {
  query: string;
  top_k: number;
  department: string;
};

const departments = ['HR', 'IT', 'Finance', 'Support'];
const search_departments = ['All', ...departments];
const MAX_LINES = 3;

Modal.setAppElement('#root');

const App: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [searchDept, setSearchDept] = useState<string>('All');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [docText, setDocText] = useState<string>('');
  const [docDept, setDocDept] = useState<string>('HR');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [docTitle, setDocTitle] = useState<string>('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalKey, setModalKey] = useState('');

  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const truncateByLines = (text: string, maxLines: number) => {
    const lines = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    const truncated = lines.slice(0, maxLines).join('\n');
    const isTruncated = lines.length > maxLines;
    return { truncated, isTruncated };
  };

  const handleSearch = async () => {
    try {
      let payload: SearchPayload = { query, top_k: 5, department: "" };
      if (searchDept !== 'All') payload.department = searchDept;

      const response = await axios.post<SearchResult[]>(
        `${baseUrl}/search`,
        payload
      );
      setResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleUpload = async () => {
    try {
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('department', docDept);
        formData.append('title', docTitle )

        await axios.post(`${baseUrl}/upload-file`, formData);
        alert('File uploaded and indexed successfully');
        setFile(null);
        setDocTitle('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else if (docText.trim()) {
        await axios.post(`${baseUrl}/upload`, {
          text: docText,
          metadata: {
            department: docDept,
            ...(docTitle.trim() && { title: docTitle.trim() })
          }
        });
        alert('Text uploaded successfully');
        setDocText('');
        setDocTitle('');
      } else {
        alert('Please provide either a text or a file to upload.');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload document.');
    }
  };

  const handleShowFullDoc = async (metadata: Record<string, any>) => {
    const docKey = metadata.doc_id;
    try {
      const response = await axios.get(`${baseUrl}/document/full/doc_id/${docKey}`);
      setModalText(response.data.text);
      setModalTitle(metadata.title || metadata.source ||  "Unnamed Entry");
      setModalKey(docKey);
      setModalOpen(true);
    } catch (err) {
      alert("Failed to load full document");
      console.error(err);
    }
  };

  const handleDeleteDocument = async () => {
    if (!modalTitle) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete "${modalTitle}"?`);
    if (!confirmDelete) return;

    try {
      await axios.delete(`${baseUrl}/delete/doc_id/${modalKey}`);
      alert("Document deleted successfully.");
      setModalOpen(false);
      setResults(results.filter(r => r.metadata?.source !== modalTitle));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete document.");
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">🔍 QueryDesk<span className="highlight"> AI</span></h1>
        <p className="subtitle">Semantic Search for Smarter Workflows</p>
      </header>

      <div className="split-layout">
        <div className="search-pane">
          <h3 className="section-title">Search Documents</h3>
          <div className="search-section">
            <input
              className="input"
              type="text"
              placeholder="Try: How do I access my payslip?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <select
              className="dropdown"
              value={searchDept}
              onChange={(e) => setSearchDept(e.target.value)}
            >
              {search_departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <button className="button" onClick={handleSearch}>Search</button>
          </div>

          <div className="results">
            {results.map((item, idx) => {
              const { truncated, isTruncated } = truncateByLines(item.text, MAX_LINES);
              
              return (
                <div key={item.id} className="card">
                  <p><strong>Result {idx + 1}</strong></p>
                  <p className="result-text">
                    {isTruncated ? truncated + '\n...' : item.text}
                  </p>
                  <p className="show-more" onClick={() => handleShowFullDoc(item.metadata)}>
                    Show more
                  </p>
                  {item.metadata?.department && (
                    <p className="metadata">
                      <em>Department: {item.metadata.department}</em>
                      {
                      item.metadata && item.metadata.source && !item.metadata.source.startsWith("manual_") &&
                       <em>Source: {item.metadata.source}</em>
                      }
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="upload-pane">
          <h3 className="section-title">Upload a Document</h3>
          <input
            className="input"
            type="text"
            placeholder="Enter document title (optional)"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            style={{ marginBottom: '0.5rem' }}
          />
          <textarea
            className="textarea"
            value={docText}
            onChange={(e) => setDocText(e.target.value)}
            placeholder="Paste your document text here..."
            rows={6}
            disabled={!!file}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            style={{ marginTop: '1rem' }}
            disabled={!!docText.trim()}
          />
          <div className="upload-controls">
            <select
              className="dropdown"
              value={docDept}
              onChange={(e) => setDocDept(e.target.value)}
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <button className="button" onClick={handleUpload}>Upload</button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        contentLabel="Full Document"
        style={{
          content: {
            maxWidth: '800px',
            margin: 'auto',
            padding: '2rem',
          },
        }}
      >
        <h2>{modalTitle}</h2>
        <div style={{ whiteSpace: 'pre-wrap', marginTop: '1rem' }}>{modalText}</div>
        <div style={{ marginTop: '1rem' }}>
          <button className="button" onClick={() => setModalOpen(false)}>
            Close
          </button>
        </div>
        <div style={{ marginTop: '0.5rem' }}>
          <button
            className="button danger"
            onClick={handleDeleteDocument}
            style={{ backgroundColor: '#d63031' }}
          >
            Delete Document
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default App;
