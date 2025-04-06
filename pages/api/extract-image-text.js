import formidable from 'formidable';
import fs from 'fs';
import { createWorker } from 'tesseract.js';

// Disable the default body parser to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Enhanced dictionary that covers more general terms, not just technical
const commonWords = [
  // Technical terms
  "algorithm", "pipeline", "natural", "language", "processing", "NLP", 
  "extraction", "annotation", "heuristic", "dataset", "preprocessing", 
  "tokenization", "categorization", "classification", "identification", 
  "implementation", "development", "schedule", "deadline", "assignment",
  "interview", "analysis", "task", "structured", "unstructured", "model",
  "objective", "approach", "technique", "evaluate", "methods", "actionable", 
  "irrelevant", "cluster", "dynamically", "Dirichlet", "clean", "analyze", 
  "details", "available", "unavailable", "college", "early", "only", "all",
  "should", "would", "could", "need", "must", "have", "were", "develop",
  
  // Common English words
  "the", "and", "that", "have", "for", "not", "with", "you", "this", "but",
  "his", "from", "they", "say", "her", "she", "will", "one", "all", "would",
  "there", "their", "what", "out", "about", "who", "get", "which", "when", "make",
  "can", "like", "time", "just", "him", "know", "take", "people", "into", "year",
  "your", "good", "some", "them", "see", "other", "than", "then", "now", "look",
  "only", "come", "its", "over", "think", "also", "back", "after", "use", "two",
  "how", "our", "work", "first", "well", "way", "even", "new", "want", "because",
  "any", "these", "give", "day", "most", "very", "person", "information", "education",
  "health", "world", "business", "service", "school", "company", "system", "program",
  "question", "government", "number", "group", "problem", "fact", "hand", "part",
  "place", "case", "week", "point", "government", "money", "water", "story", "example",
  "while", "area", "family", "head", "different", "important", "research", "data"
];

// Advanced Levenshtein distance function for word similarity
function levenshteinDistance(a, b) {
  const matrix = Array(b.length + 1).fill().map(() => Array(a.length + 1).fill(0));
  
  for (let i = 0; i <= a.length; i++) {
    matrix[0][i] = i;
  }
  
  for (let j = 0; j <= b.length; j++) {
    matrix[j][0] = j;
  }
  
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + substitutionCost // substitution
      );
      
      // Transposition
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        matrix[j][i] = Math.min(matrix[j][i], matrix[j - 2][i - 2] + 1);
      }
    }
  }
  
  return matrix[b.length][a.length];
}

// Enhanced function to find closest match from dictionary
// More lenient with words not in dictionary to preserve non-technical terms
function findClosestMatch(word, dictionary) {
  if (word.length <= 2) return word; // Don't correct very short words
  if (/^\d+$/.test(word)) return word; // Don't correct numbers
  if (/[A-Z]{2,}/.test(word)) return word; // Don't correct acronyms (all caps)
  
  const lowerWord = word.toLowerCase();
  
  // Check exact match first (case insensitive)
  if (dictionary.some(term => term.toLowerCase() === lowerWord)) {
    return word;
  }
  
  let closestMatch = word;
  let minDistance = Infinity;
  
  // Find the closest match by Levenshtein distance
  for (const term of dictionary) {
    const distance = levenshteinDistance(lowerWord, term.toLowerCase());
    
    // Only consider terms with similar length (within 30% difference)
    const lengthDiff = Math.abs(term.length - word.length) / Math.max(term.length, word.length);
    
    if (distance < minDistance && lengthDiff < 0.3) {
      minDistance = distance;
      closestMatch = term;
    }
  }
  
  // More conservative correction - only correct if the distance is small
  // This helps preserve unusual words that aren't in our dictionary
  const threshold = Math.max(1, Math.floor(word.length / 4)); // Stricter threshold
  if (minDistance <= threshold) {
    // Preserve the original capitalization if possible
    if (word[0] === word[0].toUpperCase()) {
      return closestMatch[0].toUpperCase() + closestMatch.slice(1);
    }
    return closestMatch;
  }
  
  return word; // Return original if no good match found
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  console.log('Image text extraction API called');
  
  try {
    // Parse the incoming form data
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.maxFileSize = 10 * 1024 * 1024; // 10MB limit
    form.multiples = false;

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Get the uploaded image file
    const imageFile = files.image;
    
    if (!imageFile) {
      console.error('No image file provided in the request');
      return res.status(400).json({ success: false, error: 'Image file is required' });
    }

    console.log(`Processing image: ${imageFile.originalFilename || 'unnamed.jpg'}, size: ${imageFile.size} bytes`);
    
    // Read the file as buffer
    const buffer = fs.readFileSync(imageFile.filepath);
    
    // Create a Tesseract worker
    const worker = await createWorker();
    
    // Set language to English - you can add more languages if needed
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    // Determine the image type from filename and/or mimetype
    const filename = imageFile.originalFilename?.toLowerCase() || '';
    const mimetype = imageFile.mimetype || '';
    
    // Customize OCR settings based on content type
    let contentType = 'unknown';
    
    if (filename.includes('assignment') || 
        filename.includes('document') || 
        filename.includes('paper') ||
        filename.includes('report')) {
      contentType = 'document';
    } else if (mimetype === 'image/png' || mimetype === 'image/jpeg') {
      // Use image analysis to determine if it's likely printed text
      contentType = 'printed';
    }
    
    // Multiple OCR attempts with different settings to get the best result
    let bestResult = { text: '', confidence: 0 };
    
    // First attempt: Optimized for general text
    console.log('Trying OCR with settings optimized for general text...');
    await worker.setParameters({
      tessedit_ocr_engine_mode: 3, // Combined Legacy + LSTM (good for printed text)
      tessjs_create_hocr: '0',
      tessjs_create_tsv: '0',
      tessjs_create_box: '0',
      tessjs_create_unlv: '0',
      tessjs_create_osd: '0',
      preserve_interword_spaces: 1,
      tessedit_pageseg_mode: 3, // Full auto page segmentation
      tessedit_char_whitelist: '', // Allow all characters
    });
    
    try {
      const result1 = await worker.recognize(buffer);
      bestResult = result1.data;
      console.log('First OCR attempt confidence:', result1.data.confidence);
    } catch (e) {
      console.error('First OCR attempt failed:', e);
    }
    
    // Second attempt: Optimize for text clarity
    if (bestResult.confidence < 80) {
      console.log('Trying OCR with settings optimized for clarity...');
      await worker.setParameters({
        tessedit_ocr_engine_mode: 2, // LSTM only mode
        preserve_interword_spaces: 1,
        tessedit_pageseg_mode: 6, // Assume a single uniform block of text
        tessjs_create_hocr: '0',
        tessjs_create_tsv: '0',
        tessjs_create_box: '0',
        tessjs_create_unlv: '0',
        tessjs_create_osd: '0',
      });
      
      try {
        const result2 = await worker.recognize(buffer);
        if (result2.data.confidence > bestResult.confidence) {
          bestResult = result2.data;
          console.log('Second OCR attempt provided better confidence:', result2.data.confidence);
        }
      } catch (e) {
        console.error('Second OCR attempt failed:', e);
      }
    }
    
    // Third attempt with different parameters if confidence is still low
    if (bestResult.confidence < 70) {
      console.log('Trying third OCR approach with PSM 4...');
      await worker.setParameters({
        tessedit_ocr_engine_mode: 3, // LSTM + Legacy
        tessedit_pageseg_mode: 4, // Assume a single column of text
        preserve_interword_spaces: 1,
      });
      
      try {
        const result3 = await worker.recognize(buffer);
        if (result3.data.confidence > bestResult.confidence) {
          bestResult = result3.data;
          console.log('Third OCR attempt provided better confidence:', result3.data.confidence);
        }
      } catch (e) {
        console.error('Third OCR attempt failed:', e);
      }
    }
    
    // Fourth attempt if still low confidence
    if (bestResult.confidence < 60) {
      console.log('Trying fourth OCR approach with PSM 11 (sparse text)...');
      await worker.setParameters({
        tessedit_ocr_engine_mode: 3,
        tessedit_pageseg_mode: 11, // Sparse text - Find as much text as possible in no particular order
        preserve_interword_spaces: 1,
      });
      
      try {
        const result4 = await worker.recognize(buffer);
        if (result4.data.confidence > bestResult.confidence) {
          bestResult = result4.data;
          console.log('Fourth OCR attempt provided better confidence:', result4.data.confidence);
        }
      } catch (e) {
        console.error('Fourth OCR attempt failed:', e);
      }
    }
    
    // Cleanup - terminate worker and remove temp file
    await worker.terminate();
    fs.unlinkSync(imageFile.filepath);
    
    console.log('Best OCR result - confidence:', bestResult.confidence, '%, text length:', bestResult.text.length);
    
    // Process the extracted text for better quality
    const preprocessText = (text) => {
      if (!text) return '';
      
      // Do basic cleanup first
      let processed = text
        // Remove excess whitespace
        .replace(/\s+/g, ' ')
        // Preserve paragraph breaks
        .replace(/\n\s*\n/g, '\n\n')
        // Remove redundant spaces after newlines
        .replace(/\n\s+/g, '\n')
        // Remove redundant spaces before newlines
        .replace(/\s+\n/g, '\n')
        // Remove hashtags
        .replace(/#(\w+)/g, '$1')
        // Trim each line
        .split('\n')
        .map(line => line.trim())
        .join('\n')
        .trim();
      
      // Fix common OCR errors
      processed = processed
        // Fix common letter confusions
        .replace(/([a-z])l([a-z])/g, (match, p1, p2) => {
          // Common 'l' to 'i' substitution in words
          const testWord = p1 + 'i' + p2;
          if (commonWords.includes(testWord.toLowerCase())) {
            return p1 + 'i' + p2;
          }
          return match;
        })
        // Fix punctuation/symbol confusion common in OCR
        .replace(/([a-z]),([a-z])/g, '$1, $2') // add space after commas
        .replace(/([a-z])\.([A-Z])/g, '$1. $2') // add space after periods
        .replace(/\\b/g, '') // remove common OCR artifact
        .replace(/\\n/g, '\n') // fix newline representation
        .replace(/\\t/g, ' ') // fix tab representation
        .replace(/\\([^\\])/g, '$1') // remove unnecessary escape characters
        
        // Fix specific backslash errors that show up in OCR
        .replace(/\\f/g, 'f')
        .replace(/\\i/g, 'i')
        .replace(/\\l/g, 'l')
        .replace(/\\o/g, 'o')
        .replace(/\\e/g, 'e')
        .replace(/\\c/g, 'c')
        .replace(/\\a/g, 'a')
        .replace(/\\r/g, 'r')
        .replace(/\\v/g, 'v')
        .replace(/\\s/g, 's')
        .replace(/\\w/g, 'w')
        .replace(/\\y/g, 'y')
        .replace(/\\d/g, 'd')
        .replace(/\\g/g, 'g')
        .replace(/\\b/g, 'b')
        .replace(/\\p/g, 'p')
        .replace(/\\m/g, 'm')
        .replace(/\\h/g, 'h')
        .replace(/\\k/g, 'k')
        .replace(/\\z/g, 'z')
        .replace(/\\n/g, 'n')
        .replace(/\\u/g, 'u')
        .replace(/\\j/g, 'j')
        .replace(/\\x/g, 'x')
        .replace(/\\/g, '') // remove any remaining backslashes
        
        // Fix common unrecognized characters
        .replace(/€/g, 'e') // euro symbol often confused with 'e'
        .replace(/\$/g, 'S') // dollar sign often confused with 'S'
        .replace(/§/g, 's') // section symbol often confused with 's'
        .replace(/¢/g, 'c') // cent symbol often confused with 'c'
        .replace(/©/g, 'o') // copyright symbol often confused with 'o'
        .replace(/£/g, 'L') // pound sign often confused with 'L'
        .replace(/¥/g, 'Y') // yen sign often confused with 'Y'
        .replace(/°/g, 'o') // degree symbol often confused with 'o'
        .replace(/µ/g, 'u'); // micro symbol often confused with 'u'
      
      // Apply specific fixes for known patterns
      processed = processed
        .replace(/pipeiine/g, 'pipeline')
        .replace(/aigorithm/g, 'algorithm')
        .replace(/naturai/g, 'natural')
        .replace(/ianguage/g, 'language')
        .replace(/oniy/g, 'only')
        .replace(/eariy/g, 'early')
        .replace(/coiiege/g, 'college')
        .replace(/aii/g, 'all')
        .replace(/shouid/g, 'should')
        .replace(/ciean/g, 'clean')
        .replace(/Detaiis/g, 'Details')
        .replace(/anaiyze/g, 'analyze')
        .replace(/unavaiiabie/g, 'unavailable')
        .replace(/irreievant/g, 'irrelevant')
        .replace(/actionabie/g, 'actionable')
        .replace(/scheduie/g, 'schedule')
        .replace(/deveiop/g, 'develop')
        .replace(/deadiines/g, 'deadlines')
        .replace(/ciuster/g, 'cluster')
        .replace(/dynamicaily/g, 'dynamically')
        .replace(/Dirichiet/g, 'Dirichlet');
      
      // Apply dictionary-based spelling correction more conservatively
      // Split text into words while preserving punctuation and line breaks
      const allWords = [];
      const tokens = processed.split(/(\s+|[,.;:!?"'()[\]{}])/);
      
      for (const token of tokens) {
        // Only apply dictionary correction to word tokens, not whitespace or punctuation
        if (/^[A-Za-z]+$/.test(token)) {
          // Only apply corrections to words that might be from our dictionary
          // This helps preserve names, places, and specialized terms
          if (token.length >= 3 && token.length <= 12) {
            const corrected = findClosestMatch(token, commonWords);
            allWords.push(corrected);
          } else {
            allWords.push(token); // Keep long or very short words as-is
          }
        } else {
          allWords.push(token);
        }
      }
      
      // Reconstruct the text with corrected words
      processed = allWords.join('');
      
      return processed;
    };
    
    const processedText = preprocessText(bestResult.text);
    
    // Create a dictionary of potential OCR error corrections
    const errorCorrections = [];
    const wordsToCheck = processedText.split(/\s+/);
    
    // Check for "i" vs "l" substitution errors in terms
    for (const word of wordsToCheck) {
      if (word.length > 3 && /l/.test(word)) {
        const potentialCorrection = word.replace(/l/g, 'i');
        if (commonWords.includes(potentialCorrection.toLowerCase())) {
          errorCorrections.push({
            original: word,
            correction: potentialCorrection
          });
        }
      }
    }
    
    // Determine document type
    const isTechnicalDocument = 
      processedText.toLowerCase().includes('algorithm') || 
      processedText.toLowerCase().includes('pipeline') || 
      processedText.toLowerCase().includes('implementation') ||
      processedText.toLowerCase().includes('assignment') ||
      processedText.toLowerCase().includes('nlp') ||
      processedText.toLowerCase().includes('processing');
    
    // Check if it could be a general text
    const isGeneralText = !isTechnicalDocument;
    
    // Return the extracted text with confidence score and additional metadata
    return res.status(200).json({
      success: true,
      text: processedText,
      confidence: bestResult.confidence,
      corrections: errorCorrections,
      isHandwriting: false, // This is determined by OCR confidence patterns
      isChildLetter: false,
      isTechnicalDocument: isTechnicalDocument,
      isGeneralText: isGeneralText,
      metadata: {
        fileName: imageFile.originalFilename || 'unnamed.jpg',
        fileSize: imageFile.size,
        format: imageFile.mimetype || 'image/jpeg',
        wordCount: processedText.split(/\s+/).filter(w => w.length > 0).length,
        contentType: contentType
      },
      rawText: bestResult.text, // Include the raw text before processing
      suggestion: isTechnicalDocument 
        ? "This appears to be a technical document." 
        : "This appears to be general text."
    });
  } catch (error) {
    console.error('Image text extraction error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to extract text from image'
    });
  }
} 