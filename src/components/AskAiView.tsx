import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  ArrowUpRight,
  AlertCircle,
} from 'lucide-react';
import type { ChatMessage, LearningLevel, ProgressState } from '../types/edugenie';
import { MarkdownRenderer } from './MarkdownRenderer';

interface AskAiViewProps {
  initialPrompt?: string;
  level: LearningLevel;
  language: string;
  onProgressUpdate: (progress: ProgressState) => void;
}

const STARTER_QUESTIONS = [
  'Explain how recursion works in Python with a factorial and Fibonacci code example',
  'What is the difference between B-Trees and Binary Search Trees in databases?',
  'Walk me through Double-Entry Bookkeeping with a real balance sheet example',
  'How does cellular photosynthesis convert light energy into chemical ATP?',
];

export const AskAiView: React.FC<AskAiViewProps> = ({
  initialPrompt,
  level,
  language,
  onProgressUpdate,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Hello! I'm **EduGenie**, your personal AI learning assistant. Ask me any academic, programming, science, or commerce question.\n\nI adapt explanations to your **${level}** level and format programming answers with clean code blocks and step-by-step reasoning.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      followUpQuestions: STARTER_QUESTIONS.slice(0, 3),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const hasAutoSentRef = useRef<string | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendQuestion = async (questionText: string, isRegenerate = false) => {
    const trimmed = questionText.trim();
    if (!trimmed || loading) return;

    setError(null);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let updatedHistory = messages;
    if (!isRegenerate) {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: nowTime,
      };
      updatedHistory = [...messages, userMsg];
      setMessages(updatedHistory);
      setInput('');
    }

    setLoading(true);
    try {
      const response = await fetch('/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          history: updatedHistory.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          level,
          language,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.message || 'Failed to get an answer from EduGenie.');
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        followUpQuestions: data.followUpQuestions || [],
      };

      setMessages((prev) => [...prev, aiMsg]);
      if (data.progress) {
        onProgressUpdate(data.progress);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Network error connecting to /qa endpoint.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPrompt && hasAutoSentRef.current !== initialPrompt) {
      hasAutoSentRef.current = initialPrompt;
      sendQuestion(initialPrompt);
    }
  }, [initialPrompt]);

  const handleCopyMessage = (msg: ChatMessage) => {
    navigator.clipboard.writeText(msg.content);
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleRegenerateLast = () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMessage || loading) return;
    // Remove the last assistant response if the last message was from assistant
    if (messages[messages.length - 1]?.role === 'assistant' && messages.length > 1) {
      setMessages((prev) => prev.slice(0, -1));
    }
    sendQuestion(lastUserMessage.content, true);
  };

  const handleClearConversation = () => {
    setError(null);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content:
          'Conversation cleared. What topic or question would you like to explore next?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        followUpQuestions: STARTER_QUESTIONS.slice(0, 3),
      },
    ]);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuestion(input);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] min-h-[560px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Chat Top Action Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Ask EduGenie AI
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Connected to /qa endpoint</span>
            <span aria-hidden="true">·</span>
            <span>Level: {level}</span>
            <span aria-hidden="true">·</span>
            <span>Language: {language}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRegenerateLast}
            disabled={loading || !messages.some((m) => m.role === 'user')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Regenerate</span>
          </button>
          <button
            type="button"
            onClick={handleClearConversation}
            disabled={loading || messages.length <= 1}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer whitespace-nowrap"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Messages Viewport */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-400 dark:text-slate-500">
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  {isUser ? 'You' : 'EduGenie'}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-3xl rounded-xl p-5 ${
                  isUser
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100'
                }`}
              >
                {isUser ? (
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <MarkdownRenderer content={msg.content} />
                )}

                {!isUser && (
                  <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg)}
                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              Copied response
                            </span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy response</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Follow-up Question Prompts */}
              {!isUser && msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                <div className="mt-3 max-w-3xl space-y-1.5">
                  <div className="text-xs text-slate-400 dark:text-slate-500">
                    Suggested follow-up questions:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {msg.followUpQuestions.map((followUp, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={loading}
                        onClick={() => sendQuestion(followUp)}
                        className="text-left px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 hover:border-sky-500 dark:hover:border-sky-500 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>{followUp}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex flex-col items-start">
            <div className="text-xs text-slate-400 mb-1.5">EduGenie is thinking...</div>
            <div className="px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="flex space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-600 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-sky-600 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-sky-600 animate-bounce" />
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-300">
                Synthesizing structured explanation & code examples...
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/80 dark:bg-red-950/30 flex items-start gap-3 text-red-700 dark:text-red-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold">✕ Request Could Not Complete</div>
              <p className="text-xs leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Bottom Input Bar */}
      <form
        onSubmit={handleFormSubmit}
        className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900"
      >
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask any academic, coding, or exam question (e.g., How does Dijkstra's algorithm work?)..."
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
