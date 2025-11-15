// Mock AI services for demonstration
export const analyzeSentiment = (content) => {
  const positiveWords = ['great', 'excellent', 'good', 'happy', 'satisfied', 'love', 'amazing'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'disappointed', 'frustrated', 'angry'];
  
  const words = content.toLowerCase().split(/\s+/);
  const positiveCount = words.filter(word => positiveWords.includes(word)).length;
  const negativeCount = words.filter(word => negativeWords.includes(word)).length;
  
  let sentiment = 'neutral';
  let confidence = 0.5;
  
  if (positiveCount > negativeCount) {
    sentiment = 'positive';
    confidence = Math.min(0.9, 0.6 + (positiveCount * 0.1));
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative';
    confidence = Math.min(0.9, 0.6 + (negativeCount * 0.1));
  }
  
  return { sentiment, confidence };
};

export const categorizeQuery = (content) => {
  const categories = {
    billing: ['bill', 'charge', 'payment', 'invoice', 'refund', 'cost'],
    technical: ['bug', 'error', 'crash', 'not working', 'broken', 'issue'],
    account: ['password', 'login', 'access', 'account', 'profile'],
    general: ['question', 'help', 'how', 'when', 'what', 'info']
  };
  
  const words = content.toLowerCase();
  let bestCategory = 'general';
  let maxScore = 0;
  
  for (const [category, keywords] of Object.entries(categories)) {
    const score = keywords.filter(keyword => words.includes(keyword)).length;
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  }
  
  const confidence = maxScore > 0 ? Math.min(0.9, 0.5 + (maxScore * 0.2)) : 0.3;
  
  return { category: bestCategory, confidence };
};

export const generateResponseSuggestions = (content, category) => {
  const templates = {
    billing: [
      "I understand your billing concern. Let me review your account and get back to you within 24 hours.",
      "Thank you for bringing this to our attention. I'll escalate this to our billing team immediately.",
      "I apologize for any confusion with your billing. Let me investigate this issue for you."
    ],
    technical: [
      "I'm sorry you're experiencing technical difficulties. Can you provide more details about when this started?",
      "Thank you for reporting this issue. Our technical team will investigate and provide a solution.",
      "I understand how frustrating technical issues can be. Let me connect you with our technical support team."
    ],
    account: [
      "I can help you with your account issue. For security purposes, I'll need to verify your identity first.",
      "Account security is important to us. I'll guide you through the steps to resolve this.",
      "I understand your account concern. Let me assist you in getting this resolved quickly."
    ],
    general: [
      "Thank you for contacting us. I'm here to help with your inquiry.",
      "I appreciate you reaching out. Let me provide you with the information you need.",
      "Thank you for your question. I'll make sure you get a comprehensive answer."
    ]
  };
  
  return templates[category] || templates.general;
};

export const predictPriority = (content, customerTier = 'standard') => {
  const urgentWords = ['urgent', 'emergency', 'asap', 'immediately', 'critical'];
  const highWords = ['important', 'serious', 'problem', 'issue', 'broken'];
  
  const words = content.toLowerCase();
  
  if (urgentWords.some(word => words.includes(word))) {
    return 'high';
  }
  
  if (highWords.some(word => words.includes(word))) {
    return customerTier === 'premium' ? 'high' : 'medium';
  }
  
  return customerTier === 'premium' ? 'medium' : 'low';
};