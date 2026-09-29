import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  // Split by fenced code blocks ```lang ... ```
  const parts = content.split(/(```[\s\S]*?```)/g);

  const renderInline = (text: string) => {
    // Handle inline code `...` and bold **...**
    const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return tokens.map((token, idx) => {
      if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
        return (
          <code
            key={idx}
            className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-sky-300"
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
        return (
          <strong key={idx} className="font-semibold text-slate-900 dark:text-white">
            {token.slice(2, -2)}
          </strong>
        );
      }
      return <React.Fragment key={idx}>{token}</React.Fragment>;
    });
  };

  return (
    <div className="space-y-3 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
      {parts.map((part, partIndex) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n');
          const firstLine = lines[0]?.trim() || '';
          const hasLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
          const lang = hasLang ? firstLine : 'code';
          const codeContent = hasLang ? lines.slice(1).join('\n') : lines.join('\n');

          return (
            <div
              key={partIndex}
              className="my-4 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100"
            >
              <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800 text-xs text-slate-400">
                <span className="font-mono lowercase">{lang}</span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(codeContent, partIndex)}
                  className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedIndex === partIndex ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed font-mono text-slate-100">
                <code>{codeContent}</code>
              </pre>
            </div>
          );
        }

        const paragraphs = part.split('\n\n').filter((p) => p.trim().length > 0);
        return (
          <React.Fragment key={partIndex}>
            {paragraphs.map((block, bIdx) => {
              const trimmed = block.trim();
              if (trimmed.startsWith('### ')) {
                return (
                  <h4
                    key={bIdx}
                    className="text-base font-semibold text-slate-900 dark:text-slate-100 pt-2"
                  >
                    {renderInline(trimmed.replace(/^###\s+/, ''))}
                  </h4>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h3
                    key={bIdx}
                    className="text-lg font-semibold text-slate-900 dark:text-slate-100 pt-3"
                  >
                    {renderInline(trimmed.replace(/^##\s+/, ''))}
                  </h3>
                );
              }
              if (trimmed.startsWith('# ')) {
                return (
                  <h2
                    key={bIdx}
                    className="text-xl font-semibold text-slate-900 dark:text-slate-100 pt-3"
                  >
                    {renderInline(trimmed.replace(/^#\s+/, ''))}
                  </h2>
                );
              }

              // Check if block is a bullet list
              const lines = trimmed.split('\n');
              const isBulletList = lines.every((l) => /^(\*|-|•)\s+/.test(l.trim()));
              if (isBulletList) {
                return (
                  <ul key={bIdx} className="space-y-1.5 pl-5 list-disc marker:text-sky-600">
                    {lines.map((line, lIdx) => (
                      <li key={lIdx} className="pl-1">
                        {renderInline(line.trim().replace(/^(\*|-|•)\s+/, ''))}
                      </li>
                    ))}
                  </ul>
                );
              }

              const isNumberedList = lines.every((l) => /^\d+\.\s+/.test(l.trim()));
              if (isNumberedList) {
                return (
                  <ol key={bIdx} className="space-y-1.5 pl-5 list-decimal marker:text-sky-600 marker:font-mono">
                    {lines.map((line, lIdx) => (
                      <li key={lIdx} className="pl-1">
                        {renderInline(line.trim().replace(/^\d+\.\s+/, ''))}
                      </li>
                    ))}
                  </ol>
                );
              }

              return (
                <p key={bIdx} className="leading-relaxed">
                  {lines.map((line, lIdx) => (
                    <React.Fragment key={lIdx}>
                      {renderInline(line)}
                      {lIdx < lines.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </p>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
};
