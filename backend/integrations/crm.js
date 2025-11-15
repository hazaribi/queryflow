import { db } from '../config/database.js';

// Mock CRM integration - replace with actual CRM APIs
export const syncWithCRM = async (queryData) => {
  // Simulate CRM API call
  const crmData = {
    customer_id: `CRM_${Math.random().toString(36).substr(2, 9)}`,
    account_tier: Math.random() > 0.5 ? 'premium' : 'standard',
    last_purchase: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
  };
  
  // Update query with CRM data
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE queries SET tags = ? WHERE id = ?',
      [JSON.stringify(crmData), queryData.id],
      function(err) {
        if (err) reject(err);
        else resolve(crmData);
      }
    );
  });
};

// Auto-prioritize based on customer tier
export const autoPrioritize = (customerEmail, currentPriority) => {
  // Mock logic - in real implementation, check CRM for customer tier
  const isPremium = Math.random() > 0.7; // 30% chance of premium
  
  if (isPremium && currentPriority === 'low') {
    return 'medium';
  }
  if (isPremium && currentPriority === 'medium') {
    return 'high';
  }
  
  return currentPriority;
};

// Smart routing based on query content and customer data
export const smartRouting = (queryContent, customerData) => {
  const content = queryContent.toLowerCase();
  
  // Simple keyword-based routing
  if (content.includes('billing') || content.includes('payment') || content.includes('invoice')) {
    return { department: 'billing', skills: ['finance', 'accounting'] };
  }
  
  if (content.includes('technical') || content.includes('bug') || content.includes('error')) {
    return { department: 'technical', skills: ['development', 'qa'] };
  }
  
  if (content.includes('cancel') || content.includes('refund') || content.includes('complaint')) {
    return { department: 'retention', skills: ['customer_success'] };
  }
  
  return { department: 'general', skills: ['customer_service'] };
};