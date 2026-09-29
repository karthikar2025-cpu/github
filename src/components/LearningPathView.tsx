import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  Circle,
  BookOpen,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import type {
  LearningLevel,
  LearningRoadmap,
  ModuleId,
  ProgressState,
} from '../types/edugenie';

interface LearningPathViewProps {
  roadmap: LearningRoadmap;
  onProgressUpdate: (progress: ProgressState) => void;
  onNavigate: (module: ModuleId, prefillTopic?: string) => void;
}

export const LearningPathView: React.FC<LearningPathViewProps> = ({
  roadmap,
  onProgressUpdate,
  onNavigate,
}) => {
  const [subject, setSubject] = useState(roadmap.subject || 'Python Programming');
  const [level, setLevel] = useState<LearningLevel>(roadmap.level || 'Intermediate');
  const [goal, setGoal] = useState(
    roadmap.goal ||
      'Master core Python syntax, data structures, OOP, and write production-ready modular scripts'
  );
  const [studyTime, setStudyTime] = useState(roadmap.studyTime || '45 mins / day');
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || loading) return;

    setError(null);
    setLoading(true);
    try {
      const response = await fetch('/learn/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim(),
          level,
          goal: goal.trim(),
          studyTime: studyTime.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.message || 'Failed to generate personalized learning path.');
      }

      if (data.progress) {
        onProgressUpdate(data.progress);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error communicating with /learn/recommendations endpoint.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStage = async (stageId: string, stageTopic: string) => {
    if (togglingId) return;
    setTogglingId(stageId);
    try {
      const response = await fetch('/progress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityType: 'Roadmap',
          topic: `${roadmap.subject}: ${stageTopic}`,
          durationMinutes: 20,
          toggleStageId: stageId,
        }),
      });
      if (response.ok) {
        const updatedProgress = await response.json();
        onProgressUpdate(updatedProgress);
      }
    } catch (err) {
      console.error('Failed to toggle stage completion:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const completedStages = roadmap.stages.filter((s) => s.completed).length;
  const totalStages = roadmap.stages.length || 1;
  const completionPct = Math.round((completedStages / totalStages) * 100);

  return (
    <div className="space-y-8 pb-10">
      {/* Learning Path Generator Form */}
      <section className="p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-5">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
            Personalized Learning Path Architect
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Connected to /learn/recommendations · Configure your subject, current level, goal, and daily study time
          </p>
        </div>

        <form onSubmit={handleGenerateRoadmap} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 space-y-1.5">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Subject / Topic
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Python Programming, Machine Learning..."
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="md:col-span-4 space-y-1.5">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Current Level
              </label>
              <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      level === lvl
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-4 space-y-1.5">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Available Study Time
              </label>
              <input
                type="text"
                value={studyTime}
                onChange={(e) => setStudyTime(e.target.value)}
                placeholder="e.g., 45 mins / day, 5 hours / week"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
            <div className="flex-1 space-y-1.5">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Learning Goal
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="What do you want to achieve by the end of this roadmap?"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !subject.trim()}
              className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Compass className="w-4 h-4" />
              <span>{loading ? 'Generating Roadmap...' : 'Generate Structured Roadmap'}</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 flex items-center gap-3 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>✕ {error}</span>
          </div>
        )}
      </section>

      {/* Active Roadmap Header & Progress Bar */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Structured Curriculum</span>
                <span aria-hidden="true">·</span>
                <span>Level: {roadmap.level}</span>
                <span aria-hidden="true">·</span>
                <span>Pace: {roadmap.studyTime}</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
                {roadmap.subject}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">{roadmap.goal}</p>
            </div>

            <div className="text-left sm:text-right space-y-1 shrink-0">
              <div className="text-2xl font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                {completionPct}% Complete
              </div>
              <div className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {completedStages} of {totalStages} stages mastered ✓
              </div>
            </div>
          </div>

          <div
            className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"
            role="progressbar"
            aria-valuenow={completionPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        {/* Stages List */}
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {roadmap.stages.map((stage) => {
            const isDone = stage.completed;
            return (
              <div
                key={stage.id}
                className={`p-6 sm:p-8 transition-colors ${
                  isDone ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="space-y-2.5 max-w-3xl">
                    {/* Stage Metadata Row (Unboxed text with middot separators) */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono tabular-nums font-semibold text-sky-600 dark:text-sky-400">
                        Stage {stage.stageNumber}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Difficulty: {stage.difficulty}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        Estimated time: {stage.estimatedTime}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={
                          isDone
                            ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                            : 'text-slate-500'
                        }
                      >
                        {isDone ? 'Completed ✓' : 'In Progress'}
                      </span>
                    </div>

                    {/* Stage Title */}
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="font-mono tabular-nums text-slate-400">
                        {stage.stageNumber}
                      </span>
                      <span>{stage.topic}</span>
                      {isDone && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono text-base">
                          ✓
                        </span>
                      )}
                    </h3>

                    {/* Description */}
                    <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                      {stage.description}
                    </p>

                    {/* Practice Activity */}
                    <div className="pt-1 text-xs text-slate-600 dark:text-slate-400">
                      <strong className="font-semibold text-slate-900 dark:text-slate-200">
                        Practice Activity:{' '}
                      </strong>
                      <span>{stage.practiceActivity}</span>
                    </div>
                  </div>

                  {/* Interactive Stage Actions */}
                  <div className="flex flex-wrap lg:flex-col items-stretch sm:items-end gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={togglingId === stage.id}
                      onClick={() => handleToggleStage(stage.id, stage.topic)}
                      className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                        isDone
                          ? 'border border-emerald-600/40 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                          : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900'
                      }`}
                    >
                      {isDone ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Completed ✓</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4" />
                          <span>Mark Completed</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onNavigate('explain', `${roadmap.subject}: ${stage.topic}`)
                        }
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Explain</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onNavigate('quiz', `${roadmap.subject}: ${stage.topic}`)
                        }
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Quiz</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
