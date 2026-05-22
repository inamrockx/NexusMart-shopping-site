import React, { useState, useEffect, useRef } from 'react';

const LiveSupport = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hello! I am your NexusMart automated assistant. How can I help you today? (Try asking about: "admin credentials", "shipping", "coupon", "returns")' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    const newUserMsg = {
      id: Date.now(),
      sender: 'user',
      text: userText
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputText('');
    setIsTyping(true);

    // Dynamic chatbot response matching keywords
    setTimeout(() => {
      let responseText = "Thank you for messaging NexusMart support! An advisor will join shortly. You can also try asking about: 'admin', 'shipping', 'returns', or 'coupons'.";
      const query = userText.toLowerCase();

      if (query.includes('admin') || query.includes('credential') || query.includes('login') || query.includes('password')) {
        responseText = "🔑 **Admin Portal Credentials:** You can access the back-office by clicking 'Admin Console' in the navbar.\n- **Email**: admin@nexusmart.com\n- **Password**: admin\n\nOnce logged in, you can manage inventory, view interactive revenue charts, and fulfill customer orders in real-time!";
      } else if (query.includes('shipping') || query.includes('delivery')) {
        responseText = "📦 **Shipping Policy:** We offer **FREE shipping** worldwide on orders exceeding $150! For smaller purchases, standard delivery is a flat rate of $15. Deliveries generally take 3 to 5 business days.";
      } else if (query.includes('coupon') || query.includes('discount') || query.includes('promo')) {
        responseText = "🎫 **Active Promotions:** Use code **NEXUS20** at checkout to claim **20% OFF** your order! Simply copy this code and apply it during payment.";
      } else if (query.includes('return') || query.includes('refund')) {
        responseText = "🔄 **Returns & Refund:** NexusMart offers a **30-day money-back guarantee**. If you are unsatisfied, click 'My Orders' in your Account Dashboard, select your order, and submit a return request.";
      } else if (query.includes('price') || query.includes('payment') || query.includes('currency')) {
        responseText = "💳 **Currencies:** We support real-time price conversions in USD, EUR, and GBP. Toggle your currency from the top navigation header!";
      }

      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: responseText
      }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="chat-widget-container">
      {/* Floating Chat Bubble */}
      <div className="chat-bubble" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </div>

      {/* Chat Widget Drawer Panel */}
      {isOpen && (
        <div className="chat-box">
          <div className="chat-header">
            <div className="chat-avatar">🤖</div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '700' }}>NexusBot</h4>
              <span className="chat-status">🟢 Live AI Assistant</span>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((m) => (
              <div key={m.id} className={`chat-msg ${m.sender}`}>
                {/* Parse Markdown-like newlines or bullets */}
                <div style={{ whiteSpace: 'pre-line' }}>{m.text}</div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-msg bot typing">
                <span style={{ fontSize: '11px', fontStyle: 'italic', color: 'var(--text-muted)' }}>Assistant is typing...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form className="chat-input-bar" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Ask me anything..."
              className="chat-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="submit" className="icon-btn" style={{ width: '36px', height: '36px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default LiveSupport;
