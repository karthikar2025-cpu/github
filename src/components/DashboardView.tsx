import React, { useState } from 'react';
import {
  MessageSquare,
  BookOpen,
  HelpCircle,
  FileText,
  Compass,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import type {
  ModuleId,
  ProgressState,
  RecommendationItem,
} from '../types/edugenie';
import heroStudyImage from '../assets/images/hero_edugenie_learning_1790662269243.jpg';

interface DashboardViewProps {
  progress: ProgressState;
  onNavigate: (module: ModuleId, prefillTopic?: string) => void;
  onRefreshRecommendations: () => Promise<void>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  progress,
  onNavigate,
  onRefreshRecommendations,
}) => {
  const [imgError, setImgError] = useState(false);
  const [refreshingRecs, setRefreshingRecs] = useState(false);

  const handleRefreshRecs = async () => {
    setRefreshingRecs(true);
    try {
      await onRefreshRecommendations();
    } finally {
      setRefreshingRecs(false);
    }
  };

  const quickActions: Array<{
    id: ModuleId;
    title: string;
    description: string;
    cta: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      id: 'ask-ai',
      title: 'Ask EduGenie',
      description: 'Interactive academic Q&A with code examples and follow-up prompts.',
      cta: 'Open AI Chat',
      icon: MessageSquare,
    },
    {
      id: 'explain',
      title: 'Explain a Topic',
      description: 'Structured 6-part conceptual breakdowns with LaMini-Flan-T5 & Gemini.',
      cta: 'Explain Concept',
      icon: BookOpen,
    },
    {
      id: 'quiz',
      title: 'Generate Quiz',
      description: 'Adaptive multiple-choice assessments with instant answer explanations.',
      cta: 'Start Practice Quiz',
      icon: HelpCircle,
    },
    {
      id: 'summarize',
      title: 'Summarize Notes',
      description: 'Distill lecture transcripts and chapters into key points and terms.',
      cta: 'Summarize Material',
      icon: FileText,
    },
    {
      id: 'learning-path',
      title: 'Learning Path',
      description: 'Personalized 7-stage study roadmaps tailored to your level and schedule.',
      cta: 'View Roadmap',
      icon: Compass,
    },
  ];

  const handleRecommendationClick = (rec: RecommendationItem) => {
    onNavigate(rec.actionModule, rec.targetTopic);
  };

  return (
    <div className="space-y-10 pb-10">
      {/* Greeting & Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Good Morning 👋</span>
              <span aria-hidden="true">·</span>
              <span>Ready to learn something new?</span>
              <span aria-hidden="true">·</span>
              <span>Level: {progress.settings.learningLevel}</span>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white max-w-xl">
              Learn Smarter. Understand Faster.
            </h1>

            <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-300 max-w-xl">
              Your AI-powered learning companion. Master complex coursework through structured explanations, adaptive quizzes, smart note summarization, and personalized study roadmaps.
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('ask-ai')}
              className="px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <span>Ask EduGenie Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('explain', 'Photosynthesis')}
              className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer"
            >
              Explore Topic Explainer
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 min-h-[240px] bg-slate-900 flex flex-col justify-end">
          {!imgError ? (
            <img
              src={heroStudyImage}
              alt="Minimalist architectural study desk with notebook and natural morning light"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent" />
          <div className="relative z-10 p-6 text-white space-y-2">
            <div className="text-xs text-sky-300 font-medium">
              Active Track · {progress.activeRoadmap.subject}
            </div>
            <p className="text-base font-semibold leading-snug">
              {progress.activeRoadmap.goal}
            </p>
            <div className="pt-1 flex items-center justify-between text-xs text-slate-300">
              <span className="font-mono tabular-nums">
                {progress.activeRoadmap.stages.filter((s) => s.completed).length} of{' '}
                {progress.activeRoadmap.stages.length} stages completed
              </span>
              <button
                type="button"
                onClick={() => onNavigate('learning-path')}
                className="text-sky-300 hover:text-white underline underline-offset-4 font-medium cursor-pointer"
              >
                Continue Path →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Statistics */}
      <section aria-label="Learning Statistics">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="text-xs text-slate-500 dark:text-slate-400">Topics Studied</div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-semibold font-mono tabular-nums text-slate-900 dark:text-white">
                {progress.topicsStudiedCount}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                ● Active
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 truncate">
              Latest: {progress.studiedTopicsList[0] || 'Python Programming'}
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="text-xs text-slate-500 dark:text-slate-400">Quiz Attempts</div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-semibold font-mono tabular-nums text-slate-900 dark:text-white">
                {progress.quizAttemptsCount}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                {progress.quizHistory.length} logged
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Adaptive difficulty enabled
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="text-xs text-slate-500 dark:text-slate-400">Average Score</div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-semibold font-mono tabular-nums text-slate-900 dark:text-white">
                {progress.averageQuizScore}%
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                {progress.averageQuizScore >= 80 ? '✓ Strong Mastery' : '▲ Developing'}
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Across all completed quizzes
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="text-xs text-slate-500 dark:text-slate-400">Learning Streak</div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-semibold font-mono tabular-nums text-slate-900 dark:text-white">
                {progress.learningStreakDays} Days
              </span>
              <span className="text-xs text-sky-600 dark:text-sky-400 font-mono tabular-nums">
                {progress.totalStudyMinutes} mins total
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Consistent daily momentum
            </div>
          </div>
        </div>
      </section>

      {/* Quick Action Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
              Core Learning Modules
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Launch any AI study tool directly from your workspace
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {quickActions.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className="group text-left p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-500 dark:hover:border-sky-500 transition-colors flex flex-col justify-between cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/70 flex items-center justify-between text-xs font-medium text-sky-600 dark:text-sky-400">
                  <span>{item.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Two-Column Section: Continue Learning & Recommended for You */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Continue Learning */}
        <div className="lg:col-span-6 p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
                Continue Learning
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pick up right where you left off in your core subjects
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('progress')}
              className="text-xs font-medium text-sky-600 dark:text-sky-400 hover:underline cursor-pointer whitespace-nowrap"
            >
              All Analytics →
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {progress.courses.map((course) => (
              <div key={course.id} className="py-4 first:pt-0 last:pb-0 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{course.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {course.completedModules}/{course.totalModules} modules
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{course.lastStudied}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                      {course.progressPercent}%
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigate('explain', course.title)}
                      className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Study
                    </button>
                  </div>
                </div>

                <div
                  className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"
                  role="progressbar"
                  aria-valuenow={course.progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full bg-sky-600 dark:bg-sky-500 rounded-full transition-all duration-300"
                    style={{ width: `${course.progressPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended for You (AI-generated recommendations) */}
        <div className="lg:col-span-6 p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
                Recommended for You
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                AI-generated study suggestions based on your roadmap and quiz scores
              </p>
            </div>
            <button
              type="button"
              onClick={handleRefreshRecs}
              disabled={refreshingRecs}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshingRecs ? 'animate-spin' : ''}`} />
              <span>{refreshingRecs ? 'Updating...' : 'Refresh AI Picks'}</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {progress.recommendations.map((rec, index) => (
              <div
                key={rec.id}
                className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono tabular-nums">0{index + 1}.</span>
                    <span>{rec.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{rec.difficulty}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{rec.estimatedMinutes} mins</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {rec.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {rec.reason}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleRecommendationClick(rec)}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-sky-600 hover:text-white dark:bg-slate-800 dark:hover:bg-sky-600 text-slate-800 dark:text-slate-200 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                >
                  {rec.actionModule === 'quiz' ? 'Take Quiz →' : 'Explore →'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
