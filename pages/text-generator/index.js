import React, { useEffect, useState, useRef } from "react";
import Context from "@/context/Context";
import PageHead from "../Head";
import PopupMobileMenu from "@/components/Header/PopUpMobileMenu";
import BackToTop from "../backToTop";
import LeftDashboardSidebar from "@/components/Header/LeftDashboardSidebar";
import HeaderDashboard from "@/components/Header/HeaderDashboard";
import RightDashboardSidebar from "@/components/Header/RightDashboardSidebar";
import Modal from "@/components/Common/Modal";
import axios from "axios";
import Image from "next/image";
import sal from "sal.js";
import { useAppContext } from "@/context/Context";
import Logo from "@/components/Header/Logo";
import LogoCon from "@/components/Header/Logocon";
import Clipboard from 'clipboard';

const API_BASE_URL = "https://api.openai.com/v1/chat/completions";

const TextGeneratorPage = ({ display }) => {
  const [messages, setMessages] = useState([]);
  const isLightTheme = useAppContext();
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState(null);

  // Add a function to strip HTML tags but preserve formatting
  const stripHtml = (html) => {
    if (!html) return '';
    
    // Create a temporary div to work with the HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Process markdown-style headings and formatting elements
    const processNode = (node) => {
      let result = '';
      
      if (node.nodeType === Node.TEXT_NODE) {
        result += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Special handling for different element types to preserve formatting
        switch (node.tagName.toLowerCase()) {
          case 'br':
            result += '\n';
            break;
          case 'p':
            // Process children then add double newline after paragraphs
            for (const child of node.childNodes) {
              result += processNode(child);
            }
            result += '\n\n';
            break;
          case 'div':
            // Process children then add newline
            for (const child of node.childNodes) {
              result += processNode(child);
            }
            result += '\n';
            break;
          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6':
            // Make headings stand out with newlines before and after
            result += '\n' + node.textContent + '\n\n';
            break;
          case 'ul':
          case 'ol':
            // Process list items
            result += '\n';
            for (const child of node.childNodes) {
              result += processNode(child);
            }
            result += '\n';
            break;
          case 'li':
            // Add bullet points or numbers for list items
            result += '• ' + node.textContent + '\n';
            break;
          case 'pre':
            // For preformatted text (like code blocks), maintain all whitespace
            result += '\n' + node.textContent + '\n\n';
            break;
          case 'hr':
            // Horizontal rules become visible separators
            result += '\n---\n\n';
            break;
          case 'blockquote':
            // Format blockquotes with > prefix
            const lines = node.textContent.split('\n');
            result += '\n' + lines.map(line => '> ' + line).join('\n') + '\n\n';
            break;
          default:
            // Default behavior for other elements: just process children
            for (const child of node.childNodes) {
              result += processNode(child);
            }
        }
      }
      
      return result;
    };
    
    // Process the entire content
    let text = processNode(tempDiv);
    
    // Handle special content patterns
    text = text
      .replace(/---/g, '---\n')  // Make sure separators have newlines
      .replace(/\n{3,}/g, '\n\n'); // Replace multiple consecutive newlines with just two
    
    // Look for list patterns and format them properly
    text = text.replace(/^(\d+)\.\s(.+)/gm, '$1. $2');
    
    return text.trim();
  };

  // Initialize clipboard functionality
  useEffect(() => {
    // Custom copy function that strips HTML
    const clipboard = new Clipboard('.copy-button', {
      text: function(trigger) {
        const messageId = trigger.getAttribute('data-message-id');
        const htmlContent = trigger.getAttribute('data-clipboard-text');
        return stripHtml(htmlContent);
      }
    });
    
    clipboard.on('success', (e) => {
      const messageId = e.trigger.getAttribute('data-message-id');
      setCopiedMessageId(parseInt(messageId));
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
      
      e.clearSelection();
    });
    
    return () => {
      clipboard.destroy();
    };
  }, []);

  useEffect(() => {
    sal(); // Initialize animations
  }, []);

  useEffect(() => {
    scrollToLastMessage(); // Scroll to the last message whenever messages state changes
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
  
    setLoading(true);
    setError(""); // Clear any existing error messages
  
    // Store the message and immediately clear input field
    const messageToSend = newMessage;
    setNewMessage(""); // Clears the input field
  
    // Add user message to chat
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: Date.now(),
        title: "You",
        desc: messageToSend,
        response: {
          role: "assistant",
          content: "Thinking 5...", // Show "Thinking 5..." before the actual response
        },
      },
    ]);

    // Scroll to the bottom of the page when a message is sent
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  
    try {
      const API_KEY = process.env.NEXT_PUBLIC_API_URL; // Use environment variable for security
      if (!API_KEY) throw new Error("API key is missing.");
  
      const requestBody = {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: messageToSend }],
      };

      // Countdown before showing the response
      for (let i = 4; i >= 1; i--) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          const lastMessage = newMessages[newMessages.length - 1];
          lastMessage.response.content = `Thinking ${i}...`;
          return newMessages;
        });
      }
  
      const response = await axios.post(API_BASE_URL, requestBody, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      });
  
      const assistantMessage =
        response.data?.choices?.[0]?.message?.content || "No response received.";
      const formattedMessage = formatResponse(assistantMessage);
  
      let index = 0;
      const typingSpeed = 100; // Speed of typing effect (in ms)
      const totalLength = formattedMessage.length; // Use the formattedMessage for totalLength
  
      // Update the "Thinking..." message with the assistant's message once the typing starts
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        const lastMessage = newMessages[newMessages.length - 1]; // Copy the last message
        lastMessage.response.content = ""; // Clear "Thinking..." message
  
        return newMessages;
      });
  
      const interval = setInterval(() => {
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          const lastMessage = newMessages[newMessages.length - 1]; // Copy the last message
  
          if (index < totalLength) {
            // Add one character at a time, in the correct order
            lastMessage.response.content += formattedMessage.charAt(index);
            index++;
          } else {
            clearInterval(interval); // Stop the typing effect once the text is complete
            setTimeout(scrollToLastMessage, 100); // Scroll to the last message after it's fully typed
          }
  
          return newMessages; // Return the updated messages state
        });
      }, typingSpeed);
  
      setLoading(false); // Disable the loading state once the message is finished
  
    } catch (err) {
      console.error("API Error:", err);
      setError("Failed to send message.");
      setLoading(false); // Enable send button in case of error
    }
  };
  
  // Scroll to the last message automatically
  const scrollToLastMessage = () => {
    // Ensure the last message is visible by scrolling into view
    if (messages.length > 0) {
      const lastMessageElement = document.getElementById(`message-${messages[messages.length - 1].id}`);
      if (lastMessageElement) {
        lastMessageElement.scrollIntoView({ behavior: "smooth", block: "end" });
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }
    }
  };
  
  
  const formatResponse = (text) => text.replace(/(\d+)\.\s/g, "\n$1. ");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <PageHead title="Text Generator" />
      <main className="page-wrapper rbt-dashboard-page">
        <div className="rbt-panel-wrapper">
          <Context>
            <LeftDashboardSidebar />
            <HeaderDashboard display="" />
            <RightDashboardSidebar />
            <Modal />
            <PopupMobileMenu />

            <div className="rbt-main-content">
              <div className="rbt-daynamic-page-content">
                <div className="rbt-dashboard-content">
                  <div className="content-page">
                    <div className="chat-box-section">
                      {error && (
                        <p className="text-danger text-center">{error}</p>
                      )}

                      {messages.length === 0 ? (
                        <div
                          className="slider-area slider-style-1 variation-default slider-bg-image bg-banner1 slider-bg-shape"
                          data-black-overlay="1"
                        >
                          <div className="container">
                            <div className="row justify-content-center">
                              <div className="col-lg-12">
                                <div className="inner text-center mt--20">
                                <Logo/>
                                  <h1
                                    className="title display-one"
                                    style={{
                                      fontSize: "20px",
                                      lineHeight: "4rem",
                                    }}
                                  >
                                    How can I help you? <br /> मैं आपकी क्या मदद
                                    कर सकता हूं ?
                                  </h1>

                                  <div className="form-group">
                                    <textarea
                                      name="text"
                                      className="input-file"
                                      cols="30"
                                      rows="2"
                                      placeholder="नमस्ते..."
                                      value={newMessage}
                                      onChange={(e) =>
                                        setNewMessage(e.target.value)
                                      }
                                      onKeyDown={handleKeyDown}
                                    />
                                    <button
                                      type="button"
                                      className="btn-default"
                                      onClick={handleSendMessage}
                                      disabled={loading}
                                    >
                                      Start with ब्रह्मांड AI
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        messages.map((data) => (
                          <>
                            <div className="chat-box-list pb-0" key={data.id}>
                              <div className="chat-box author-speech">
                                <div className="inner">
                                  <div className="chat-section">
                                    <div className="author">
                                      <Image
                                        className="w-100"
                                        width={40}
                                        height={40}
                                        src={
                                          data.authorImg ||
                                          "/images/team/team-01sm.jpg"
                                        }
                                        alt="Author"
                                      />
                                    </div>
                                    <div className="chat-content">
                                      <h6 className="title">{data.title}</h6>
                                      <p className="editable me-4">
                                        {data.desc}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {data.response && (
                                <div className="chat-box ai-speech">
                                  <div className="inner">
                                    <div className="chat-section">
                                      <div className="author">
                                      <LogoCon/>
                                      </div>
                                      <div className="chat-content">
                                        <h6 className="title">ब्रह्मांड AI</h6>
                                        <div className="position-relative">
                                          <p className="mb--20">
                                            {data.response.content}
                                          </p>
                                          <button 
                                            className="copy-button form-icon" 
                                            data-clipboard-text={data.response.content}
                                            data-message-id={data.id}
                                            title="Copy to clipboard"
                                            style={{
                                              position: 'absolute',
                                              top: '0',
                                              right: '-5px',
                                              background: 'transparent',
                                              border: 'none',
                                              cursor: 'pointer',
                                              padding: '5px',
                                              color: isLightTheme ? '#333' : '#fff'
                                            }}
                                          >
                                            {copiedMessageId === data.id ? (
                                              <i className="fa-solid fa-check" style={{ color: '#4CAF50' }}></i>
                                            ) : (
                                              <i className="fa-regular fa-copy"></i>
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="rbt-static-bar">
                              <form
                                className="new-chat-form border-gradient"
                                onSubmit={(e) => e.preventDefault()}
                              >
                                <textarea
                                  rows="1"
                                  placeholder="Send a message..."
                                  value={newMessage}
                                  onChange={(e) =>
                                    setNewMessage(e.target.value)
                                  }
                                  onKeyDown={handleKeyDown} // Capture Enter key
                                ></textarea>

                                <div className="left-icons">
                                  <div
                                    title="AI Assistant"
                                    className="form-icon icon-gpt"
                                  >
                                   <LogoCon/>
                                  </div>
                                </div>
                                <div className="right-icons">
                                  <div className="form-icon icon-plus">
                                    <input
                                      type="file"
                                      className="input-file"
                                      name="myfile"
                                      multiple
                                    />
                                    <i className="fa-sharp fa-regular fa-plus"></i>
                                  </div>
                                  <a className="form-icon icon-mic">
                                    <i className="fa-regular fa-waveform-lines"></i>
                                  </a>
                                  <button
                                    className="form-icon icon-send"
                                    onClick={handleSendMessage}
                                    disabled={loading || !newMessage.trim()}
                                  >
                                    {loading ? (
                                      <i className="fa-sharp fa-solid fa-paper-plane-top"></i>
                                    ) : (
                                      <i className="fa-sharp fa-solid fa-paper-plane-top"></i>
                                    )}
                                  </button>
                                </div>
                              </form>
                            </div>
                          </>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Context>
        </div>
      </main>
      <BackToTop />
    </>
  );
};

export default TextGeneratorPage;
