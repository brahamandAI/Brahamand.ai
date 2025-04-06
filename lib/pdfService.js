/**
 * PDF Service - Utility functions for PDF processing
 */

/**
 * Upload and analyze a PDF file
 * @param {File} file - The PDF file to analyze
 * @returns {Promise<Object>} - Analysis results
 */
export async function analyzePDF(file) {
  if (!file || file.type !== 'application/pdf') {
    throw new Error('Please provide a valid PDF file');
  }

  try {
    console.log('Uploading file:', file.name, 'Size:', file.size);
    
    // Try the main API endpoint first
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Log the form data to verify it's correct
      console.log('Sending file in FormData');
      
      const response = await fetch('/api/analyze-pdf', {
        method: 'POST',
        body: formData,
      });

      const contentType = response.headers.get("content-type");
      
      // First check if we received a valid JSON response
      if (!contentType || !contentType.includes("application/json")) {
        const errorText = await response.text();
        console.error('Non-JSON response from main API:', errorText);
        throw new Error('Invalid response format');
      }

      const data = await response.json();
      
      if (!response.ok) {
        console.error('API error response:', data);
        throw new Error(data.message || 'Error analyzing PDF');
      }
      
      if (!data.analysis) {
        throw new Error('Analysis data is missing from the response');
      }

      // Mark this as actual extracted data, not sample data
      data.analysis.isActualExtractedData = true;
      
      return data.analysis;
    } catch (mainApiError) {
      console.warn('Main API failed, trying in-browser analysis:', mainApiError);
      
      // Try to do browser-side analysis
      try {
        // Create a direct file URL that we can read client-side
        const fileUrl = URL.createObjectURL(file);
        console.log('Attempting browser-side analysis using URL:', fileUrl);
        
        // Basic metadata we can extract without additional packages
        const analysis = {
          filename: file.name,
          filesize: file.size,
          filetype: file.type,
          totalPages: 'Unknown (browser analysis)',
          totalWords: 'Unknown (browser analysis)',
          isActualExtractedData: true,
          summary: `This is a direct browser analysis of your ${file.name} file (${(file.size / 1024).toFixed(2)} KB). For full text extraction, the server-side process is required but encountered an issue.`,
          text: `# Browser Analysis of ${file.name}\n\n` +
                `## File Information\n\n` +
                `- Filename: ${file.name}\n` +
                `- File size: ${(file.size / 1024).toFixed(2)} KB\n` +
                `- File type: ${file.type}\n\n` +
                `## Limited Analysis\n\n` +
                `This is a direct browser-based analysis with limited capabilities.\n` +
                `The server-side PDF extraction encountered an issue, so we're showing this alternative view.\n\n` +
                `For better results, please try again or try a different PDF file.`,
        };
        
        return analysis;
      } catch (browserError) {
        console.error('Browser-side analysis failed:', browserError);
      }
      
      // If all else fails, fall back to the fallback API
      console.warn('Falling back to simple API endpoint');
      const fallbackResponse = await fetch('/api/analyze-pdf-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          filename: file.name,
          filesize: file.size,
          filetype: file.type
        }),
      });
      
      if (!fallbackResponse.ok) {
        throw new Error('All PDF analysis methods failed');
      }
      
      const fallbackData = await fallbackResponse.json();
      
      if (!fallbackData.analysis) {
        throw new Error('Analysis data is missing from the fallback response');
      }
      
      // Add a warning if this is sample data
      if (fallbackData.isSampleData) {
        const analysis = fallbackData.analysis;
        analysis.isSampleData = true;
        analysis.warning = "This is example data. Your actual PDF content could not be extracted.";
        return analysis;
      }
      
      return fallbackData.analysis;
    }
  } catch (error) {
    console.error('PDF analysis error:', error);
    throw error;
  }
}

/**
 * Format analysis results for display
 * @param {Object} analysis - The analysis results object
 * @returns {string} - Formatted HTML content
 */
export function formatAnalysisContent(analysis) {
  if (!analysis) return '';
  
  try {
    const { totalPages, totalWords, summary, text } = analysis;
    
    return `
      <h1 class="text-2xl font-bold mb-4 pb-2 border-b-2 border-primary-light">PDF Analysis Results</h1>
      <div class="bg-white rounded-lg shadow-lg p-5 mb-5">
        <h2 class="text-xl font-semibold mb-3 text-primary">Document Overview</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div class="bg-gray-50 p-4 rounded-lg shadow-sm">
            <p class="text-lg">
              <strong class="text-primary-dark">Pages:</strong> <span class="text-gray-800">${totalPages}</span>
            </p>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg shadow-sm">
            <p class="text-lg">
              <strong class="text-primary-dark">Words:</strong> <span class="text-gray-800">${totalWords}</span>
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-lg p-5 mb-5">
        <h2 class="text-xl font-semibold mb-3 text-primary">Content Summary</h2>
        <p class="text-gray-800 text-lg leading-relaxed mb-4">${summary || 'No summary available'}</p>
      </div>

      <div class="bg-white rounded-lg shadow-lg p-5">
        <h2 class="text-xl font-semibold mb-3 text-primary">Full Text Preview</h2>
        <div class="text-gray-800 text-lg leading-relaxed mb-4 max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg">${formatTextContent(text || '')}</div>
      </div>
    `;
  } catch (error) {
    console.error('Error formatting analysis content:', error);
    return `<div class="bg-red-50 p-5 rounded-lg text-red-700">
      <h2 class="text-xl font-semibold mb-3">Error Formatting Results</h2>
      <p>There was an error displaying the analysis results.</p>
    </div>`;
  }
}

/**
 * Format text content with proper HTML tags for headings, paragraphs, etc.
 * @param {string} text - Raw text content
 * @returns {string} - Formatted HTML content
 */
function formatTextContent(text) {
  if (!text) return 'No text content available';
  
  try {
    return text
      .split('\n')
      .map(line => {
        // Format headings
        if (line.startsWith('# ')) {
          return `<h1 class="text-2xl font-bold mb-4 pb-2 border-b-2 border-primary-light">${line.substring(2)}</h1>`;
        }
        if (line.startsWith('## ')) {
          return `<h2 class="text-xl font-semibold mb-3 text-primary">${line.substring(3)}</h2>`;
        }
        // Format bold text
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary-dark">$1</strong>');
        // Format paragraphs
        if (line.trim()) {
          return `<p class="text-gray-800 text-lg leading-relaxed mb-4">${line}</p>`;
        }
        return line;
      })
      .join('');
  } catch (error) {
    console.error('Error formatting text content:', error);
    return 'Error formatting text content';
  }
} 