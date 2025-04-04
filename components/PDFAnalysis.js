import React, { useState, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FileText, Upload, Copy, Download, AlertCircle } from 'react-feather';
import { processPDFFile } from '../lib/homeHelpers';

export default function PDFAnalysis() {
  const [file, setFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const analysisContentRef = useRef(null);

  // Check for uploaded file from home page
  useEffect(() => {
    const pdfFileName = sessionStorage.getItem('uploadedPDF');
    const pdfFile = sessionStorage.getItem('pdfFile');
    
    if (pdfFileName && pdfFile) {
      setUploadedFileName(pdfFileName);
      // Convert stored base64 back to file
      const byteCharacters = atob(pdfFile);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const file = new File([byteArray], pdfFileName, { type: 'application/pdf' });
      setFile(file);
      
      // Clear the session storage
      sessionStorage.removeItem('uploadedPDF');
      sessionStorage.removeItem('pdfFile');
      
      // Show welcome message
      toast.success(`PDF "${pdfFileName}" ready for analysis. Click "Analyze PDF" to continue.`);
    }
  }, []);

  // Add scroll observer with improved reliability
  useEffect(() => {
    let scrollInterval;
    
    const scrollToBottom = () => {
      if (analysisContentRef.current) {
        const element = analysisContentRef.current;
        element.scrollTo({
          top: element.scrollHeight,
          behavior: 'smooth'
        });
      }
    };
    
    if (analysisContentRef.current && analysis) {
      // Immediately scroll when analysis changes
      scrollToBottom();
      
      // More frequent scrolling during loading to ensure smooth following
      if (loading) {
        scrollInterval = setInterval(scrollToBottom, 200); // More frequent updates during loading
      }
      
      // Also set up MutationObserver as a backup
      const observer = new MutationObserver(() => {
        scrollToBottom();
      });
      
      observer.observe(analysisContentRef.current, {
        childList: true,
        subtree: true,
        characterData: true
      });
      
      return () => {
        observer.disconnect();
        if (scrollInterval) clearInterval(scrollInterval);
      };
    }
  }, [analysis, loading]);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles[0]?.type === 'application/pdf') {
      if (acceptedFiles[0].size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size should be less than 10MB');
        return;
      }
      setFile(acceptedFiles[0]);
      setError('');
      setAnalysis('');
    } else {
      toast.error('Please upload a PDF file');
      setFile(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const analyzePDF = async () => {
    if (!file && !uploadedFileName) {
      toast.error('Please upload a PDF file first');
      return;
    }

    setLoading(true);
    setError('');
    setProgress(0);
    setAnalysis(''); // Clear previous analysis

    try {
      // Use the processPDFFile from homeHelpers, same as the + icon
      const updateAnalysisState = (content) => {
        setAnalysis(content);
      };
      
      await processPDFFile(file, updateAnalysisState);
      toast.success('PDF analysis completed successfully!');
    } catch (err) {
      console.error('Error:', err);
      const errorMessage = err.message || 'Error analyzing PDF. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  // Helper function to format analysis text
  const formatAnalysisText = (text) => {
    if (!text) return '';
    
    // Split into sections
    const sections = text.split('\n\n');
    
    // Format each section with HTML
    const formattedSections = sections.map(section => {
      // Skip conclusion, document structure, and executive summary sections
      if (section.includes('Conclusion') || 
          section.includes('conclusion') || 
          section.includes('In conclusion') || 
          section.includes('in conclusion') ||
          section.includes('To conclude') || 
          section.includes('to conclude') ||
          section.includes('Document Structure') ||
          section.includes('document structure') ||
          section.includes('Executive Summary') ||
          section.includes('executive summary')) {
        return '';
      }
      
      if (section.startsWith('SECTION:') || section.startsWith('# ')) {
        // Main section - format as heading with icon
        const title = section.replace(/^SECTION:\s*|^# /, '').trim();
        return `<div class="main-section"><span class="section-icon">📌</span>${title}</div>`;
      } else if (section.startsWith('Sub-section:') || section.startsWith('## ')) {
        // Subsection - format as subheading with icon
        const title = section.replace(/^Sub-section:\s*|^## /, '').trim();
        return `<div class="sub-section"><span class="subsection-icon">🔹</span>${title}</div>`;
      } else if (section.match(/^[-•*]\s/) || section.match(/^\d+\.\s/)) {
        // List items - ensure consistent formatting with enhanced styling
        const items = section.split('\n').map(line => {
          const content = line.replace(/^[-•*]\s+|^\d+\.\s+/, '').trim();
          if (content) return `<div class="list-item">${content}</div>`;
          return '';
        }).join('');
        return `<div class="list-section">${items}</div>`;
      } else {
        // Regular paragraphs - trim excessive whitespace and enhance with card-like styling
        return `<div class="content-paragraph">${section.trim()}</div>`;
      }
    }).filter(section => section !== ''); // Remove empty sections

    // Join sections with consistent spacing
    return formattedSections.join('');
  };

  // Helper function to detect iOS
  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  };

  // Helper function to download analysis as PDF
  const downloadAnalysisAsPDF = () => {
    try {
      // Get clean text without HTML tags
      const cleanText = analysis.replace(/<[^>]*>/g, '');
      
      // Create a blob with the text content
      const element = document.createElement('a');
      const textBlob = new Blob([cleanText], {type: 'text/plain'});
      element.href = URL.createObjectURL(textBlob);
      
      // Create filename using the PDF name if available
      const fileName = file ? file.name.replace('.pdf', '') : 'document';
      element.download = `pdf-analysis-${fileName}-${Date.now()}.txt`;
      
      // Trigger download
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      toast.success('Analysis downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download analysis. Please try again.');
    }
  };

  return (
    <div className="rbt-dashboard-content">
      <div className="rbt-dashboard-title mb-4">
        <h4 className="title text-dark fw-bold">PDF Analysis</h4>
        <p className="description text-secondary">
          Our AI-powered PDF analysis tool extracts key insights from your documents.
          {uploadedFileName && <span className="ms-2 text-primary">PDF "{uploadedFileName}" is ready for analysis.</span>}
        </p>
      </div>
      
      <div className="rbt-dashboard-wrapper">
        <div 
          className={`upload-area shadow-sm ${isDragActive ? 'active' : ''}`} 
          {...getRootProps()}
          style={{
            background: isDragActive ? 'rgba(13, 110, 253, 0.1)' : '#f8f9fa',
            borderRadius: '12px',
            border: isDragActive ? '2px dashed #0d6efd' : '2px dashed #dee2e6',
            padding: '2rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          <input {...getInputProps()} />
          <div className="text-center">
            <div className="mb-3">
              <Upload size={48} className={isDragActive ? 'text-primary' : 'text-secondary'} />
            </div>
            {isDragActive ? (
              <p className="text-primary fw-medium mb-0">Drop your PDF file here...</p>
            ) : (
              <>
                <p className="text-dark fw-medium mb-2">Drag and drop your PDF file here, or click to select</p>
                <p className="text-secondary small mb-0">Maximum file size: 10MB</p>
              </>
            )}
          </div>
        </div>
        
      {file && (
        <div className="d-flex justify-content-between align-items-center p-3 mt-4 bg-light rounded-3 shadow-sm">
          <div className="d-flex align-items-center">
            <div className="p-2 bg-primary bg-opacity-10 rounded-circle me-3">
              <FileText size={24} className="text-primary" />
            </div>
            <div>
              <p className="mb-0 fw-medium text-dark">{file.name}</p>
              <p className="mb-0 small text-secondary">({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
            </div>
          </div>
          <button
            type="button" 
            className="btn"
            onClick={analyzePDF}
            disabled={loading}
            style={{
              borderRadius: '12px',
              padding: '10px 24px',
              background: loading ? '#a0a0a0' : 'linear-gradient(45deg, #3F51B5, #5677fd)',
              color: 'white',
              fontWeight: '500',
              border: 'none',
              boxShadow: loading ? 'none' : '0 4px 10px rgba(63, 81, 181, 0.2)',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                <span>Analyzing...</span>
              </>
            ) : (
              <span>Analyze PDF</span>
            )}
          </button>
        </div>
      )}

        {error && (
          <div className="alert alert-danger d-flex align-items-center mt-4 rounded-3 shadow-sm" role="alert">
            <AlertCircle size={20} className="me-2" />
            <div className="fw-medium">{error}</div>
          </div>
        )}

        {loading && (
          <div className="mt-4">
            <div className="progress mb-3">
              <div 
                className="progress-bar progress-bar-striped progress-bar-animated bg-primary" 
                role="progressbar" 
                style={{ 
                  width: `${progress}%`,
                  background: 'linear-gradient(45deg, #3F51B5, #5677fd)'
                }}
                aria-valuenow={progress} 
                aria-valuemin="0" 
                aria-valuemax="100"
              ></div>
            </div>
            <div className="text-center text-secondary">
              {progress < 30 ? (
                <p>Uploading and processing PDF...</p>
              ) : progress < 60 ? (
                <p>Extracting text content...</p>
              ) : progress < 85 ? (
                <p>Analyzing content structure...</p>
              ) : (
                <p>Generating comprehensive analysis...</p>
              )}
              <p className="small mt-2">Processing larger documents may take a moment. Please wait while we generate a detailed analysis of your PDF.</p>
            </div>
          </div>
        )}

        {analysis && (
          <div className="mt-4">
            <div className="analysis-content" ref={analysisContentRef}>
              <div 
                className="analysis-text p-4 bg-white rounded-3 shadow-sm" 
                style={{ 
                  maxHeight: '500px', 
                  overflowY: 'auto',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: '#000000'
                }}
                dangerouslySetInnerHTML={{ __html: analysis }}
              />
            </div>

            <div className="d-flex justify-content-end mt-3 gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  try {
                    // Get clean text without HTML tags
                    const cleanText = analysis.replace(/<[^>]*>/g, '');
                    navigator.clipboard.writeText(cleanText);
                    toast.info('Analysis copied to clipboard');
                  } catch (error) {
                    console.error('Copy error:', error);
                    toast.error('Failed to copy. Please try again.');
                  }
                }}
                title="Copy to clipboard"
              >
                <Copy size={16} className="me-2" />
                Copy Text
              </button>
              {!isIOS() && (
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={downloadAnalysisAsPDF}
                  title="Download as PDF"
                >
                  <Download size={16} className="me-2" />
                  Download
                </button>
              )}
            </div>
          </div>
        )}

        {!file && !loading && (
          <div className="alert alert-info rounded-3 mt-4 shadow-sm" role="alert">
            <div className="d-flex">
              <div className="me-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-info text-primary">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
              <div>
                <h6 className="alert-heading mb-1">Get Comprehensive PDF Analysis</h6>
                <p className="mb-0">
                  Our enhanced AI system now delivers more detailed analysis with:
                </p>
                <ul className="mt-2 mb-0 ps-3">
                  <li>Complete document structure breakdown</li>
                  <li>Key content extraction with main points highlighted</li>
                  <li>Identification of lists, bullet points, and important sections</li>
                  <li>Content summaries with proper formatting</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 