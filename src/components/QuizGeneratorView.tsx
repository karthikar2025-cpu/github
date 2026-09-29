import React, { useState, useEffect, useRef } from 'react';
import {
  HelpCircle,
  RotateCcw,
  PlusCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import type {
  LearningLevel,
  ProgressState,
  QuizData,
} from '../types/edugenie';

interface QuizGeneratorViewProps {
  initialTopic?: string;
  level: LearningLevel;
  language: string;
  onProgressUpdate: (progress: ProgressState) => void;
}

const DEFAULT_QUIZ: QuizData = {
  topic: 'Python Programming Fundamentals',
  difficulty: 'Medium',
  questions: [
    {
      id: 1,
      question: 'What is Python primarily classified as?',
      options: [
        'High-level, interpreted programming language',
        'Low-level kernel operating system',
        'Relational database management engine',
        'Client-side web browser rendering engine',
      ],
      correctAnswerIndex: 0,
      explanation:
        'Python is a high-level, interpreted, general-purpose programming language known for code readability and dynamic typing.',
    },
    {
      id: 2,
      question:
        'Which built-in Python data structure is immutable and ordered, meaning its elements cannot be modified after creation?',
      options: ['List', 'Dictionary', 'Tuple', 'Set'],
      correctAnswerIndex: 2,
      explanation:
        'Tuples () are ordered and immutable collections in Python, whereas Lists [], Dictionaries {}, and Sets set() are mutable.',
    },
    {
      id: 3,
      question:
        'What is the average-case time complexity of looking up a key in a Python dictionary (dict)?',
      options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'],
      correctAnswerIndex: 2,
      explanation:
        'Python dictionaries are implemented as hash tables under the hood, providing O(1) constant average-case time complexity for key lookups.',
    },
    {
      id: 4,
      question:
        'What does the "yield" keyword do inside a Python function?',
      options: [
        'Immediately terminates the Python interpreter process',
        'Turns the function into a generator that pauses state and returns an iterator',
        'Converts all local variables into global constants',
        'Compiles the function into static C++ machine code',
      ],
      correctAnswerIndex: 1,
      explanation:
        'Using yield transforms a function into a lazy generator function, pausing execution and saving local state between iterations.',
    },
    {
      id: 5,
      question:
        'In Python Object-Oriented Programming, what is the role of the __init__ method?',
      options: [
        'It destroys an object when garbage collection runs',
        'It initializes a newly created instance’s attributes when a class is instantiated',
        'It imports external third-party packages from PyPI',
        'It locks a class so no subclasses can inherit from it',
      ],
      correctAnswerIndex: 1,
      explanation:
        '__init__ is Python’s instance initializer method called automatically when a new object of a class is created.',
    },
  ],
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export const QuizGeneratorView: React.FC<QuizGeneratorViewProps> = ({
  initialTopic,
  level,
  language,
  onProgressUpdate,
}) => {
  const [topicInput, setTopicInput] = useState(
    initialTopic || 'Python Programming Fundamentals'
  );
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [quizData, setQuizData] = useState<QuizData>(DEFAULT_QUIZ);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [submittingScore, setSubmittingScore] = useState(false);
  const autoTopicRef = useRef<string | null>(null);

  const handleGenerateQuiz = async (overrideTopic?: string) => {
    const cleanTopic = (overrideTopic ?? topicInput).trim();
    if (!cleanTopic || loading) return;

    setError(null);
    setLoading(true);
    try {
      const response = await fetch('/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: cleanTopic,
          numQuestions,
          difficulty,
          level,
          language,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.message || 'Could not generate quiz.');
      }

      setQuizData(data);
      setSelectedAnswers({});
      setQuizCompleted(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error communicating with /quiz endpoint.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTopic && initialTopic !== autoTopicRef.current) {
      autoTopicRef.current = initialTopic;
      setTopicInput(initialTopic);
      handleGenerateQuiz(initialTopic);
    }
  }, [initialTopic]);

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    // Lock selection once chosen so student immediately sees Correct ✓ or Incorrect ✕ and explanation
    if (selectedAnswers[questionId] !== undefined) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const totalQuestions = quizData.questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount = quizData.questions.reduce((acc, q) => {
    return selectedAnswers[q.id] === q.correctAnswerIndex ? acc + 1 : acc;
  }, 0);
  const incorrectCount = answeredCount - correctCount;
  const percentage =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const handleFinishQuiz = async () => {
    setQuizCompleted(true);
    setSubmittingScore(true);
    try {
      const res = await fetch('/progress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityType: 'Quiz',
          topic: quizData.topic,
          durationMinutes: Math.max(5, totalQuestions * 2),
          quizResult: {
            difficulty: quizData.difficulty,
            score: correctCount,
            total: totalQuestions,
          },
        }),
      });
      if (res.ok) {
        const updatedProgress = await res.json();
        onProgressUpdate(updatedProgress);
      }
    } catch (err) {
      console.error('Failed to record quiz score:', err);
    } finally {
      setSubmittingScore(false);
    }
  };

  const handleTryAgain = () => {
    setSelectedAnswers({});
    setQuizCompleted(false);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Quiz Configuration Panel */}
      <section className="p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
              Interactive Quiz Generator
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter any academic topic or paste study material to generate an interactive multiple-choice assessment
            </p>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            Answered: {answeredCount} / {totalQuestions}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          {/* Topic Input */}
          <div className="lg:col-span-6 space-y-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Topic or Study Material
            </label>
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGenerateQuiz();
              }}
              placeholder="e.g., Python Programming, Data Structures, Financial Accounting..."
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Number of Questions */}
          <div className="lg:col-span-2 space-y-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Questions
            </label>
            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
              {[3, 5, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setNumQuestions(num)}
                  className={`flex-1 py-1.5 text-xs font-mono tabular-nums font-medium rounded-md transition-colors cursor-pointer ${
                    numQuestions === num
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selector */}
          <div className="lg:col-span-2 space-y-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Difficulty
            </label>
            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
              {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    difficulty === diff
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Quiz Button */}
          <div className="lg:col-span-2">
            <button
              type="button"
              onClick={() => handleGenerateQuiz()}
              disabled={loading || !topicInput.trim()}
              className="w-full px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <HelpCircle className="w-4 h-4" />
              <span>{loading ? 'Generating...' : 'Generate Quiz'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 flex items-center gap-3 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>✕ {error}</span>
          </div>
        )}
      </section>

      {/* Quiz Completed Summary Card */}
      {quizCompleted && (
        <section className="p-6 sm:p-8 rounded-xl border-2 border-sky-600 dark:border-sky-500 bg-white dark:bg-slate-900 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div className="space-y-1">
              <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
                Assessment Results · {quizData.difficulty} Difficulty
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
                Quiz Completed!
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Topic: {quizData.topic}
                {submittingScore ? ' · Saving to your Progress Analytics...' : ' · Saved to Progress Analytics ✓'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTryAgain}
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>

              <button
                type="button"
                onClick={() => handleGenerateQuiz()}
                disabled={loading}
                className="px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Generate New Quiz</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">Score</div>
              <div className="mt-1 text-2xl font-semibold font-mono tabular-nums text-slate-900 dark:text-white">
                {correctCount} / {totalQuestions}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">Percentage</div>
              <div className="mt-1 text-2xl font-semibold font-mono tabular-nums text-sky-600 dark:text-sky-400">
                {percentage}%
              </div>
            </div>

            <div className="p-4 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30">
              <div className="text-xs text-emerald-700 dark:text-emerald-300">
                Correct Answers
              </div>
              <div className="mt-1 text-2xl font-semibold font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                ✓ {correctCount}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-red-50/70 dark:bg-red-950/30">
              <div className="text-xs text-red-700 dark:text-red-300">
                Incorrect Answers
              </div>
              <div className="mt-1 text-2xl font-semibold font-mono tabular-nums text-red-700 dark:text-red-400">
                ✕ {incorrectCount}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Questions List */}
      <section className="space-y-5">
        {quizData.questions.map((q, index) => {
          const userChoice = selectedAnswers[q.id];
          const isAnswered = userChoice !== undefined;
          const isCorrect = isAnswered && userChoice === q.correctAnswerIndex;

          return (
            <div
              key={q.id}
              className="p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-5"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                  <span>
                    Question {index + 1} of {totalQuestions}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{quizData.difficulty}</span>
                </div>

                {isAnswered && (
                  <div
                    className={`text-xs font-semibold font-mono ${
                      isCorrect
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {isCorrect ? 'Correct ✓' : 'Incorrect ✕'}
                  </div>
                )}
              </div>

              <h3 className="text-lg font-semibold text-slate-900 dark:text-white leading-snug">
                {q.question}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((optText, optIdx) => {
                  const isSelected = userChoice === optIdx;
                  const isOptionCorrect = q.correctAnswerIndex === optIdx;

                  let buttonStyle =
                    'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-sky-500 dark:hover:border-sky-500 text-slate-800 dark:text-slate-200';

                  if (isAnswered) {
                    if (isOptionCorrect) {
                      buttonStyle =
                        'border-emerald-600 dark:border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200';
                    } else if (isSelected && !isOptionCorrect) {
                      buttonStyle =
                        'border-red-600 dark:border-red-500 bg-red-50/80 dark:bg-red-950/40 text-red-950 dark:text-red-200';
                    } else {
                      buttonStyle =
                        'border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900 opacity-60 text-slate-500 dark:text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`text-left p-4 rounded-lg border transition-colors flex items-start justify-between gap-3 cursor-pointer disabled:cursor-default ${buttonStyle}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="font-mono font-semibold text-sm shrink-0">
                          {OPTION_LABELS[optIdx]}.
                        </span>
                        <span className="text-sm leading-relaxed">{optText}</span>
                      </div>

                      {isAnswered && isOptionCorrect && (
                        <span className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                          ✓
                        </span>
                      )}
                      {isAnswered && isSelected && !isOptionCorrect && (
                        <span className="text-xs font-mono font-semibold text-red-700 dark:text-red-400 shrink-0">
                          ✕
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Instant Educational Explanation */}
              {isAnswered && (
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 space-y-1">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>
                      {isCorrect ? 'Correct ✓' : 'Incorrect ✕'} — Explanation
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Complete Quiz CTA Bar */}
      {!quizCompleted && totalQuestions > 0 && (
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-sm text-slate-600 dark:text-slate-300">
            {answeredCount < totalQuestions ? (
              <span>
                Answer all questions ({answeredCount} of {totalQuestions} completed) to view your final score report.
              </span>
            ) : (
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                ✓ All {totalQuestions} questions answered! Click Complete Quiz to save your score.
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleFinishQuiz}
            disabled={answeredCount === 0}
            className="px-6 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <span>Complete Quiz & Save Score</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
