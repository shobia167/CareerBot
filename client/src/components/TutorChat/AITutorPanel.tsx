import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, Trash2, Sparkles, User, RefreshCw, ChevronDown, MessageSquare } from 'lucide-react';
import { api } from '../../lib/api';
import { UserProfile, ChatMessage } from '../../types';

interface AITutorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
}

const SUGGESTED_PROMPTS = [
  'What is my current learning status?',
  'What should I learn next?',
  'Can I switch to an AI Engineer career?',
  'How can I improve my resume ATS score?'
];

export const AITutorPanel: React.FC<AITutorPanelProps> = ({ isOpen, onClose, profile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadHistory = async () => {
    try {
      const res = await api.getTutorHistory();
      if (res && res.messages) {
        setMessages(res.messages);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    setInputText('');
    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.chatWithTutor(text);
      if (res && res.response) {
        const assistantMsg: ChatMessage = { role: 'assistant', content: res.response };
        setMessages(prev => [...prev, assistantMsg]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: `I encountered an issue retrieving your career context. (${err.message || 'Please retry'})`
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear conversation history with your career tutor?')) return;
    try {
      await api.clearTutorHistory();
      setMessages([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  if (!isOpen) return null;

  const userName = profile?.full_name ? profile.full_name.split(' ')[0] : 'there';

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] bg-[#FFFFFF] border-l border-[#DEDED5] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Drawer Header */}
      <div className="p-4 sm:p-5 border-b border-[#DEDED5] bg-[#F8F7F2] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#17191C] flex items-center justify-center text-[#C5F36A] shadow-xs relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-extrabold text-[#17191C]">CareerBot AI Tutor</h3>
              <span className="px-1.5 py-0.2 rounded-full bg-[#C5F36A] text-[#17191C] text-[9px] font-extrabold uppercase">
                Gemini
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 font-medium">Personalized to {profile?.full_name || 'your profile'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={handleClearHistory}
            className="p-2 text-neutral-400 hover:text-red-500 hover:bg-[#EFEEE7] rounded-xl transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-[#EFEEE7] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#F8F7F2]/50">
        {/* Welcome Greeting Bubble */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#DEDED5] shadow-xs text-xs space-y-2">
          <div className="flex items-center space-x-2 font-bold text-[#17191C]">
            <Sparkles className="w-4 h-4 text-[#17191C]" />
            <span>Hello {userName}! I'm your dedicated Career Tutor.</span>
          </div>
          <p className="text-neutral-600 leading-relaxed">
            I continuously monitor your target career as a <strong className="text-[#17191C]">{profile?.target_career || 'Learner'}</strong>, your verified skills, roadmap progress, and assessment attempts. How can I guide you today?
          </p>
        </div>

        {/* Suggested Prompts */}
        {messages.length === 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              Suggested Questions:
            </span>
            <div className="flex flex-col gap-1.5">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#DEDED5] hover:border-[#17191C] hover:bg-[#F8F7F2] text-xs text-left font-medium text-[#17191C] transition-all flex items-center justify-between group"
                >
                  <span>{prompt}</span>
                  <Sparkles className="w-3 h-3 text-neutral-400 group-hover:text-[#17191C]" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message History */}
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser ? 'bg-[#17191C] text-[#C5F36A]' : 'bg-[#EFEEE7] text-[#17191C]'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-[#17191C] text-white rounded-tr-xs'
                    : 'bg-[#FFFFFF] text-[#17191C] border border-[#DEDED5] shadow-xs rounded-tl-xs'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-neutral-500 font-medium">
            <div className="w-6 h-6 rounded-lg bg-[#EFEEE7] flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 animate-bounce text-[#17191C]" />
            </div>
            <span>Career Tutor is synthesizing your profile...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested chips above input */}
      {messages.length > 0 && (
        <div className="px-4 py-2 border-t border-[#DEDED5] bg-white flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => handleSendMessage('What should I learn next?')}
            className="px-2.5 py-1 rounded-full bg-[#EFEEE7] text-[10px] font-bold text-neutral-700 hover:bg-[#DEDED5] shrink-0"
          >
            What next?
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage('What is my current learning status?')}
            className="px-2.5 py-1 rounded-full bg-[#EFEEE7] text-[10px] font-bold text-neutral-700 hover:bg-[#DEDED5] shrink-0"
          >
            Current Status
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage('How can I improve my resume?')}
            className="px-2.5 py-1 rounded-full bg-[#EFEEE7] text-[10px] font-bold text-neutral-700 hover:bg-[#DEDED5] shrink-0"
          >
            Resume Tips
          </button>
        </div>
      )}

      {/* Chat Input */}
      <div className="p-4 border-t border-[#DEDED5] bg-[#FFFFFF]">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask your career tutor anything..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#DEDED5] text-xs sm:text-sm text-[#17191C] placeholder:text-neutral-400 focus:outline-none focus:border-[#17191C]"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-2.5 rounded-xl font-bold bg-[#C5F36A] text-[#17191C] hover:bg-[#b8e858] disabled:opacity-40 transition-all shrink-0 shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
