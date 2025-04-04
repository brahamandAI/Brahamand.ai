/**
 * Helper functions for the HomePage component
 */

/**
 * Formats a text response for display in the chat
 * @param {string} text - The text to format
 * @returns {string} - HTML formatted text
 */
export const formatResponse = (text) => {
  if (!text) return "";
  
  // Wrap the entire content in a div with styling for visibility
  let formattedText = `<div style="color: #111827; font-size: 16px; line-height: 1.5; max-width: 100%;">
  ${text}</div>`;
  
  // Convert line breaks to HTML breaks
  formattedText = formattedText.replace(/\n/g, "<br>");
  
  // Format code blocks with better visibility and overflow handling
  formattedText = formattedText.replace(
    /```([\s\S]*?)```/g,
    '<pre style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; margin: 10px 0; overflow-x: auto; white-space: pre-wrap; word-break: break-word; color: #374151; font-size: 14px; max-width: 100%;"><code>$1</code></pre>'
  );
  
  // Format inline code with better visibility
  formattedText = formattedText.replace(
    /`([^`]+)`/g,
    '<code style="background-color: #f3f4f6; padding: 2px 6px; border-radius: 4px; color: #374151; font-family: monospace; font-size: 15px; word-break: break-all;">$1</code>'
  );
  
  // Format bold text
  formattedText = formattedText.replace(
    /\*\*([^*]+)\*\*/g,
    '<strong style="font-weight: 600; color: #111827;">$1</strong>'
  );
  
  // Format italic text
  formattedText = formattedText.replace(
    /\*([^*]+)\*/g,
    '<em style="color: #374151;">$1</em>'
  );
  
  return formattedText;
};

/**
 * Simulates typing animation for responses with improved scrolling
 * @param {string} content - The content to type
 * @param {Function} setMessages - State setter for messages
 * @param {Function} setIsTyping - State setter for typing status
 * @param {boolean} shouldStop - Flag indicating if generation should stop
 * @param {Function} setShouldStop - Function to reset stop flag
 */
export const typeResponse = (content, setMessages, setIsTyping, shouldStop, setShouldStop) => {
  setIsTyping(true);
  
  // Create a typing simulation with varying speeds
  const characters = content.split('');
  let currentText = '';
  let index = 0;
  
  // Create a mutable ref to check for stop signal
  const stopSignal = { current: shouldStop };
  
  // Track if user is manually scrolling
  const userScrolling = { current: false };
  let lastScrollTop = 0;
  
  // Function to check if user is manually scrolling
  const checkUserScrolling = () => {
    const dynamicContent = document.querySelector(".rbt-daynamic-page-content");
    if (!dynamicContent) return;
    
    // If user has scrolled up from bottom, they're manually scrolling
    const isAtBottom = dynamicContent.scrollHeight - dynamicContent.scrollTop <= dynamicContent.clientHeight + 150;
    if (!isAtBottom) {
      userScrolling.current = true;
    }
    
    // If user scrolls down to bottom again, resume auto-scrolling
    if (dynamicContent.scrollTop > lastScrollTop && isAtBottom) {
      userScrolling.current = false;
    }
    
    lastScrollTop = dynamicContent.scrollTop;
  };
  
  // Add event listener for scroll
  const dynamicContent = document.querySelector(".rbt-daynamic-page-content");
  if (dynamicContent) {
    dynamicContent.addEventListener('scroll', checkUserScrolling);
  }
  
  // Function to ensure proper scrolling, but only if user isn't manually scrolling
  const ensureScrollVisible = () => {
    const dynamicContent = document.querySelector(".rbt-daynamic-page-content");
    if (dynamicContent && !userScrolling.current) {
      dynamicContent.scrollTo({
        top: dynamicContent.scrollHeight,
        behavior: 'auto' // Use auto instead of smooth to prevent jumps
      });
    }
  };
  
  // Set up a continuous scroll interval during typing - much less frequent to reduce jumps
  const scrollInterval = setInterval(ensureScrollVisible, 3000);

  // Update the stopSignal if the shouldStop prop changes - check very frequently
  const checkStopInterval = setInterval(() => {
    stopSignal.current = shouldStop;
    
    // Handle stop request immediately when detected
    if (stopSignal.current) {
      handleStopGeneration();
    }
  }, 50); // Check more frequently (50ms)
  
  // Function to handle stopping generation
  const handleStopGeneration = () => {
    // Clean up event listener
    if (dynamicContent) {
      dynamicContent.removeEventListener('scroll', checkUserScrolling);
    }
    
    // Also clean up the custom event listener
    document.removeEventListener('stopGeneration', handleCustomStop);
    
    // Clear all intervals
    clearInterval(typeInterval);
    clearInterval(scrollInterval);
    clearInterval(checkStopInterval);
    
    // Update typing state
    setIsTyping(false);
    setShouldStop(false); // Reset the stop flag
    
    // Add a note that generation was stopped
    setMessages((prevMessages) => {
      const newMessages = [...prevMessages];
      const lastMessage = { ...newMessages[newMessages.length - 1] };
      
      // Append a note about stopping if there's existing content
      if (currentText.length > 0) {
        lastMessage.response.content = currentText + 
          '<div style="margin-top: 10px; padding: 8px; background-color: #f9fafb; border-radius: 6px; border-left: 3px solid #3b82f6;">' + 
          '<span style="color: #4b5563; font-style: italic;">Generation stopped by user.</span></div>';
      } else {
        lastMessage.response.content = '<span style="color: #4b5563; font-style: italic;">Generation stopped by user.</span>';
      }
      
      newMessages[newMessages.length - 1] = lastMessage;
      return newMessages;
    });
  };
  
  // Listen for custom stop event (direct and immediate)
  const handleCustomStop = () => {
    stopSignal.current = true;
    handleStopGeneration();
  };
  
  // Add event listener for custom stop event
  document.addEventListener('stopGeneration', handleCustomStop);
  
  const typeInterval = setInterval(() => {
    // Check for stop signal directly every time (not waiting for interval)
    if (stopSignal.current) {
      handleStopGeneration();
      return;
    }
    
    if (index < characters.length) {
      currentText += characters[index];
      
      // Update message with current text
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        const lastMessage = { ...newMessages[newMessages.length - 1] };
        lastMessage.response.content = currentText;
        newMessages[newMessages.length - 1] = lastMessage;
        return newMessages;
      });
      
      // Progress to next character
      index++;
      
      // Only auto-scroll if user isn't manually scrolling up
      if (index % 200 === 0 && !userScrolling.current) {
        ensureScrollVisible();
      }
    } else {
      // End typing animation
      clearInterval(typeInterval);
      clearInterval(scrollInterval);
      clearInterval(checkStopInterval);
      
      // Clean up event listener
      if (dynamicContent) {
        dynamicContent.removeEventListener('scroll', checkUserScrolling);
      }
      
      // Clean up the custom event listener
      document.removeEventListener('stopGeneration', handleCustomStop);
      
      setIsTyping(false);
      setShouldStop(false); // Reset stop flag even if we finish normally
      
      // Final scroll to ensure everything is visible, but respect user scrolling
      if (!userScrolling.current) {
        setTimeout(ensureScrollVisible, 100);
      }
    }
  }, 15); // Slightly faster typing for better responsiveness
};

/**
 * Processes a PDF file for analysis
 * @param {File} file - The PDF file to process
 * @param {Function} updateMessage - Function to update the message
 * @returns {Promise<void>}
 */
export const processPDFFile = async (file, updateMessage) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = async function(event) {
        const pdfData = event.target.result;
        
        // Show extraction progress with improved colors
        updateMessage(`<span style='color: #3b82f6; font-weight: 500; font-size: 16px;'>Extracting PDF content...</span>`);
        
        try {
          // Extract text from PDF - use PDF.js library
          const pdfjsLib = window.pdfjsLib;
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
          
          // Load the PDF document
          const loadingTask = pdfjsLib.getDocument(pdfData);
          const pdf = await loadingTask.promise;
          
          // Show file info with improved styling
          const fileSize = Math.round(file.size / 1024);
          updateMessage(`<div style="font-family: system-ui, -apple-system, sans-serif; color: #111827; font-size: 16px; line-height: 1.5;">
            <div style="padding: 10px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 15px; display: flex; align-items: center; gap: 12px;">
              <div style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background-color: #3b82f6; border-radius: 50%;">
                <span style="color: white;">📄</span>
              </div>
              <div>
                <span style="font-weight: 600; color: #111827;">${file.name}</span>
                <span style="color: #6b7280; font-size: 14px; margin-left: 8px;">${fileSize} KB • ${pdf.numPages} pages</span>
              </div>
            </div>
            <p style="color: #3b82f6; font-weight: 500; margin-bottom: 5px;">Extracting text from ${pdf.numPages} pages...</p>
          </div>`);
          
          // Extract text from all pages
          let fullText = "";
          const totalPages = pdf.numPages;
          
          for (let i = 1; i <= totalPages; i++) {
            try {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map(item => item.str).join(' ');
              fullText += pageText + "\n\n";
              
              // Update progress periodically
              if (i % 5 === 0 || i === totalPages) {
                const progressPercent = Math.round((i / totalPages) * 100);
                updateMessage(`<div style="font-family: system-ui, -apple-system, sans-serif; color: #111827; font-size: 16px; line-height: 1.5;">
                  <div style="padding: 10px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 15px; display: flex; align-items: center; gap: 12px;">
                    <div style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background-color: #3b82f6; border-radius: 50%;">
                      <span style="color: white;">📄</span>
                    </div>
                    <div>
                      <span style="font-weight: 600; color: #111827;">${file.name}</span>
                      <span style="color: #6b7280; font-size: 14px; margin-left: 8px;">${fileSize} KB • ${pdf.numPages} pages</span>
                    </div>
                  </div>
                  <p style="color: #3b82f6; font-weight: 500; margin-bottom: 5px;">Processing pages: ${i}/${totalPages} (${progressPercent}%)</p>
                  <div style="width: 100%; height: 6px; background-color: #e5e7eb; border-radius: 3px; overflow: hidden; margin-bottom: 15px;">
                    <div style="height: 100%; width: ${progressPercent}%; background-color: #3b82f6; border-radius: 3px;"></div>
                  </div>
                </div>`);
              }
            } catch (pageError) {
              console.error(`Error extracting content from page ${i}:`, pageError);
              fullText += `[Error extracting page ${i}]\n\n`;
            }
          }
          
          updateMessage(`<div style="font-family: system-ui, -apple-system, sans-serif; color: #111827; font-size: 16px; line-height: 1.5;">
            <div style="padding: 10px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 15px; display: flex; align-items: center; gap: 12px;">
              <div style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background-color: #3b82f6; border-radius: 50%;">
                <span style="color: white;">📄</span>
              </div>
              <div>
                <span style="font-weight: 600; color: #111827;">${file.name}</span>
                <span style="color: #6b7280; font-size: 14px; margin-left: 8px;">${fileSize} KB • ${pdf.numPages} pages</span>
              </div>
            </div>
            <p style="color: #3b82f6; font-weight: 500; margin-bottom: 15px;">Analyzing document content...</p>
          </div>`);
          
          // Send the text to the OpenAI API for analysis
          try {
            const response = await fetch('/api/chat', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message: `Analyze this PDF content and provide a detailed summary with main points and key findings: ${fullText.substring(0, 15000)}`, // Limit to avoid token issues
                system: "You are a PDF analysis expert. Analyze the provided PDF content and create a detailed, accurate summary. Include: 1) Main points and themes, 2) Key findings and insights, 3) A concise summary of the document's purpose. Format your response with clear headings using markdown format (## for main headings, ### for subheadings). Be factual and precise - only include information actually present in the document."
              }),
            });
            
            if (!response.ok) {
              throw new Error(`API response error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Create a wrapper for the header info
            const headerHtml = `<div style="font-family: system-ui, -apple-system, sans-serif; color: #111827; font-size: 16px; line-height: 1.6;">
              <div style="padding: 10px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 15px; display: flex; align-items: center; gap: 12px;">
                <div style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background-color: #3b82f6; border-radius: 50%;">
                  <span style="color: white;">📄</span>
                </div>
                <div>
                  <span style="font-weight: 600; color: #111827;">${file.name}</span>
                  <span style="color: #6b7280; font-size: 14px; margin-left: 8px;">${fileSize} KB • ${pdf.numPages} pages</span>
                </div>
              </div>
            </div>`;
            
            // First update with just the header
            updateMessage(headerHtml);
            
            // Format the response with headings (convert markdown headings to HTML)
            let formattedResponse = data.response;
            formattedResponse = formattedResponse
              // Convert ## headings to styled h2
              .replace(/##\s+(.+)/g, '<h2 style="color: #2563eb; font-size: 20px; font-weight: 600; margin-top: 24px; margin-bottom: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">$1</h2>')
              // Convert ### subheadings to styled h3
              .replace(/###\s+(.+)/g, '<h3 style="color: #3b82f6; font-size: 18px; font-weight: 600; margin-top: 20px; margin-bottom: 12px;">$1</h3>');
            
            // Create a typing animation for the summary content
            // We'll define a function to update the message with typing animation
            const typeMessageContent = (headerContent, summaryContent) => {
              // Get the content to type (everything after the header)
              const contentToType = summaryContent.substring(headerContent.length);
              const characters = contentToType.split('');
              let currentText = headerContent;
              let index = 0;
              
              // Track if user is manually scrolling
              const userScrolling = { current: false };
              let lastScrollTop = 0;
              
              // Function to check if user is manually scrolling
              const checkUserScrolling = () => {
                const dynamicContent = document.querySelector(".rbt-daynamic-page-content");
                if (!dynamicContent) return;
                
                // If user has scrolled up from bottom, they're manually scrolling
                const isAtBottom = dynamicContent.scrollHeight - dynamicContent.scrollTop <= dynamicContent.clientHeight + 150;
                if (!isAtBottom) {
                  userScrolling.current = true;
                }
                
                // If user scrolls down to bottom again, resume auto-scrolling
                if (dynamicContent.scrollTop > lastScrollTop && isAtBottom) {
                  userScrolling.current = false;
                }
                
                lastScrollTop = dynamicContent.scrollTop;
              };
              
              // Add event listener for scroll
              const dynamicContent = document.querySelector(".rbt-daynamic-page-content");
              if (dynamicContent) {
                dynamicContent.addEventListener('scroll', checkUserScrolling);
              }
              
              // Function to ensure proper scrolling without forcing user
              const ensureScrollVisible = () => {
                if (dynamicContent && !userScrolling.current) {
                  dynamicContent.scrollTo({
                    top: dynamicContent.scrollHeight,
                    behavior: 'auto' // Use auto instead of smooth to prevent jumps
                  });
                }
              };
              
              // Set up a less frequent scroll interval to reduce interference
              const scrollInterval = setInterval(ensureScrollVisible, 3000);
              
              const typeInterval = setInterval(() => {
                if (index < characters.length) {
                  // Add next character
                  currentText += characters[index];
                  // Update message with current text
                  updateMessage(currentText);
                  // Progress to next character
                  index++;
                  
                  // Only scroll if needed and user isn't manually scrolling
                  if (index % 200 === 0 && !userScrolling.current) {
                    ensureScrollVisible();
                  }
                } else {
                  // End typing animation
                  clearInterval(typeInterval);
                  clearInterval(scrollInterval);
                  
                  // Clean up event listener
                  if (dynamicContent) {
                    dynamicContent.removeEventListener('scroll', checkUserScrolling);
                  }
                  
                  // Final scroll only if user isn't manually scrolling
                  if (!userScrolling.current) {
                    setTimeout(ensureScrollVisible, 100);
                  }
                }
              }, 15); // Slightly faster typing for better responsiveness
            };
            
            // Start the typing animation with the formatted API response
            typeMessageContent(headerHtml, headerHtml + formattedResponse);
            
            // Return the final HTML which will be displayed after typing completes
            resolve(headerHtml + formattedResponse);
          } catch (apiError) {
            console.error("API call error:", apiError);
            // Try an alternative processing method
            updateMessage(`<div style="font-family: system-ui, -apple-system, sans-serif; color: #111827; font-size: 16px; line-height: 1.5;">
              <div style="padding: 10px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 15px; display: flex; align-items: center; gap: 12px;">
                <div style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background-color: #3b82f6; border-radius: 50%;">
                  <span style="color: white;">📄</span>
                </div>
                <div>
                  <span style="font-weight: 600; color: #111827;">${file.name}</span>
                  <span style="color: #6b7280; font-size: 14px; margin-left: 8px;">${fileSize} KB • ${pdf.numPages} pages</span>
                </div>
              </div>
              <p style="color: #ef4444; font-weight: 500; margin-bottom: 5px;">API error. Trying alternative method...</p>
            </div>`);
            
            // Process the text locally to identify key elements
            const sentences = fullText.split(/[.!?]+/).filter(s => s.trim().length > 20);
            const wordCount = fullText.split(/\s+/).length;
            
            // Extract what looks like main sections or headings
            const possibleHeadings = sentences
              .filter(s => s.length < 100 && s.length > 10)
              .filter(s => /^[A-Z0-9]/.test(s.trim()))
              .slice(0, 5);
            
            // Try to find key paragraphs (longer sentences that might contain important info)
            const keyParagraphs = sentences
              .filter(s => s.length > 150)
              .slice(0, 3);
            
            const summaryHtml = `<div style="font-family: system-ui, -apple-system, sans-serif; color: #111827; font-size: 16px; line-height: 1.6;">
              <div style="padding: 10px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 15px; display: flex; align-items: center; gap: 12px;">
                <div style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background-color: #3b82f6; border-radius: 50%;">
                  <span style="color: white;">📄</span>
                </div>
                <div>
                  <span style="font-weight: 600; color: #111827;">${file.name}</span>
                  <span style="color: #6b7280; font-size: 14px; margin-left: 8px;">${fileSize} KB • ${pdf.numPages} pages • ${wordCount} words</span>
                </div>
              </div>
              
              <h2 style="color: #2563eb; font-size: 20px; font-weight: 600; margin-top: 24px; margin-bottom: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Document Overview</h2>
              <p>This document contains ${pdf.numPages} pages and approximately ${wordCount} words. The following sections provide a preliminary analysis of the content.</p>
              
              ${possibleHeadings.length > 0 ? `
              <h2 style="color: #2563eb; font-size: 20px; font-weight: 600; margin-top: 24px; margin-bottom: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Main Sections</h2>
              <ul style="padding-left: 20px; margin-top: 5px; color: #374151;">
                ${possibleHeadings.map(heading => `<li style="margin-bottom: 8px;">${heading.trim()}</li>`).join('')}
              </ul>
              ` : ''}
              
              ${keyParagraphs.length > 0 ? `
              <h2 style="color: #2563eb; font-size: 20px; font-weight: 600; margin-top: 24px; margin-bottom: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Key Content</h2>
              ${keyParagraphs.map(para => `<p style="margin-bottom: 8px; text-align: justify;">${para.trim()}.</p>`).join('')}
              ` : ''}
              
              <div style="margin-top: 15px; padding: 10px; background-color: #f9fafb; border-left: 3px solid #3b82f6; border-radius: 4px;">
                <p style="color: #4b5563; margin: 0;">For a more detailed analysis, please try uploading a smaller section of the document or use a different PDF.</p>
              </div>
            </div>`;
            
            // Create a header-only version for initial display
            const headerHtml = `<div style="font-family: system-ui, -apple-system, sans-serif; color: #111827; font-size: 16px; line-height: 1.6;">
              <div style="padding: 10px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 15px; display: flex; align-items: center; gap: 12px;">
                <div style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background-color: #3b82f6; border-radius: 50%;">
                  <span style="color: white;">📄</span>
                </div>
                <div>
                  <span style="font-weight: 600; color: #111827;">${file.name}</span>
                  <span style="color: #6b7280; font-size: 14px; margin-left: 8px;">${fileSize} KB • ${pdf.numPages} pages • ${wordCount} words</span>
                </div>
              </div>
            </div>`;
            
            // First update with just the header
            updateMessage(headerHtml);
            
            // Similar typing animation but for the fallback content
            typeMessageContent(headerHtml, summaryHtml);
            
            resolve(summaryHtml);
          }
        } catch (error) {
          console.error("Error extracting PDF content:", error);
          
          // Provide a useful error message
          const errorHtml = `<div style="font-family: system-ui, -apple-system, sans-serif; color: #111827; font-size: 16px; line-height: 1.6;">
            <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; margin-bottom: 16px; border-radius: 4px;">
              <p style="color: #b91c1c; margin: 0; font-weight: 500;">There was an error processing this PDF</p>
              <p style="color: #ef4444; margin: 10px 0 0 0; font-size: 15px;">Error details: ${error.message || "Unknown error"}</p>
            </div>
            
            <p>This could be because the file is:</p>
            <ul style="padding-left: 20px; margin-top: 5px; color: #374151;">
              <li style="margin-bottom: 8px;">Encrypted or password-protected</li>
              <li style="margin-bottom: 8px;">Corrupted or in an unsupported format</li>
              <li style="margin-bottom: 8px;">Using unsupported features (like scanned images without OCR)</li>
              <li style="margin-bottom: 8px;">Too large for processing (this PDF is ${Math.round(file.size / 1024)} KB)</li>
            </ul>
            
            <p style="margin-top: 15px;">Try uploading a different PDF file, or one that is smaller and text-based rather than image-based.</p>
          </div>`;
          
          updateMessage(errorHtml);
          resolve(errorHtml);
        }
      };
      
      reader.onerror = function(error) {
        console.error("Error reading file:", error);
        
        // Provide a useful error message for file reading errors
        const errorHtml = `<div style="font-family: system-ui, -apple-system, sans-serif; color: #111827; font-size: 16px; line-height: 1.6;">
          <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; margin-bottom: 16px; border-radius: 4px;">
            <p style="color: #b91c1c; margin: 0; font-weight: 500;">Error Reading File</p>
            <p style="color: #ef4444; margin: 10px 0 0 0; font-size: 15px;">Could not open or read the file. The file might be corrupted or inaccessible.</p>
          </div>
          <p>Please try uploading the file again or use a different file.</p>
        </div>`;
        
        updateMessage(errorHtml);
        reject(error);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing PDF:", error);
      
      // Generic error message for unexpected errors
      const errorHtml = `<div style="font-family: system-ui, -apple-system, sans-serif; color: #111827; font-size: 16px; line-height: 1.6;">
        <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; margin-bottom: 16px; border-radius: 4px;">
          <p style="color: #b91c1c; margin: 0; font-weight: 500;">Unexpected Error</p>
          <p style="color: #ef4444; margin: 10px 0 0 0; font-size: 15px;">An unexpected error occurred while processing the file.</p>
        </div>
        <p>Please try again or contact support if the problem persists.</p>
      </div>`;
      
      updateMessage(errorHtml);
      reject(error);
    }
  });
};

/**
 * Extracts the news category from a query
 * @param {string} query - The user's query about news
 * @returns {string} - The extracted category
 */
export const extractNewsCategory = (query) => {
  const query_lower = query.toLowerCase();
  
  // Check for specific category mentions
  if (query_lower.includes("tech") || 
      query_lower.includes("technology") || 
      query_lower.includes("digital") || 
      query_lower.includes("gadget")) {
    return "technology";
  }
  
  if (query_lower.includes("business") || 
      query_lower.includes("finance") || 
      query_lower.includes("economy") || 
      query_lower.includes("market")) {
    return "business";
  }
  
  if (query_lower.includes("health") || 
      query_lower.includes("medical") || 
      query_lower.includes("wellness") || 
      query_lower.includes("fitness")) {
    return "health";
  }
  
  if (query_lower.includes("science") || 
      query_lower.includes("research") || 
      query_lower.includes("discovery")) {
    return "science";
  }
  
  if (query_lower.includes("entertainment") || 
      query_lower.includes("celebrity") || 
      query_lower.includes("movie") || 
      query_lower.includes("film") || 
      query_lower.includes("music")) {
    return "entertainment";
  }
  
  if (query_lower.includes("sports") || 
      query_lower.includes("game") || 
      query_lower.includes("athlete") || 
      query_lower.includes("tournament")) {
    return "sports";
  }
  
  if (query_lower.includes("politics") || 
      query_lower.includes("government") || 
      query_lower.includes("election") || 
      query_lower.includes("policy")) {
    return "politics";
  }
  
  // Default to general if no specific category is found
  return "general";
};

/**
 * Formats news articles for display in the chat
 * @param {Array} articles - The array of news articles
 * @returns {string} - HTML formatted news content
 */
export const formatNewsForResponse = (articles) => {
  if (!articles || articles.length === 0) {
    return "<div style='color: #ef4444; font-weight: 500;'>No news articles found for your query.</div>";
  }
  
  // Get today's date for highlighting
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
  
  let newsHtml = `<div style="font-family: system-ui, -apple-system, sans-serif; color: #111827;">
    <h3 style="color: #2563eb; margin-bottom: 16px; font-size: 20px; font-weight: 600;">Today's News Updates</h3>
    <div style="display: flex; flex-direction: column; gap: 16px;">`;
  
  // Sort articles with most recent first
  const sortedArticles = [...articles].sort((a, b) => 
    new Date(b.publishedAt) - new Date(a.publishedAt)
  );
  
  // Take only the top 5 articles for better display
  const topArticles = sortedArticles.slice(0, 5);
  
  // Add each news article
  topArticles.forEach(article => {
    const articleDate = new Date(article.publishedAt);
    const isToday = articleDate.toISOString().split('T')[0] === todayStr;
    const formattedDate = articleDate.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Determine if it's a fresh article (less than 12 hours old)
    const isRecent = (Date.now() - articleDate.getTime()) < (12 * 60 * 60 * 1000);
    
    newsHtml += `
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; ${isToday ? 'border-left: 4px solid #2563eb;' : ''}">
        <div style="display: flex; flex-direction: column;">
          <div style="padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 14px; color: #6b7280;">${article.source.name}</span>
              <span style="font-size: 14px; color: ${isRecent ? '#2563eb' : '#6b7280'}; font-weight: ${isRecent ? '600' : '400'};">
                ${isRecent ? '🔥 ' : ''}${formattedDate}
              </span>
            </div>
            <h4 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 600; color: #111827;">
              <a href="${article.url}" target="_blank" style="color: #2563eb; text-decoration: none; hover: {text-decoration: underline;}">
                ${article.title}
              </a>
            </h4>
            <p style="margin: 0 0 12px 0; font-size: 16px; color: #4b5563;">
              ${article.description || "Read the full article for more details."}
            </p>
            ${article.urlToImage ? 
              `<div style="text-align: center; margin-top: 12px;">
                <img src="${article.urlToImage}" alt="News image" style="max-width: 100%; max-height: 200px; object-fit: cover; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" onerror="this.style.display='none';" />
              </div>` 
              : ''}
          </div>
        </div>
      </div>`;
  });
  
  newsHtml += `</div>
    <div style="margin-top: 20px; text-align: center; font-style: italic; color: #6b7280;">
      News articles sourced from various providers. Last updated: ${new Date().toLocaleString()}
    </div>
  </div>`;
  
  return newsHtml;
};

/**
 * Determines if a query is related to news
 * @param {string} query - The user's query
 * @returns {boolean} - Whether the query is news-related
 */
export const isNewsRelatedQuery = (query) => {
  const query_lower = query.toLowerCase();
  
  // Check for explicit news mentions
  const newsTerms = [
    "news", 
    "latest", 
    "headlines", 
    "today", 
    "current events", 
    "breaking",
    "report",
    "update",
    "what's happening",
    "what is happening",
    "recent developments",
    "today's top stories"
  ];
  
  // Check for category + news combinations
  const categories = [
    "tech", "technology", 
    "business", "finance", "market", "economic", "economy",
    "health", "medical", "covid", "virus", "pandemic", 
    "science", "scientific", "research",
    "sports", "game", "match", "tournament", "championship",
    "entertainment", "celebrity", "film", "movie", "music",
    "politics", "political", "government", "election"
  ];
  
  // Check for news terms
  for (const term of newsTerms) {
    if (query_lower.includes(term)) {
      return true;
    }
  }
  
  // Check for news phrases
  if (query_lower.startsWith("show me") || 
      query_lower.startsWith("tell me about") || 
      query_lower.startsWith("what are the")) {
    
    // Check if these phrases are combined with categories
    for (const category of categories) {
      if (query_lower.includes(category)) {
        return true;
      }
    }
  }
  
  // Check for specific news phrasings
  if ((query_lower.includes("what's") || query_lower.includes("what is")) &&
      (query_lower.includes("happening") || query_lower.includes("going on"))) {
    return true;
  }
  
  return false;
}; 