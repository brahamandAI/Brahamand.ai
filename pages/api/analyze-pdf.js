import { formidable } from 'formidable';
import fs from 'fs';
import { PDFDocument } from 'pdf-lib';
import path from 'path';
import pdfParse from 'pdf-parse';
import { isOpenAIConfigured, generatePDFSummary } from '../../lib/openaiService';

// Disable the default body parser to handle form data with files
export const config = {
  api: {
    bodyParser: false,
  },
};

// Function to generate a basic summary from extracted text
function generateBasicSummary(text, totalPages, totalWords) {
  try {
    // Extract key elements from the text
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
    
    // Extract what looks like a title
    const possibleTitles = lines.filter(line => 
      line.length < 100 && 
      !line.includes(':') && 
      line === line.trim() &&
      line.match(/^[A-Z]/)
    ).slice(0, 2);
    
    // Get content paragraphs (not headers)
    const contentParagraphs = paragraphs
      .filter(p => !p.startsWith('#') && p.length > 100)
      .slice(0, 3);
    
    // Start building the summary
    let summary = '';
    
    // Add document title if found
    if (possibleTitles.length > 0) {
      summary += `## ${possibleTitles[0]}\n\n`;
    } else {
      summary += '## Document Summary\n\n';
    }
    
    // Add document statistics
    summary += `This document contains ${totalPages} page${totalPages !== 1 ? 's' : ''} with approximately ${totalWords} words.\n\n`;
    
    // Add document summary section
    summary += '### Key Content:\n\n';
    
    // Add content snippets
    if (contentParagraphs.length > 0) {
      contentParagraphs.forEach(para => {
        // Trim paragraph to a reasonable length if too long
        const trimmedPara = para.length > 300 
          ? para.substring(0, 300) + '...' 
          : para;
        summary += `${trimmedPara}\n\n`;
      });
    } else {
      // If no good paragraphs found, extract sentences
      const sentences = text
        .replace(/\n/g, ' ')
        .split(/\.|\?|\!/)
        .filter(s => s.trim().length > 30)
        .slice(0, 5)
        .map(s => s.trim() + '.');
      
      if (sentences.length > 0) {
        summary += sentences.join('\n\n');
      } else {
        summary += 'The document content could not be properly extracted for summarization.';
      }
    }
    
    // Add note about basic extraction
    summary += '\n\n_Note: This is a basic extraction of the document content. For a more detailed analysis, please try a different PDF file or format._';
    
    return summary;
  } catch (error) {
    console.error('Error generating basic summary:', error);
    return `Unable to generate summary. Document contains ${totalPages} pages with approximately ${totalWords} words.`;
  }
}

export default async function handler(req, res) {
  console.log('PDF analysis API called', {
    method: req.method,
    contentType: req.headers['content-type'],
    contentLength: req.headers['content-length']
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Create form parser with options for formidable v2
    const form = new formidable.IncomingForm({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      multiples: false,
    });

    // Use promise-based approach for formidable v2
    const formParsePromise = () => {
      return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) return reject(err);
          resolve({ fields, files });
        });
      });
    };

    // Parse the form with formidable v2
    const { fields, files } = await formParsePromise();
    
    // Log files for debugging
    console.log('Files received:', files ? Object.keys(files) : 'none');
    
    // Get the PDF file - in v2 files are direct objects, not arrays
    const file = files.file || files[Object.keys(files)[0]];
    
    if (!file) {
      console.log('No file found in the request');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Log file info for debugging
    console.log('File info:', {
      name: file.originalFilename || file.name,
      size: file.size,
      path: file.filepath || file.path, // Handle both v2 and v3 property names
      type: file.mimetype || file.type
    });

    // Get file path (formidable v2 uses 'path', v3 uses 'filepath')
    const filePath = file.filepath || file.path;
    
    if (!filePath) {
      return res.status(400).json({ message: 'Invalid file upload: No filepath' });
    }

    // Check that the file is a PDF
    const filename = file.originalFilename || file.name || 'unknown.pdf';
    if (!filename.toLowerCase().endsWith('.pdf') && 
        (file.mimetype || file.type) !== 'application/pdf') {
      return res.status(400).json({ message: 'Uploaded file is not a PDF' });
    }

    // Extract all text from the PDF
    const extractedText = await extractTextFromPDF(filePath);

    // Check if we have valid extracted text
    if (!extractedText || extractedText.trim().length < 100) {
      console.log('PDF text extraction resulted in limited content');
    } else {
      console.log('PDF text extraction successful, extracted length:', extractedText.length);
    }

    // Analyze the PDF content
    const analysis = analyzePDF(extractedText);

    // Use OpenAI to generate a better summary if configured
    if (isOpenAIConfigured()) {
      try {
        console.log('Using AI to generate summary');
        
        // Extract options from query parameters
        const options = {
          model: req.query.model || 'default',
          concise: req.query.concise === 'true' ? true : req.query.concise === 'false' ? false : undefined,
          maxLength: req.query.maxLength ? parseInt(req.query.maxLength) : undefined,
          depth: req.query.depth || 'standard',
          includeMetadata: req.query.includeMetadata === 'true' ? true : req.query.includeMetadata === 'false' ? false : undefined,
          formatOutput: req.query.formatOutput === 'true' ? true : req.query.formatOutput === 'false' ? false : undefined,
          enhancedSummary: req.query.enhancedSummary === 'true' ? true : undefined
        };
        
        console.log('Generating PDF summary with options:', options);
        
        const enhancedSummary = await generatePDFSummary(extractedText, {
          totalPages: analysis.totalPages,
          totalWords: analysis.totalWords,
          title: analysis.title
        }, options);
        
        // Add the AI-generated summary to the analysis
        analysis.aiGeneratedSummary = enhancedSummary;
        analysis.usedAI = true;
        analysis.summary = enhancedSummary; // Also set as main summary for backward compatibility
      } catch (error) {
        console.error('Error generating AI summary:', error);
        // Generate a basic summary as fallback
        const basicSummary = generateBasicSummary(
          extractedText, 
          analysis.totalPages, 
          analysis.totalWords
        );
        analysis.aiGeneratedSummary = basicSummary;
        analysis.summary = basicSummary; // Also set as main summary
        analysis.usedAI = false;
        analysis.usesFallbackSummary = true;
      }
    } else {
      console.log('AI API key not configured, using basic summary');
      const basicSummary = generateBasicSummary(
        extractedText, 
        analysis.totalPages, 
        analysis.totalWords
      );
      analysis.aiGeneratedSummary = basicSummary;
      analysis.summary = basicSummary; // Also set as main summary
      analysis.usedAI = false;
      analysis.usesFallbackSummary = true;
    }

    // Indicate that this is actual extracted data
    analysis.isActualExtractedData = true;
    
    // Send the analysis as JSON response
    return res.status(200).json(analysis);
  } catch (error) {
    console.error('Error processing PDF:', error);
    return res.status(500).json({ 
      message: 'Error processing PDF', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

async function extractTextFromPDF(filePath) {
  try {
    // Read the PDF file
    const pdfBuffer = fs.readFileSync(filePath);
    
    try {
      // Get basic info with pdf-lib
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pageCount = pdfDoc.getPageCount();
      const fileName = path.basename(filePath);
      const fileInfo = fs.statSync(filePath);
      
      console.log('Extracting text from PDF with pdf-parse');
      
      // Use pdf-parse for actual text extraction
      const pdfData = await pdfParse(pdfBuffer);
      
      console.log('PDF text extraction successful, content length:', pdfData.text.length);
      
      // Clean up the extracted text - remove non-printable characters and fix spacing
      const cleanText = pdfData.text
        .replace(/[^\x20-\x7E\n\r\t]/g, '') // Remove non-printable ASCII characters
        .replace(/(\r\n|\r|\n){2,}/g, '\n\n') // Normalize line breaks
        .replace(/\s{2,}/g, ' ') // Remove extra spaces
        .trim();
      
      // Structure the content
      let extractedText = `# ${fileName.replace('.pdf', '')}\n\n`;
      
      // Add document information
      extractedText += `## Document Information\n\n`;
      extractedText += `This PDF document contains ${pageCount} pages.\n\n`;
      
      // Add metadata
      extractedText += `## Document Statistics\n\n`;
      extractedText += `- Filename: ${fileName}\n`;
      extractedText += `- File size: ${(fileInfo.size / 1024).toFixed(2)} KB\n`;
      extractedText += `- Word count: ${countWords(cleanText)}\n\n`;
      
      // Add the actual content
      extractedText += `## Document Content\n\n`;
      
      // Format the content - split by double line breaks to identify paragraphs
      const paragraphs = cleanText
        .split(/\n\s*\n/)
        .filter(para => para.trim().length > 0)
        .map(para => para.trim());  // Ensure each paragraph is trimmed
      
      if (paragraphs.length > 0) {
        // Group similar paragraphs and remove duplicates
        const uniqueParagraphs = paragraphs.reduce((acc, para) => {
          // Skip if very similar to a previous paragraph (avoid duplicates)
          const isDuplicate = acc.some(p => 
            p.length > 20 && para.length > 20 && 
            (p.includes(para) || para.includes(p))
          );
          
          if (!isDuplicate) {
            acc.push(para);
          }
          return acc;
        }, []);
        
        uniqueParagraphs.forEach(para => {
          // Skip likely garbage text (random characters, very long without spaces)
          if (para.length > 20 && !/\s/.test(para) || /^[A-Z0-9+\/=]{20,}$/.test(para)) {
            return;
          }
          
          // Detect if the paragraph is a title or section header
          if (para.length < 100 && 
              para.trim().toUpperCase() === para.trim() && 
              !/[^\w\s\-:]/.test(para)) {
            extractedText += `### ${para.trim()}\n\n`;
          } 
          // Detect if it's a list item
          else if (para.trim().match(/^[•\-*]\s/) || para.trim().match(/^\d+\.\s/)) {
            extractedText += `${para.trim()}\n`;
          } 
          // Otherwise, treat as a regular paragraph
          else {
            extractedText += `${para.trim()}\n\n`;
          }
        });
      } else {
        // If no paragraphs were identified, try line-by-line approach
        const lines = cleanText.split('\n')
          .filter(line => line.trim().length > 0)
          .filter(line => {
            // Filter out likely machine data or binary content
            return !/^[A-Z0-9+\/=]{20,}$/.test(line) && 
                  !/^[\x00-\xFF]{20,}$/.test(line) &&
                  !/^[0-9a-f]{10,}$/i.test(line);
          });
        
        if (lines.length > 0) {
          lines.forEach(line => {
            if (line.trim().length > 0) {
              extractedText += `${line.trim()}\n\n`;
            }
          });
        } else {
          extractedText += `No readable text content could be extracted from this PDF.\n\n`;
        }
      }
      
      return extractedText;
    } catch (error) {
      console.error('PDF extraction error:', error);
      
      // Still try to get basic info even if text extraction fails
      const fileInfo = fs.statSync(filePath);
      const fileName = path.basename(filePath);
      
      let basicInfo = `# PDF Document Analysis\n\n`;
      basicInfo += `## Document Information\n\n`;
      basicInfo += `Unable to extract readable text content from this PDF.\n\n`;
      basicInfo += `Filename: ${fileName}\n`;
      basicInfo += `File size: ${(fileInfo.size / 1024).toFixed(2)} KB\n\n`;
      basicInfo += `The file appears to be a valid PDF, but the text extraction process encountered an issue: ${error.message}\n\n`;
      
      basicInfo += `## Common PDF Extraction Issues\n\n`;
      basicInfo += `- PDF contains scanned images instead of text\n`;
      basicInfo += `- PDF is protected or encrypted\n`;
      basicInfo += `- PDF uses custom fonts or encoding\n`;
      basicInfo += `- PDF contains complex layouts that are difficult to parse\n`;
      
      return basicInfo;
    }
  } catch (error) {
    console.error('Error accessing PDF file:', error);
    return `# PDF Analysis Error\n\nUnable to read the PDF file: ${error.message}`;
  }
}

function analyzePDF(text) {
  // Count words
  const words = countWords(text);
  
  // Extract the first few paragraphs for the summary (simplified)
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
  
  // Skip the header sections and file metadata in the summary
  const skipHeaders = ['# ', '## ', 'Filename:', 'File size:', 'Word count:'];
  
  // Get content paragraphs (skip headers and short paragraphs)
  const contentParagraphs = paragraphs
    .filter(p => {
      // Skip headers and metadata lines
      const shouldSkip = skipHeaders.some(header => p.trim().startsWith(header));
      return !shouldSkip && p.length > 30;
    })
    .slice(0, 5);  // Take up to 5 paragraphs to find good content
  
  // If we don't have enough content paragraphs, include shorter ones too
  const summaryParagraphs = contentParagraphs.length > 0 
    ? contentParagraphs.slice(0, 3)  // Take max 3 for the summary 
    : paragraphs.filter(p => !skipHeaders.some(header => p.trim().startsWith(header)))
               .slice(0, 3);
  
  // Join paragraphs with proper spacing
  const joinedSummary = summaryParagraphs.join('\n\n');
  
  // Clean up the summary - remove any remaining non-text content
  const cleanSummary = joinedSummary
    .replace(/[^\x20-\x7E\n\r\t]/g, '') // Remove non-printable characters
    .replace(/\s{2,}/g, ' '); // Remove extra spaces
  
  // Create a summary (truncate if too long)
  const summary = cleanSummary.length > 0 
    ? (cleanSummary.length > 500 ? cleanSummary.substring(0, 500) + '...' : cleanSummary)
    : 'Could not generate a meaningful summary from this document.';
  
  // Find document title (first h1)
  const titleMatch = text.match(/^# (.+)$/m);
  const title = titleMatch ? titleMatch[1] : 'PDF Document';
  
  // Return structured analysis
  return {
    title,
    totalPages: countPages(text),
    totalWords: words,
    summary: summary || 'No summary available',
    text: text, // Include full text
  };
}

function countWords(text) {
  return text.trim().split(/\s+/).length;
}

function countPages(text) {
  // First try to find an explicit page count
  const pageCountMatch = text.match(/contains (\d+) pages/);
  if (pageCountMatch) return parseInt(pageCountMatch[1]);
  
  // Count the number of "## Page" headers to determine page count
  const pageHeaders = text.match(/## Page \d+/g);
  if (pageHeaders) return pageHeaders.length;
  
  // Estimate based on text length
  return Math.max(1, Math.ceil(text.length / 3000));
}

function mockExtractText(pageCount = 5) {
  return `
# Sample Document Title

## Introduction

This is an example of extracted text from a PDF document. In a production environment, this would be the actual content extracted from your uploaded PDF file. The current implementation provides this sample text for demonstration purposes.

## Document Analysis

The PDF analysis tool examines your document and extracts key information including:

- Total page count
- Word count
- Content summary
- Full text preview

## Benefits of PDF Analysis

PDF analysis can help you quickly understand the content of large documents, extract key information, and make documents more accessible. This can be particularly useful for:

- Research papers
- Legal documents
- Financial reports
- Technical documentation

## Next Steps

After analyzing your PDF, you can download the analysis results or copy them to your clipboard. You can then use this information for further processing, summarization, or integration with other tools.

## Technical Details

Document processing uses state-of-the-art natural language processing techniques to extract meaningful information from your PDFs.

${Array(pageCount || 5).fill(0).map((_, i) => `
## Page ${i + 1}

This is example content for page ${i + 1}. In a real PDF analysis, this would contain the actual text from page ${i + 1} of your document. The content would be extracted and processed to provide you with insights about the document structure and content.

Some additional placeholder text to demonstrate how the content would flow in a real document. This helps simulate the appearance and formatting of actual document content that would be extracted from your PDF files.
`).join('\n')}
`;
} 