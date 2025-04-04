/**
 * Chat Response Handler
 * 
 * This component provides response generation logic for the chat interface.
 * It handles different types of queries and gives appropriate responses.
 */

/**
 * Generate a contextual response based on the user query
 * @param {string} query - The user's message
 * @returns {string} - The generated response
 */
export const generateResponse = (query) => {
  query = query.toLowerCase();
  
  // Check for greetings
  if (/^(hi|hello|hey|namaste|नमस्ते)/i.test(query)) {
    return "नमस्ते! How can I assist you today? I can help with information, answer questions, provide news updates, or assist with PDF analysis.";
  }
  
  // Check for questions about the AI
  if (query.includes("who are you") || query.includes("what are you") || query.includes("about you")) {
    return "I am ब्रह्मांड AI, your digital assistant designed to help with a wide range of tasks. I can provide information on various topics, answer questions, analyze PDFs, and keep you updated with the latest news. How can I help you today?";
  }
  
  // Check for weather-related queries
  if (query.includes("weather") || query.includes("temperature") || query.includes("forecast")) {
    return "Based on the latest forecast, the weather today shows partly cloudy conditions with temperatures ranging between 22°C and 28°C. There's a 20% chance of light showers in the evening. Would you like more detailed weather information for a specific location?";
  }
  
  // Check for time-related queries
  if (query.includes("time") || query.includes("date") || query.includes("day")) {
    const now = new Date();
    return `The current date and time is ${now.toLocaleString()}. Is there something specific about today you'd like to know?`;
  }
  
  // Check for help queries
  if (query.includes("help") || query.includes("can you do") || query.includes("features")) {
    return "I can help you with several things:\n\n" +
      "* **Answer questions** on a wide range of topics\n" +
      "* **Analyze PDFs** and extract key information\n" +
      "* **Provide news updates** on topics that interest you\n" +
      "* **Weather information** for your location\n" +
      "* **Simple calculations** and conversions\n\n" +
      "You can also use voice input by clicking the microphone button. What would you like to explore first?";
  }
  
  // Check for brainstorming requests
  if (query.includes("brainstorm") || query.includes("ideas for")) {
    const topic = query.replace(/brainstorm ideas for me about|brainstorm|ideas for/gi, "").trim();
    if (topic) {
      return `Here are some creative ideas related to ${topic}:\n\n` +
        `* Explore innovative approaches to ${topic} using modern technologies\n` +
        `* Research the latest developments in ${topic} and identify potential opportunities\n` +
        `* Create a collaborative platform for sharing insights about ${topic}\n` +
        `* Develop a unique perspective on ${topic} by combining different disciplines\n` +
        `* Start a community project focused on addressing challenges in ${topic}\n\n` +
        `Would you like me to elaborate on any of these ideas?`;
    }
  }
  
  // Check for calculation queries
  if (/[\d\+\-\*\/\(\)]+/.test(query) && !query.includes("password")) {
    try {
      // Extract potential math expression
      const mathExpression = query.replace(/[^0-9+\-*/().]/g, "");
      if (mathExpression.length > 0) {
        // Safely evaluate the expression
        const result = eval(mathExpression);
        if (!isNaN(result)) {
          return `The result of ${mathExpression} is ${result}. Is there anything else you'd like to calculate?`;
        }
      }
    } catch (e) {
      // If math evaluation fails, continue to default response
    }
  }
  
  // Check for stock market related queries
  if (query.includes("stock") || query.includes("market") || query.includes("shares") || query.includes("investment")) {
    return "The stock market is showing mixed trends today. Major indices like SENSEX and NIFTY have seen moderate fluctuations. Tech stocks are generally performing well, while some sectors like energy are facing challenges. Would you like more specific information about particular stocks or sectors?";
  }
  
  // Check for technology related queries
  if (query.includes("technology") || query.includes("tech") || query.includes("ai") || query.includes("artificial intelligence") || query.includes("digital")) {
    return "The technology sector continues to evolve rapidly. Recent developments in AI and machine learning have led to significant advancements in areas like natural language processing, computer vision, and predictive analytics. Companies are increasingly focusing on sustainable technology solutions and ethical AI practices. Is there a specific technology trend you'd like to know more about?";
  }
  
  // Check for health related queries
  if (query.includes("health") || query.includes("medical") || query.includes("wellness") || query.includes("fitness")) {
    return "Maintaining good health involves a balance of proper nutrition, regular physical activity, adequate sleep, and stress management. Recent health studies emphasize the importance of preventive care and holistic wellness approaches. Would you like specific information about any particular health topic or wellness practice?";
  }
  
  // Check for travel related queries
  if (query.includes("travel") || query.includes("vacation") || query.includes("trip") || query.includes("tourism")) {
    return "Travel trends are showing an increase in sustainable tourism and authentic local experiences. Popular destinations are implementing visitor management systems to balance tourism with environmental preservation. Would you like recommendations for specific travel destinations or tips for sustainable travel?";
  }
  
  // Check for food related queries
  if (query.includes("food") || query.includes("recipe") || query.includes("cooking") || query.includes("cuisine")) {
    return "Culinary trends are evolving with a focus on plant-based options, fusion cuisines, and traditional recipes with modern twists. Health-conscious eating and sustainable food practices are gaining popularity. Would you like some recipe suggestions or information about specific cuisines?";
  }
  
  // Check for education related queries
  if (query.includes("education") || query.includes("learning") || query.includes("study") || query.includes("course")) {
    return "Education is increasingly incorporating digital tools and personalized learning approaches. Online courses, microlearning, and skill-based education are becoming more prevalent. Lifelong learning is emphasized for career adaptability in our rapidly changing world. Would you like information about specific educational resources or learning methods?";
  }
  
  // Check for entertainment related queries
  if (query.includes("movie") || query.includes("film") || query.includes("show") || query.includes("entertainment") || query.includes("series")) {
    return "The entertainment industry is seeing a surge in streaming content and diverse storytelling. Recent acclaimed releases span various genres, from thought-provoking dramas to innovative sci-fi concepts. Would you like recommendations for movies or shows based on your interests?";
  }
  
  // Check for language translation or meaning requests
  if (query.includes("translate") || query.includes("meaning of") || query.includes("what does") || query.includes("definition")) {
    const wordMatch = query.match(/meaning of ([a-z]+)|what does ([a-z]+) mean|definition of ([a-z]+)|translate ([a-z]+)/i);
    if (wordMatch) {
      const word = wordMatch[1] || wordMatch[2] || wordMatch[3] || wordMatch[4];
      return `The term "${word}" generally refers to [simulated definition based on context]. This word can have different meanings in various contexts. For precise definitions, a specialized dictionary would be helpful. Is there a specific context in which you're using this term?`;
    }
  }
  
  // Default intelligent response for other queries
  return `I understand you're asking about "${query}". Here's what I know:\n\n` +
    `This is an interesting topic with many facets to explore. While I don't have all the specific details at hand, I can provide some general insights and perspectives.\n\n` +
    `If you're looking for more detailed information, you might want to:\n` +
    `* Ask a more specific question about particular aspects\n` +
    `* Upload relevant documents for me to analyze\n` +
    `* Try rephrasing your question for better results\n\n` +
    `Is there a particular aspect of this topic you'd like me to focus on?`;
}; 