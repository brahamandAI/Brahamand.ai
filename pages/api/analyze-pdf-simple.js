import { generatePDFSummary } from '../../lib/openaiService';
import pdfParse from 'pdf-parse';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    console.log('PDF analysis API called');
    
    // Extract information from request
    const { fileData, fileName, options } = req.body || {};
    
    if (!fileData) {
      return res.status(400).json({ error: 'No file data provided' });
    }
    
    try {
      // Convert base64 to buffer for PDF parsing
      const pdfBuffer = Buffer.from(fileData, 'base64');
      
      // Parse PDF to extract text using pdf-parse
      const pdfData = await pdfParse(pdfBuffer);
      
      // Extract text from the PDF
      const extractedText = pdfData.text;
      
      if (!extractedText || extractedText.length < 100) {
        return res.status(400).json({ error: 'Could not extract sufficient text from the PDF' });
      }
      
      // Calculate metadata
      const totalWords = extractedText.split(/\s+/).length;
      const metadata = {
        totalPages: pdfData.numpages || 1,
        totalWords: totalWords,
        title: fileName || 'Document Analysis'
      };

      // Use the options from the request or set defaults
      const analysisOptions = options || {
        depth: 'comprehensive',
        concise: false,
        maxLength: 5000,
        includeMetadata: true,
        formatOutput: true
      };

      // Generate a proper summary using our existing function
      const summary = await generatePDFSummary(extractedText, metadata, analysisOptions);
      
      return res.status(200).json({ 
        message: 'PDF analysis completed successfully',
        summary: summary,
        analysis: {
          totalPages: metadata.totalPages,
          totalWords: metadata.totalWords,
          text: extractedText
        }
      });
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError);
      return res.status(400).json({
        error: 'Error parsing PDF: ' + pdfError.message
      });
    }
  } catch (error) {
    console.error('PDF analysis error:', error);
    return res.status(500).json({ 
      error: 'Error analyzing PDF: ' + error.message
    });
  }
} 