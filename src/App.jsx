import React, { useState, useRef } from 'react';
import { UploadCloud, X, Leaf, Activity, CheckCircle, AlertTriangle } from 'lucide-react';
import './index.css';

function App() {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    if (!file.type.match('image.*')) {
      setError("Please select an image file (JPEG/PNG)");
      return;
    }
    setError(null);
    setResult(null);
    setFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setFile(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
  };

  const analyzeImage = async () => {
    if (!imagePreview) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get base64 string without data url prefix
      const base64String = imagePreview.split(',')[1];
      
      // We now call our secure internal Vercel Serverless Function
      // This hides the actual backend base URL from the user's browser.
      const response = await fetch(`/api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64String })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze image. Ensure the backend is running and accessible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1><Leaf /> HealthifyAI</h1>
        <p>Discover the health impact of your food instantly</p>
      </header>

      {!result && !loading && (
        <main>
          {!imagePreview ? (
            <div 
              className={`upload-container ${dragActive ? "drag-active" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleChange}
                style={{ display: "none" }}
              />
              <UploadCloud className="upload-icon" />
              <div className="upload-text">Drag & drop your ingredient list</div>
              <div className="upload-subtext">or click to browse from your device</div>
            </div>
          ) : (
            <div className="preview-container">
              <button className="btn-remove" onClick={removeFile} aria-label="Remove image">
                <X size={18} />
              </button>
              <img src={imagePreview} alt="Ingredient Preview" className="preview-image" />
            </div>
          )}

          {error && (
            <div className="error-alert">
              <AlertTriangle size={20} />
              <span>{error}</span>
            </div>
          )}

          {imagePreview && (
            <button 
              className="btn-primary" 
              onClick={analyzeImage}
              disabled={loading}
            >
              <Activity size={20} />
              Analyze Ingredients
            </button>
          )}
        </main>
      )}

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <div className="loading-text">Analyzing your report...</div>
        </div>
      )}

      {result && !loading && (
        <div className="result-card">
          <div className="result-header">
            <h2><CheckCircle size={24} /> Health Analysis Complete</h2>
          </div>
          <div className="result-body">
            <div className="section-title">Detected Ingredients</div>
            <div className="extracted-text">
              {result.extracted_text || "No text could be extracted."}
            </div>

            <div className="section-title">AI Health Review</div>
            <div className="review-content">
              {result.review || "No review returned."}
            </div>

            <button 
              className="btn-primary" 
              style={{marginTop: '2rem'}}
              onClick={removeFile}
            >
              Scan Another Product
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
