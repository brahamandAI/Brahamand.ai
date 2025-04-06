/**
 * PDF.js Worker Loader
 * This script loads the PDF.js worker script needed for PDF parsing.
 */

// This will be executed in the browser
if (typeof window !== 'undefined') {
  // Load the PDF.js worker from CDN
  window.pdfjsWorkerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
} 