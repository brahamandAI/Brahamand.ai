import formidable from 'formidable';
import pdfParse from 'pdf-parse';
import fs from 'fs';

// Disable the default body parser to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  console.log('PDF text extraction API called');
  
  try {
    // Parse the incoming form data with higher limits for larger PDFs
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.maxFileSize = 30 * 1024 * 1024; // 30MB limit
    form.multiples = false;

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Get the uploaded PDF file
    const pdfFile = files.pdf;
    
    if (!pdfFile) {
      console.error('No PDF file provided in the request');
      return res.status(400).json({ success: false, error: 'PDF file is required' });
    }

    console.log(`Processing PDF: ${pdfFile.originalFilename || 'unnamed.pdf'}, size: ${pdfFile.size} bytes`);
    
    // Read the file
    const buffer = fs.readFileSync(pdfFile.filepath);
    
    // Enhanced PDF parsing options
    const options = {
      // Customize the page rendering to preserve more formatting
      pagerender: function(pageData) {
        if (pageData.getTextContent) {
          return pageData.getTextContent({
            // Include additional properties for better text extraction
            normalizeWhitespace: false,
            disableCombineTextItems: false
          }).then(function(textContent) {
            let lastY, lastX, text = '';
            let currentLine = '';
            
            // Process each text item preserving layout and structure
            for (let i = 0; i < textContent.items.length; i++) {
              const item = textContent.items[i];
              
              // Handle new lines based on position changes
              if (lastY && Math.abs(lastY - item.transform[5]) > 5) {
                text += currentLine.trim() + '\n';
                currentLine = '';
              } else if (lastX && item.transform[4] < lastX) {
                // Handle possible word wrapping
                currentLine += ' ';
              }
              
              // Add the current text item
              currentLine += item.str;
              
              lastY = item.transform[5];
              lastX = item.transform[4] + (item.width || 0);
            }
            
            // Add the last line
            if (currentLine.trim().length > 0) {
              text += currentLine.trim();
            }
            
            return text;
          });
        }
        return null;
      }
    };
    
    // Parse the PDF with enhanced options and timeout handling
    const parseWithTimeout = async (buffer, options, timeoutMs = 30000) => {
      return new Promise(async (resolve, reject) => {
        // Set a timeout to prevent hanging on large or complex PDFs
        const timeoutId = setTimeout(() => {
          reject(new Error('PDF parsing timed out. The file may be too large or complex.'));
        }, timeoutMs);
        
        try {
          const result = await pdfParse(buffer, options);
          clearTimeout(timeoutId);
          resolve(result);
        } catch (error) {
          clearTimeout(timeoutId);
          reject(error);
        }
      });
    };
    
    // Parse with timeout
    const data = await parseWithTimeout(buffer, options);
    
    // Clean up - remove the temporary file
    fs.unlinkSync(pdfFile.filepath);
    
    // Process the text to improve quality
    const preprocessText = (text) => {
      if (!text) return '';
      
      return text
        // Fix common PDF extraction issues with hyphens
        .replace(/(\w)-\s*\n(\w)/g, '$1$2')
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        // Preserve paragraph breaks
        .replace(/\n\s*\n/g, '\n\n')
        // Remove redundant spaces after newlines
        .replace(/\n\s+/g, '\n')
        // Remove redundant spaces before newlines
        .replace(/\s+\n/g, '\n')
        // Ensure proper spacing after punctuation
        .replace(/([.!?:;])\s*(\w)/g, '$1 $2')
        // Trim each line
        .split('\n')
        .map(line => line.trim())
        .join('\n')
        .trim();
    };
    
    const processedText = preprocessText(data.text);
    const wordCount = processedText.split(/\s+/).filter(w => w.length > 0).length;
    
    console.log(`PDF processed successfully: ${data.numpages} pages, ${wordCount} words`);
    
    // Return the extracted text and metadata
    return res.status(200).json({
      success: true,
      text: processedText,
      numpages: data.numpages,
      wordCount: wordCount,
      info: data.info,
      metadata: {
        title: data.info?.Title || '',
        author: data.info?.Author || '',
        creationDate: data.info?.CreationDate || '',
        pageCount: data.numpages,
        wordCount: wordCount,
        version: data.info?.PDFFormatVersion || ''
      }
    });
  } catch (error) {
    console.error('PDF extraction error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to extract text from PDF'
    });
  }
} 