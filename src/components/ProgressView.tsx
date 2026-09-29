import React from 'react';
import { Award, Clock, BookOpen, HelpCircle } from 'lucide-react';
import type { ModuleId, ProgressState } from '../types/edugenie';

interface ProgressViewProps {
  progress: ProgressState;
  onNavigate: (module: ModuleId, prefillTopic?: string) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  progress,
  onNavigate,
}) => {
  // Calculate overall mastery percentage from real courses & roadmap
  const avgCourseProgress =
    progress.courses.length > 0
      ? Math.round(
          progress.courses.reduce((acc, c) => acc + c.progressPercent, 0) /
            progress.courses.length
        )
      : 0;

  const roadmapCompleted = progress.activeRoadmap.stages.filter((s) => s.completed).length;
  const roadmapTotal = progress.activeRoadmap.stages.length || 1;
  const roadmapPct = Math.round((roadmapCompleted / roadmapTotal) * 100);

  const overallProgress = Math.round(
    (avgCourseProgress + roadmapPct + (progress.averageQuizScore || avgCourseProgress)) / 3
  );

  // Circular SVG Ring constants
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallProgress / 100) * circumference;

  const achievements = [
    {
      id: 'ach-1',
      title: 'Consistent Scholar',
      description: `Maintained a ${progress.learningStreakDays}-day continuous learning streak.`,
      unlocked: progress.learningStreakDays >= 3,
      metric: `${progress.learningStreakDays} / 3 Days`,
    },
    {
      id: 'ach-2',
      title: 'Topic Explorer',
      description: 'Explored and studied at least 10 distinct academic topics.',
      unlocked: progress.topicsStudiedCount >= 10,
      metric: `${progress.topicsStudiedCount} / 10 Topics`,
    },
    {
      id: 'ach-3',
      title: 'Assessment Master',
      description: 'Achieved an average score of 80% or higher across completed quizzes.',
      unlocked: progress.averageQuizScore >= 80 && progress.quizAttemptsCount > 0,
      metric: `${progress.averageQuizScore}% Avg`,
    },
    {
      id: 'ach-4',
      title: 'Roadmap Finisher',
      description: 'Completed at least 2 stages in your active personalized learning path.',
      unlocked: roadmapCompleted >= 2,
      metric: `${roadmapCompleted} / ${roadmapTotal} Stages`,
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header & Top Summary Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Circular Overall Progress Indicator Card */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center gap-6 justify-between">
          <div className="space-y-2">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Real-Time Learning Telemetry
            </div>
            <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
              Overall Progress
            </h1>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 max-w-xs">
              Synthesized from your active courses ({avgCourseProgress}%), learning path completion ({roadmapPct}%), and quiz mastery ({progress.averageQuizScore}%).
            </p>
          </div>

          <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
              <circle
                cx="64"
                cy="64"
                r={radius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-100 dark:text-slate-800"
              />
              <circle
                cx="64"
                cy="64"
                r={radius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="text-sky-600 dark:text-sky-400 transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                {overallProgress}%
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Mastery</span>
            </div>
          </div>
        </div>

        {/* 4 Key Progress Metrics */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">Topics Completed</div>
            <div className="my-3 text-3xl font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
              {progress.topicsStudiedCount}
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400">
              ✓ Verified sessions
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">Quiz Performance</div>
            <div className="my-3 text-3xl font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
              {progress.averageQuizScore}%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              {progress.quizAttemptsCount} quizzes taken
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">Learning Streak</div>
            <div className="my-3 text-3xl font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
              {progress.learningStreakDays}d
            </div>
            <div className="text-xs text-sky-600 dark:text-sky-400">● Active streak</div>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">Study Time</div>
            <div className="my-3 text-3xl font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
              {progress.totalStudyMinutes}m
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              {progress.studySessions.length} recent logs
            </div>
          </div>
        </div>
      </section>

      {/* Two-Column Analytics: Course Progress Bars & Quiz Performance Chart */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Subject Progress Breakdown */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
              Subject Completion Progress
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Module completion across your enrolled study tracks
            </p>
          </div>

          <div className="space-y-5">
            {progress.courses.map((course) => (
              <div key={course.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {course.title}
                  </span>
                  <span className="font-mono tabular-nums text-xs text-slate-600 dark:text-slate-300">
                    {course.completedModules}/{course.totalModules} modules ·{' '}
                    <strong>{course.progressPercent}%</strong>
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-sky-600 dark:bg-sky-500 rounded-full transition-all duration-300"
                    style={{ width: `${course.progressPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Recently Studied Topics ({progress.studiedTopicsList.length}):
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {progress.studiedTopicsList.slice(0, 8).join('  ·  ')}
            </div>
          </div>
        </div>

        {/* Quiz Performance Bar Chart & History */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
                Quiz Performance Chart
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Percentage scores across your completed assessments
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('quiz')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>New Quiz</span>
            </button>
          </div>

          {progress.quizHistory.length === 0 ? (
            <div className="p-8 text-center space-y-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No quiz attempts recorded yet. Take your first practice quiz to visualize your performance trend!
              </p>
              <button
                type="button"
                onClick={() => onNavigate('quiz')}
                className="px-4 py-2 rounded-lg bg-sky-600 text-white text-xs font-medium cursor-pointer"
              >
                Start First Quiz
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Visual Bar Chart */}
              <div className="h-40 flex items-end gap-3 pt-6 px-2 border-b border-slate-200 dark:border-slate-800">
                {progress.quizHistory
                  .slice(0, 6)
                  .reverse()
                  .map((attempt) => (
                    <div
                      key={attempt.id}
                      className="flex-1 flex flex-col items-center gap-2 group"
                    >
                      <span className="text-[11px] font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-300">
                        {attempt.percentage}%
                      </span>
                      <div className="w-full max-w-[44px] bg-slate-100 dark:bg-slate-800 rounded-t-md h-24 flex items-end overflow-hidden">
                        <div
                          className={`w-full rounded-t-md transition-all duration-300 ${
                            attempt.percentage >= 80
                              ? 'bg-emerald-600 dark:bg-emerald-500'
                              : attempt.percentage >= 60
                              ? 'bg-sky-600 dark:bg-sky-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ height: `${Math.max(12, attempt.percentage)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[72px]">
                        {attempt.topic}
                      </span>
                    </div>
                  ))}
              </div>

              {/* Compact Tabular History */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {progress.quizHistory.slice(0, 4).map((q) => (
                  <div
                    key={q.id}
                    className="py-2.5 flex items-center justify-between text-xs gap-4"
                  >
                    <div className="truncate">
                      <span className="font-medium text-slate-900 dark:text-white">
                        {q.topic}
                      </span>
                      <span className="text-slate-400 mx-1.5">·</span>
                      <span className="text-slate-500">{q.difficulty}</span>
                    </div>
                    <div className="font-mono tabular-nums shrink-0 flex items-center gap-3">
                      <span className="text-slate-500">
                        {q.score}/{q.total}
                      </span>
                      <span
                        className={`font-semibold ${
                          q.percentage >= 80
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-sky-600 dark:text-sky-400'
                        }`}
                      >
                        {q.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Study Sessions & Achievement Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Study Sessions Log */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
                Study Sessions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Chronological log of your real AI learning interactions
              </p>
            </div>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>

          {progress.studySessions.length === 0 ? (
            <p className="text-xs text-slate-500 py-6">
              No study sessions logged yet. Explore a topic or ask a question to begin tracking!
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {progress.studySessions.slice(0, 6).map((sess) => (
                <div
                  key={sess.id}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {sess.topic}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{sess.activityType}</span>
                      <span aria-hidden="true">·</span>
                      <span>{sess.timestamp}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300 shrink-0">
                    {sess.durationMinutes} mins
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Achievement Cards */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
                Milestones & Achievements
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Earned automatically from your real study metrics
              </p>
            </div>
            <Award className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`p-4 rounded-lg border space-y-2 ${
                  ach.unlocked
                    ? 'border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`font-semibold ${
                      ach.unlocked
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {ach.unlocked ? '✓ Unlocked' : 'Locked'}
                  </span>
                  <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    {ach.metric}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {ach.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {ach.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
