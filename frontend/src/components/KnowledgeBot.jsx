import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, RefreshCw, CornerDownRight, BookOpen, MessageSquare } from 'lucide-react';
import { sendChatMessage } from '../api/client';

const QUICK_QUESTIONS = [
  'What is the minimum curing period for OPC concrete according to ACI 308?',
  'What are OSHA 1926 guardrail height and force criteria?',
  'How to diagnose a 45-degree diagonal crack in a reinforced beam?',
  'What are the standard slump and water-cement ratios for M25 concrete?'
];

export default function KnowledgeBot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your AI Construction Intelligence Assistant. I am specialized in structural concrete (ACI 318), occupational site safety (OSHA 1926), building codes (IBC), and CPM scheduling. How can I assist you with field engineering or technical specifications today?',
      citations: ['ACI 318-19 Building Code', 'OSHA 29 CFR 1926 Standards', 'International Building Code 2024'],
      suggested_followups: [
        'What is the minimum curing period for OPC concrete according to ACI 308?',
        'What are OSHA 1926 guardrail height and force criteria?',
        'How to diagnose a 45-degree diagonal crack in a reinforced beam?'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { role: 'user', content: query };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await sendChatMessage(query, historyPayload);
      setMessages([...updatedHistory, {
        role: 'assistant',
        content: res.response,
        citations: res.citations || [],
        suggested_followups: res.suggested_followups || []
      }]);
    } catch (err) {
      setMessages([...updatedHistory, {
        role: 'assistant',
        content: `Error: ${err.message || 'Failed to retrieve response from assistant.'}`,
        citations: [],
        suggested_followups: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto text-slate-200">
      {/* Quick Prompts Bar */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[11px] text-slate-400 font-medium mr-1 flex items-center space-x-1.5 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Technical Inquiries:</span>
        </span>
        {QUICK_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(q)}
            disabled={loading}
            className="text-[11px] px-3 py-1 rounded-full bg-[#090f1f] hover:bg-[#131d36] border border-[#1e2f54] hover:border-amber-400/50 text-slate-300 hover:text-white transition duration-150 cursor-pointer truncate max-w-xs shadow-sm disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Main Chat Panel */}
      <div className="tactical-card flex flex-col h-[560px] overflow-hidden shadow-2xl">
        {/* Chat Header Bar */}
        <div className="px-4 py-2.5 bg-[#090f1f] border-b border-[#1c2d4f] flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="font-semibold text-slate-100 font-mono tracking-wider uppercase text-[11px]">
              Civil &amp; Structural Intelligence Assistant
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Grounding: ACI 318 &bull; OSHA 1926 &bull; IBC 2024
          </span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/35 text-amber-400 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] rounded-xl p-4 space-y-2.5 text-xs leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-[#142242] border border-amber-500/40 text-slate-100 self-end shadow-amber-500/5'
                  : 'bg-[#090f1f] border border-[#1e2f54] text-slate-200'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2.5 border-t border-[#1a2947] space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block font-bold flex items-center space-x-1">
                      <BookOpen className="w-3 h-3 text-amber-400" />
                      <span>Code &amp; Specification References:</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.citations.map((cite, cIdx) => (
                        <span key={cIdx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101b33] text-amber-300 border border-[#21345d]">
                          {cite}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {msg.suggested_followups && msg.suggested_followups.length > 0 && (
                  <div className="pt-2.5 border-t border-[#1a2947] space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block font-bold flex items-center space-x-1">
                      <MessageSquare className="w-3 h-3 text-cyan-400" />
                      <span>Suggested Follow-Up Inquiries:</span>
                    </span>
                    <div className="space-y-1">
                      {msg.suggested_followups.map((f, fIdx) => (
                        <button
                          key={fIdx}
                          type="button"
                          onClick={() => handleSend(f)}
                          className="text-left text-[11px] text-slate-300 hover:text-amber-300 flex items-center space-x-2 transition duration-150 cursor-pointer group py-0.5"
                        >
                          <CornerDownRight className="w-3 h-3 text-slate-500 group-hover:text-amber-400 shrink-0" />
                          <span className="group-hover:underline underline-offset-2">{f}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-[#14203b] border border-[#22355b] text-slate-200 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <User className="w-4 h-4 text-slate-200" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-3 text-xs text-slate-400 pl-11 py-2">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              <span className="font-mono text-[11px]">Consulting civil &amp; OSHA knowledge base...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-[#1c2d4f] bg-[#070c18]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about building codes, concrete hydration, rebar lap lengths, OSHA rules..."
              className="flex-1 px-4 py-2 rounded-lg bg-[#090f1f] border border-[#1e2f54] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition duration-150"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-semibold shadow-sm transition duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
