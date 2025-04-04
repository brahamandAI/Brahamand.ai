import React, { useState, useEffect } from 'react';
import { processPDFFile } from '../lib/homeHelpers';

/**
 * Component for handling PDF analysis and displaying results
 * @param {Object} props - Component props
 * @param {File} props.file - The PDF file to analyze
 * @param {Function} props.updateMessage - Function to update the message in the chat
 * @param {Function} props.onComplete - Callback when analysis is complete
 * @param {Function} props.onError - Callback when an error occurs
 */
const PDFAnalysisComponent = ({ file, updateMessage, onComplete, onError }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Start analysis when component mounts
    if (file) {
      analyzePDF();
    }
  }, [file]);
  
  const analyzePDF = async () => {
    if (!file || isAnalyzing) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Process the PDF and get analysis
      await processPDFFile(file, updateMessage);
      
      // Call onComplete callback if provided
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error('Error analyzing PDF:', err);
      setError(err.message || 'Failed to analyze PDF');
      
      // Update message with error - improved visibility
      updateMessage(`<div style="color: #ef4444; padding: 16px; border-left: 4px solid #ef4444; background-color: #fef2f2; border-radius: 0 6px 6px 0; margin: 16px 0;">
        <h4 style="margin-top: 0; margin-bottom: 8px; font-size: 18px; color: #b91c1c;">Error Processing PDF</h4>
        <p style="margin: 0; font-size: 16px; line-height: 1.5;">${err.message || 'An unexpected error occurred while analyzing the PDF. Please try again with a different file.'}</p>
      </div>`);
      
      // Call onError callback if provided
      if (onError) {
        onError(err);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // This component doesn't render anything visible
  // It's meant to be used for its side effects (processing the PDF)
  return null;
};

export default PDFAnalysisComponent; 