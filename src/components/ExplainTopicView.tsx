import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import type {
  LearningLevel,
  ModuleId,
  ProgressState,
  TopicExplanation,
} from '../types/edugenie';

interface ExplainTopicViewProps {
  initialTopic?: string;
  level: LearningLevel;
  language: string;
  onProgressUpdate: (progress: ProgressState) => void;
  onNavigate: (module: ModuleId, prefillTopic?: string) => void;
}

const EXAMPLE_TOPICS = [
  'Photosynthesis',
  'Binary Search Trees',
  'Object-Oriented Programming in Python',
  'Double-Entry Bookkeeping',
  'Newton’s Laws of Motion',
  'Transformer Attention Mechanism',
];

export const ExplainTopicView: React.FC<ExplainTopicViewProps> = ({
  initialTopic,
  level,
  language,
  onProgressUpdate,
  onNavigate,
}) => {
  const [topicInput, setTopicInput] = useState(initialTopic || 'Photosynthesis');
  const [engineMode, setEngineMode] = useState<'lamini-flan-t5' | 'gemini-structured'>(
    'lamini-flan-t5'
  );
  const [loading, setLoading] = useState(false);
  const [simplifying, setSimplifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const lastAutoTopicRef = useRef<string | null>(null);

  const [explanation, setExplanation] = useState<TopicExplanation>({
    topic: 'Photosynthesis',
    level: 'Intermediate',
    simplified: false,
    engineUsed: 'Hybrid LaMini-Flan-T5 + Gemini Pedagogical Engine',
    definition:
      'Photosynthesis is the biochemical process by which photoautotrophs (primarily green plants, algae, and cyanobacteria) capture light energy from the sun and convert carbon dioxide (CO₂) and water (H₂O) into glucose (C₆H₁₂O₆) and oxygen (O₂).',
    simpleExplanation:
      'Think of a plant leaf as a solar-powered kitchen. Chlorophyll inside the chloroplasts acts like solar panels capturing sunlight. The plant draws water from its roots and carbon dioxide from the air through tiny pores called stomata, then uses solar energy to cook those raw ingredients into energy-rich sugar (glucose) while releasing fresh oxygen back into the atmosphere.',
    keyPoints: [
      'Balanced chemical equation: 6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂.',
      'Occurs inside specialized cellular organelles called chloroplasts, rich in the green pigment chlorophyll.',
      'Stage 1 — Light-Dependent Reactions (in the thylakoid membranes): Sunlight splits water molecules (photolysis), releasing O₂ and generating ATP and NADPH.',
      'Stage 2 — Calvin Cycle / Light-Independent Reactions (in the stroma): Uses ATP and NADPH to fix atmospheric CO₂ into three-carbon sugars that form glucose.',
      'Rate of photosynthesis is governed by three primary limiting factors: light intensity, carbon dioxide concentration, and temperature.',
    ],
    example:
      'When an aquatic plant such as Elodea (pondweed) is placed in water under a bright lamp, tiny bubbles of pure oxygen gas visibly stream from its leaves. Moving the lamp closer increases bubble production until light saturation is reached.',
    realWorldApplication:
      'Photosynthesis forms the primary energy foundation of almost every food web on Earth, regulates atmospheric carbon dioxide levels to mitigate greenhouse warming, and inspires artificial photosynthesis research for clean solar hydrogen fuel.',
    quickRevision: [
      'Site of Light Reactions: Thylakoid membranes (produces ATP, NADPH, and O₂).',
      'Site of Calvin Cycle: Chloroplast stroma (fixes CO₂ into glucose using Rubisco enzyme).',
      'Source of released Oxygen: Comes from the splitting of Water (H₂O), not Carbon Dioxide.',
      'End Products: Glucose (stored as starch or used in cellular respiration) and Oxygen gas.',
    ],
    timestamp: 'Ready for study',
  });

  const handleExplain = async (targetTopic: string, simplifyFlag: boolean) => {
    const clean = targetTopic.trim();
    if (!clean) return;

    setError(null);
    if (simplifyFlag) {
      setSimplifying(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch('/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: clean,
          simplify: simplifyFlag,
          level,
          language,
          engineMode,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.message || 'Could not generate topic explanation.');
      }

      setExplanation(data.explanation);
      if (data.progress) {
        onProgressUpdate(data.progress);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error communicating with /explain endpoint.'
      );
    } finally {
      setLoading(false);
      setSimplifying(false);
    }
  };

  useEffect(() => {
    if (initialTopic && initialTopic !== lastAutoTopicRef.current) {
      lastAutoTopicRef.current = initialTopic;
      setTopicInput(initialTopic);
      handleExplain(initialTopic, false);
    }
  }, [initialTopic]);

  const handleCopyAll = () => {
    const formatted = `${explanation.topic}\n\nDefinition:\n${explanation.definition}\n\nSimple Explanation:\n${explanation.simpleExplanation}\n\nKey Points:\n${explanation.keyPoints.map((p) => `- ${p}`).join('\n')}\n\nExample:\n${explanation.example}\n\nReal-world Application:\n${explanation.realWorldApplication}\n\nQuick Revision:\n${explanation.quickRevision.map((r) => `- ${r}`).join('\n')}`;
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Input & Controls Card */}
      <section className="p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
              What do you want to understand?
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter any concept, theorem, algorithm, or historical event for a structured 6-part breakdown
            </p>
          </div>

          {/* Engine Mode Selector (Preserving LaMini-Flan-T5 + Gemini functionality) */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 self-start">
            <button
              type="button"
              onClick={() => setEngineMode('lamini-flan-t5')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                engineMode === 'lamini-flan-t5'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              LaMini-Flan-T5 + Gemini
            </button>
            <button
              type="button"
              onClick={() => setEngineMode('gemini-structured')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                engineMode === 'gemini-structured'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Deep Academic Mode
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleExplain(topicInput, false);
            }}
            placeholder="Example: Photosynthesis, Dynamic Programming, Keynesian Economics..."
            className="flex-1 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleExplain(topicInput, false)}
              disabled={loading || simplifying || !topicInput.trim()}
              className="px-5 py-3 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <BookOpen className="w-4 h-4" />
              <span>{loading ? 'Explaining...' : 'Explain Topic'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleExplain(topicInput, true)}
              disabled={loading || simplifying || !topicInput.trim()}
              className="px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 text-slate-700 dark:text-slate-200 text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>{simplifying ? 'Simplifying...' : 'Simplify More'}</span>
            </button>
          </div>
        </div>

        {/* Quick Topic Suggestions */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-400 dark:text-slate-500">Popular topics:</span>
          {EXAMPLE_TOPICS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setTopicInput(item);
                handleExplain(item, false);
              }}
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 underline underline-offset-4 cursor-pointer"
            >
              {item}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 flex items-center gap-3 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>✕ {error}</span>
          </div>
        )}
      </section>

      {/* Educational Concept Breakdown Card */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        {/* Header Bar */}
        <div className="p-6 sm:p-8 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{explanation.engineUsed}</span>
              <span aria-hidden="true">·</span>
              <span>Level: {explanation.level}</span>
              <span aria-hidden="true">·</span>
              <span>{explanation.simplified ? '✓ Simplified Intuition Mode' : 'Standard Academic Mode'}</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
              {explanation.topic}
            </h2>
          </div>

          <div className="flex items-center gap-2.5 self-start">
            <button
              type="button"
              onClick={handleCopyAll}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied Notes</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Study Card</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onNavigate('quiz', explanation.topic)}
              className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Quiz Me on This Topic</span>
            </button>
          </div>
        </div>

        {/* 6 Structured Pedagogical Sections separated by hairline dividers */}
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {/* 1. Definition & 2. Simple Explanation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
            <div className="p-6 sm:p-8 space-y-2.5">
              <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
                01 · Definition
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Formal Academic Definition
              </h3>
              <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                {explanation.definition}
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-2.5 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                02 · Simple Explanation
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Intuitive Mental Model
              </h3>
              <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                {explanation.simpleExplanation}
              </p>
            </div>
          </div>

          {/* 3. Key Points */}
          <div className="p-6 sm:p-8 space-y-4">
            <div>
              <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
                03 · Key Points
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mt-1">
                Core Principles & Mechanisms
              </h3>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {explanation.keyPoints.map((point, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300"
                >
                  <span className="font-mono tabular-nums text-xs font-semibold text-sky-600 dark:text-sky-400 mt-1 shrink-0">
                    0{index + 1}.
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Example & 5. Real-world Application */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
            <div className="p-6 sm:p-8 space-y-2.5">
              <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
                04 · Example
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Concrete Worked Scenario
              </h3>
              <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {explanation.example}
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-2.5">
              <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
                05 · Real-world Application
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Practical & Industry Relevance
              </h3>
              <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                {explanation.realWorldApplication}
              </p>
            </div>
          </div>

          {/* 6. Quick Revision */}
          <div className="p-6 sm:p-8 bg-slate-50/70 dark:bg-slate-800/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                  06 · Quick Revision
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mt-1">
                  Exam & Flashcard Takeaways
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {explanation.quickRevision.map((rev, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-200 flex items-start gap-2.5"
                >
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono text-xs mt-0.5 shrink-0">
                    ✓
                  </span>
                  <span>{rev}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
