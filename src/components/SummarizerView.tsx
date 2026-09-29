import React, { useState } from 'react';
import {
  FileText,
  AlignLeft,
  Copy,
  Check,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import type {
  LearningLevel,
  ProgressState,
  SummaryResult,
} from '../types/edugenie';

interface SummarizerViewProps {
  level: LearningLevel;
  language: string;
  onProgressUpdate: (progress: ProgressState) => void;
}

const SAMPLE_NOTES = [
  {
    label: 'Operating Systems: Virtual Memory & Paging',
    content: `Virtual memory is a memory management technique of an operating system that provides an idealized abstraction of the storage resources that are actually available on a given machine, which creates the illusion to users of a very large (main) memory. The computer's hardware Memory Management Unit (MMU) translates virtual addresses into physical addresses in RAM via page tables.
Paging divides virtual memory into fixed-size blocks called Pages (typically 4 KB) and physical RAM into blocks of the same size called Page Frames. When a running process references a page that is not currently mapped in physical RAM, the CPU triggers a Page Fault trap. The operating system's page fault handler locates the needed page on secondary storage (disk/SSD), loads it into an available page frame, updates the page table entry, and restarts the interrupted instruction.
If no free page frames exist, the OS executes a Page Replacement Algorithm such as Least Recently Used (LRU), FIFO, or the Clock algorithm to evict a victim page. When a system spends more time paging data back and forth between RAM and disk than executing actual instructions, the phenomenon is known as Thrashing, which severely degrades CPU utilization and throughput.`,
  },
  {
    label: 'Financial Accounting: Accrual vs Cash Basis',
    content: `In financial accounting, the distinction between Accrual Basis Accounting and Cash Basis Accounting determines when revenues and expenses are formally recognized on the income statement. Under the Cash Basis of accounting, revenues are recorded only when cash is physically received from customers, and expenses are recorded only when cash is paid out to suppliers or employees. While simple to maintain for micro-businesses, cash basis accounting can distort a company's true financial performance over a specific reporting period.
Under Accrual Basis Accounting—which is mandated by Generally Accepted Accounting Principles (GAAP) and International Financial Reporting Standards (IFRS)—transactions are recorded in the period in which the economic event occurs, regardless of when cash changes hands. This relies on two foundational principles: the Revenue Recognition Principle (record revenue when performance obligations are satisfied) and the Matching Principle (match expenses incurred directly against the revenues they helped generate in the same period). Adjusting journal entries for accrued revenues, accrued expenses, deferred (unearned) revenues, and prepaid expenses ensure the Balance Sheet and Income Statement accurately reflect economic reality.`,
  },
];

export const SummarizerView: React.FC<SummarizerViewProps> = ({
  level,
  language,
  onProgressUpdate,
}) => {
  const [text, setText] = useState(SAMPLE_NOTES[0].content);
  const [loadingMode, setLoadingMode] = useState<'short' | 'detailed' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [result, setResult] = useState<SummaryResult>({
    mode: 'short',
    summary:
      'Virtual memory abstracts physical RAM to give processes the illusion of a large, contiguous memory space using hardware Translation Lookaside Buffers and Memory Management Units (MMUs). Through paging, virtual memory is split into fixed-size pages mapped to physical page frames; missing pages trigger page faults handled by OS page replacement algorithms like LRU, while excessive swapping leads to thrashing.',
    keyPoints: [
      'The Memory Management Unit (MMU) translates virtual addresses to physical RAM addresses using page tables.',
      'Paging divides virtual address space into fixed-size Pages and physical memory into matching Page Frames.',
      'A Page Fault occurs when a requested page is absent from RAM, prompting the OS to fetch it from disk.',
      'Page Replacement Algorithms (LRU, FIFO, Clock) select which frame to evict when physical RAM is full.',
      'Thrashing occurs when excessive paging overhead collapses CPU execution throughput.',
    ],
    importantTerms: [
      {
        term: 'Memory Management Unit (MMU)',
        definition:
          'Hardware component responsible for translating virtual memory addresses into physical RAM addresses.',
      },
      {
        term: 'Page Fault',
        definition:
          'Hardware trap raised when a running program accesses a memory page mapped in virtual space but not loaded in physical RAM.',
      },
      {
        term: 'Least Recently Used (LRU)',
        definition:
          'Page replacement policy that evicts the memory page that has not been accessed for the longest duration.',
      },
      {
        term: 'Thrashing',
        definition:
          'Pathological state where the system spends more time swapping pages between disk and RAM than executing user processes.',
      },
    ],
    wordCountOriginal: 175,
    wordCountSummary: 58,
    timestamp: 'Ready',
  });

  const handleSummarize = async (mode: 'short' | 'detailed') => {
    if (!text.trim() || loadingMode) return;
    setError(null);
    setLoadingMode(mode);

    try {
      const response = await fetch('/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          mode,
          level,
          language,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.message || 'Failed to summarize study material.');
      }

      setResult({
        mode: data.mode,
        summary: data.summary,
        keyPoints: data.keyPoints || [],
        importantTerms: data.importantTerms || [],
        wordCountOriginal: data.wordCountOriginal || 0,
        wordCountSummary: data.wordCountSummary || 0,
        timestamp: data.timestamp || 'Just now',
      });

      if (data.progress) {
        onProgressUpdate(data.progress);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error communicating with /summarize endpoint.'
      );
    } finally {
      setLoadingMode(null);
    }
  };

  const handleCopySummary = () => {
    const content = `Summary (${result.mode}):\n${result.summary}\n\nKey Points:\n${result.keyPoints.map((k) => `- ${k}`).join('\n')}\n\nImportant Terms:\n${result.importantTerms.map((t) => `${t.term}: ${t.definition}`).join('\n')}`;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const currentWordCount = text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <div className="space-y-8 pb-10">
      {/* Input Textarea Card */}
      <section className="p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
              Study Notes & Document Summarizer
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Paste lecture notes, textbook excerpts, or research papers to extract summaries, key points, and glossary terms
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {SAMPLE_NOTES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setText(sample.content)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors cursor-pointer whitespace-nowrap"
              >
                Sample {idx + 1}: {sample.label.split(':')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <textarea
            rows={7}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your study material here..."
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm leading-relaxed text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-mono tabular-nums">
              Input length: {currentWordCount} words · {text.length} characters
            </span>
            {text.length > 0 && (
              <button
                type="button"
                onClick={() => setText('')}
                className="flex items-center gap-1 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear text</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => handleSummarize('short')}
            disabled={Boolean(loadingMode) || text.trim().length < 20}
            className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
          >
            <FileText className="w-4 h-4" />
            <span>
              {loadingMode === 'short' ? 'Generating Short Summary...' : 'Short Summary'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSummarize('detailed')}
            disabled={Boolean(loadingMode) || text.trim().length < 20}
            className="px-5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 text-slate-800 dark:text-slate-100 text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
          >
            <AlignLeft className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>
              {loadingMode === 'detailed'
                ? 'Generating Detailed Summary...'
                : 'Detailed Summary'}
            </span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 flex items-center gap-3 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>✕ {error}</span>
          </div>
        )}
      </section>

      {/* Output Card: Summary, Key Points, Important Terms */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden divide-y divide-slate-200 dark:divide-slate-800">
        {/* Summary Section */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="capitalize">{result.mode} Summary</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  Compressed {result.wordCountOriginal} words → {result.wordCountSummary} words
                </span>
              </div>
              <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white mt-1">
                Summary
              </h2>
            </div>

            <button
              type="button"
              onClick={handleCopySummary}
              className="self-start px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Summary Notes</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
            {result.summary}
          </p>
        </div>

        {/* Key Points Section */}
        <div className="p-6 sm:p-8 space-y-4">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
            Key Points
          </h2>
          <ul className="space-y-2.5">
            {result.keyPoints.map((point, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300"
              >
                <span className="font-mono tabular-nums text-xs font-semibold text-sky-600 dark:text-sky-400 mt-1 shrink-0">
                  0{idx + 1}.
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Important Terms Section */}
        <div className="p-6 sm:p-8 space-y-4 bg-slate-50/50 dark:bg-slate-900/40">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
            Important Terms
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.importantTerms.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1"
              >
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {item.term}
                </div>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.definition}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
