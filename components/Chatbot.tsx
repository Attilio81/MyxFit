import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon, ChatBubbleOvalLeftEllipsisIcon } from './common/Icons';
import type { ChatMessage } from '../types';

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isAvailable: boolean;
}

// Helper component to render markdown-formatted text from the AI
const FormattedMessage: React.FC<{ text: string }> = ({ text }) => {
  // A simple function to apply inline formatting
  const formatInline = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>'); // Italics
  };

  // Split the text into blocks (paragraphs or lists) separated by empty lines
  const blocks = text.split(/\n\s*\n/);

  return (
    <>
      {blocks.map((block, index) => {
        // Check if a block is a list by checking the first line
        const isList = block.trim().startsWith('* ') || block.trim().startsWith('- ');

        if (isList) {
          const listItems = block.split('\n').map(item => item.trim().substring(2));
          return (
            <ul key={index} className="list-disc list-inside space-y-1 my-2 pl-2">
              {listItems.map((item, itemIndex) => (
                <li key={itemIndex} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
              ))}
            </ul>
          );
        }

        // Otherwise, render as a paragraph, preserving line breaks within it
        return (
          <p key={index} className="my-1" dangerouslySetInnerHTML={{ __html: formatInline(block.replace(/\n/g, '<br />')) }} />
        );
      })}
    </>
  );
};


const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose, messages, onSendMessage, isLoading, isAvailable }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && isAvailable) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-end justify-center z-50 transition-opacity"
      aria-labelledby="chatbot-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-dark-card w-full max-w-lg h-[80vh] rounded-t-2xl shadow-xl flex flex-col"
        role="document"
      >
        <header className="flex items-center justify-between p-4 border-b border-dark-border">
          <div className="flex items-center gap-2">
            <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6 text-brand-secondary" />
            <h2 id="chatbot-title" className="text-xl font-bold">AI Assistant</h2>
          </div>
          <button onClick={onClose} className="text-dark-text-secondary hover:text-white" aria-label="Close chat">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-grow p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-brand-primary text-white rounded-br-lg'
                    : 'bg-gray-700 text-dark-text rounded-bl-lg'
                }`}
              >
                {msg.role === 'user' ? (
                   <p className="text-sm">{msg.text}</p>
                ) : (
                    <div className="text-sm">
                        <FormattedMessage text={msg.text} />
                    </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex justify-start">
                <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-gray-700 text-dark-text rounded-bl-lg">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-dark-border">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isAvailable ? "Ask about your PRs..." : "AI not available"}
              className="flex-grow px-4 py-2 bg-gray-700 border border-dark-border rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:cursor-not-allowed"
              aria-label="Chat input"
              disabled={!isAvailable || isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim() || !isAvailable}
              className="bg-brand-secondary hover:bg-orange-500 text-white font-semibold rounded-full p-2 disabled:bg-gray-600 disabled:cursor-not-allowed transition"
              aria-label="Send message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M3.105 2.289a.75.75 0 00-.826.946l2.43 7.925H12a.75.75 0 010 1.5H4.709l-2.43 7.925a.75.75 0 00.826.946 60.517 60.517 0 0015.362-8.416.75.75 0 000-1.218A60.517 60.517 0 003.105 2.289z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;