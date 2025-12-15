import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { agentService } from '../services/geminiService';
import { Chat } from "@google/genai";

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

const CopilotChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm your Copilot assistant. How can I help you with your project today?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session on mount
    chatRef.current = agentService.createChat();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      if (!chatRef.current) {
        chatRef.current = agentService.createChat();
      }

      const response = await chatRef.current.sendMessage({ message: userMsg.text });
      const responseText = response.text || "I couldn't generate a response.";

      const botMsg: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error: any) {
      const errorMsg: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'model',
        text: `Error: ${error.message || 'Something went wrong.'}`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#010409] relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-slate-800 bg-[#0d1117]">
            <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400 border border-blue-500/30">
                <Sparkles size={20} />
            </div>
            <div>
                <h1 className="text-xl font-bold text-white">Copilot Chat</h1>
                <p className="text-sm text-slate-400">Ask questions about your code, architecture, or workflow.</p>
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                        ${msg.role === 'user' ? 'bg-slate-700 text-slate-200' : 'bg-purple-900/30 text-purple-400 border border-purple-500/30'}
                    `}>
                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    
                    <div className={`
                        max-w-[80%] rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap
                        ${msg.role === 'user' 
                            ? 'bg-[#1f6feb]/20 text-slate-200 border border-blue-500/20' 
                            : 'bg-[#161b22] text-slate-300 border border-slate-700'}
                    `}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-purple-900/30 flex items-center justify-center text-purple-400 border border-purple-500/30">
                        <Loader2 size={16} className="animate-spin" />
                    </div>
                    <div className="bg-[#161b22] text-slate-400 border border-slate-700 rounded-lg p-4 text-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                </div>
            )}
            <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#0d1117] border-t border-slate-800">
            <div className="max-w-4xl mx-auto relative">
                <div className="relative bg-[#161b22] rounded-xl border border-slate-700 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all overflow-hidden">
                    <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Ask Copilot..."
                        className="w-full bg-transparent border-none p-4 pr-12 text-slate-200 focus:outline-none resize-none min-h-[60px] max-h-[200px]"
                        rows={1}
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 bottom-2 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </div>
                <div className="text-center mt-2 text-xs text-slate-500">
                    AI generated content may be inaccurate.
                </div>
            </div>
        </div>
    </div>
  );
};

export default CopilotChat;