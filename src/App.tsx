/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  HelpCircle,
  FileText,
  Compass,
  BarChart3,
  Settings,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import type {
  ModuleId,
  ProgressState,
  UserSettings,
} from './types/edugenie';
import { DashboardView } from './components/DashboardView';
import { AskAiView } from './components/AskAiView';
import { ExplainTopicView } from './components/ExplainTopicView';
import { SummarizerView } from './components/SummarizerView';
import { QuizGeneratorView } from './components/QuizGeneratorView';
import { LearningPathView } from './components/LearningPathView';
import { ProgressView } from './components/ProgressView';
import { SettingsView } from './components/SettingsView';

const INITIAL_FALLBACK_STATE: ProgressState = {
  topicsStudiedCount: 14,
  studiedTopicsList: [
    'Python Functions & Decorators',
    'Binary Search Trees',
    'Double-Entry Bookkeeping',
    'Photosynthesis & Light Reactions',
    'Dynamic Programming Fundamentals',
    'SQL Joins & Indexing',
  ],
  quizAttemptsCount: 6,
  averageQuizScore: 84,
  learningStreakDays: 7,
  totalStudyMinutes: 340,
  courses: [
    {
      id: 'course-python',
      title: 'Python Programming',
      category: 'Computer Science',
      completedModules: 5,
      totalModules: 7,
      progressPercent: 71,
      lastStudied: '2 hours ago',
    },
    {
      id: 'course-dsa',
      title: 'Data Structures',
      category: 'Algorithms & Systems',
      completedModules: 6,
      totalModules: 10,
      progressPercent: 60,
      lastStudied: 'Yesterday',
    },
    {
      id: 'course-accounting',
      title: 'Financial Accounting',
      category: 'Commerce & Finance',
      completedModules: 4,
      totalModules: 8,
      progressPercent: 50,
      lastStudied: '3 days ago',
    },
  ],
  quizHistory: [
    {
      id: 'qz-101',
      topic: 'Python Data Structures & Lists',
      difficulty: 'Medium',
      score: 9,
      total: 10,
      percentage: 90,
      date: '2026-09-24',
    },
    {
      id: 'qz-102',
      topic: 'Financial Balance Sheets',
      difficulty: 'Easy',
      score: 4,
      total: 5,
      percentage: 80,
      date: '2026-09-25',
    },
    {
      id: 'qz-103',
      topic: 'Binary Trees & Graph Traversal',
      difficulty: 'Hard',
      score: 8,
      total: 10,
      percentage: 80,
      date: '2026-09-27',
    },
    {
      id: 'qz-104',
      topic: 'Object-Oriented Programming in Python',
      difficulty: 'Medium',
      score: 9,
      total: 10,
      percentage: 90,
      date: '2026-09-28',
    },
  ],
  studySessions: [
    {
      id: 'sess-1',
      activityType: 'Explanation',
      topic: 'Object-Oriented Programming in Python',
      durationMinutes: 25,
      timestamp: 'Today · 09:30 AM',
    },
    {
      id: 'sess-2',
      activityType: 'Quiz',
      topic: 'Object-Oriented Programming in Python',
      durationMinutes: 15,
      timestamp: 'Today · 10:05 AM',
    },
    {
      id: 'sess-3',
      activityType: 'Summary',
      topic: 'Corporate Financial Statements Notes',
      durationMinutes: 20,
      timestamp: 'Yesterday · 04:15 PM',
    },
  ],
  activeRoadmap: {
    id: 'roadmap-python-default',
    subject: 'Python Programming',
    level: 'Intermediate',
    goal: 'Master core Python syntax, data structures, OOP, and write production-ready modular scripts',
    studyTime: '45 mins / day',
    updatedAt: 'Today',
    stages: [
      {
        id: 'stage-1',
        stageNumber: '01',
        topic: 'Fundamentals & Execution Model',
        difficulty: 'Beginner',
        estimatedTime: '45 mins',
        description:
          'Understand how the Python interpreter executes bytecode, indentation rules, and standard I/O.',
        practiceActivity:
          'Write a CLI temperature and unit converter using formatted string literals.',
        completed: true,
      },
      {
        id: 'stage-2',
        stageNumber: '02',
        topic: 'Variables, Memory References & Data Types',
        difficulty: 'Beginner',
        estimatedTime: '60 mins',
        description:
          'Explore mutable vs immutable types, dynamic typing, strings, lists, tuples, sets, and dictionaries.',
        practiceActivity:
          'Build an in-memory student gradebook lookup tool using nested dictionaries and sets.',
        completed: true,
      },
      {
        id: 'stage-3',
        stageNumber: '03',
        topic: 'Conditional Statements & Boolean Logic',
        difficulty: 'Beginner',
        estimatedTime: '45 mins',
        description:
          'Control program branching with if/elif/else, structural pattern matching, and truthy/falsy evaluation.',
        practiceActivity:
          'Create a loan eligibility evaluator with multi-tier credit and income validation.',
        completed: false,
      },
      {
        id: 'stage-4',
        stageNumber: '04',
        topic: 'Iterative Loops, Comprehensions & Generators',
        difficulty: 'Intermediate',
        estimatedTime: '60 mins',
        description:
          'Master for and while loops, enumerate, zip, list/dict comprehensions, and lazy generator expressions.',
        practiceActivity:
          'Refactor a 30-line log parser into clean generator pipelines and list comprehensions.',
        completed: false,
      },
      {
        id: 'stage-5',
        stageNumber: '05',
        topic: 'Functions, Closures & Decorators',
        difficulty: 'Intermediate',
        estimatedTime: '75 mins',
        description:
          'Design reusable functions with *args, **kwargs, lexical scope, first-class functions, and custom decorators.',
        practiceActivity:
          'Implement a @measure_execution_time and @memoize decorator from scratch.',
        completed: false,
      },
      {
        id: 'stage-6',
        stageNumber: '06',
        topic: 'Object-Oriented Programming & Dunder Methods',
        difficulty: 'Intermediate',
        estimatedTime: '90 mins',
        description:
          'Model real-world entities using classes, inheritance, composition, dataclasses, and operator overloading.',
        practiceActivity:
          'Design a modular Library Inventory system with Book, Member, and Loan classes.',
        completed: false,
      },
      {
        id: 'stage-7',
        stageNumber: '07',
        topic: 'Advanced Python: Asyncio, Typing & Testing',
        difficulty: 'Advanced',
        estimatedTime: '90 mins',
        description:
          'Write concurrent I/O routines with async/await, static type annotations, and unit tests with pytest.',
        practiceActivity:
          'Build an asynchronous concurrent URL status checker with full type hints.',
        completed: false,
      },
    ],
  },
  recommendations: [
    {
      id: 'rec-1',
      title: 'Python List Comprehensions & Generators',
      category: 'Python Programming',
      difficulty: 'Intermediate',
      estimatedMinutes: 20,
      reason: 'Directly aligns with Stage 04 of your active Python Programming path.',
      targetTopic: 'Python List Comprehensions vs Generator Expressions',
      actionModule: 'explain',
    },
    {
      id: 'rec-2',
      title: 'Graph Traversal: BFS vs DFS Practice Quiz',
      category: 'Data Structures',
      difficulty: 'Intermediate',
      estimatedMinutes: 15,
      reason: 'Follow-up diagnostic after your 80% score on Binary Trees & Graph Traversal.',
      targetTopic: 'Breadth-First Search and Depth-First Search Algorithms',
      actionModule: 'quiz',
    },
    {
      id: 'rec-3',
      title: 'Accrual Accounting & Adjusting Entries',
      category: 'Financial Accounting',
      difficulty: 'Beginner',
      estimatedMinutes: 25,
      reason: 'Completes Module 5 of your Financial Accounting track.',
      targetTopic: 'Accrual Basis Accounting and Adjusting Journal Entries',
      actionModule: 'explain',
    },
  ],
  settings: {
    name: 'Aarav Sharma',
    email: 'aarav.sharma@university.edu',
    institution: 'Department of Computer Science & Engineering',
    theme: 'light',
    learningLevel: 'Intermediate',
    preferredLanguage: 'English',
    notifications: {
      dailyReminder: true,
      quizMilestone: true,
      weeklyDigest: false,
    },
  },
};

const SIDEBAR_ITEMS: Array<{
  id: ModuleId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'ask-ai', label: 'Ask AI', icon: MessageSquare },
  { id: 'explain', label: 'Explain Topic', icon: BookOpen },
  { id: 'quiz', label: 'Generate Quiz', icon: HelpCircle },
  { id: 'summarize', label: 'Summarize', icon: FileText },
  { id: 'learning-path', label: 'Learning Path', icon: Compass },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');
  const [prefillTopic, setPrefillTopic] = useState<string | undefined>(undefined);
  const [progress, setProgress] = useState<ProgressState>(INITIAL_FALLBACK_STATE);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync theme class on documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (progress.settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [progress.settings.theme]);

  // Fetch initial persisted state from backend /progress endpoint
  useEffect(() => {
    fetch('/progress')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.courses) {
          setProgress(data);
        }
      })
      .catch((err) => {
        console.error('Using local fallback state:', err);
      });
  }, []);

  const handleNavigate = (module: ModuleId, topic?: string) => {
    if (topic) {
      setPrefillTopic(topic);
    }
    setActiveModule(module);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateSettings = async (partial: Partial<UserSettings>) => {
    // Optimistically update local state
    setProgress((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...partial,
      },
    }));

    try {
      const res = await fetch('/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partial),
      });
      if (res.ok) {
        const updated = await res.json();
        setProgress(updated);
      }
    } catch (err) {
      console.error('Failed to persist settings:', err);
    }
  };

  const handleClearHistory = async () => {
    try {
      const res = await fetch('/history/clear', { method: 'POST' });
      if (res.ok) {
        const resetData = await res.json();
        setProgress(resetData);
      }
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  const handleRefreshRecommendations = async () => {
    try {
      const res = await fetch('/learn/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: progress.activeRoadmap.subject,
          level: progress.settings.learningLevel,
          goal: progress.activeRoadmap.goal,
          studyTime: progress.activeRoadmap.studyTime,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.progress) {
          setProgress(data.progress);
        }
      }
    } catch (err) {
      console.error('Failed to refresh AI recommendations:', err);
    }
  };

  const toggleThemeQuick = () => {
    const nextTheme = progress.settings.theme === 'dark' ? 'light' : 'dark';
    handleUpdateSettings({ theme: nextTheme });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Top Bar Contract: Strictly 3 zones (Brand wordmark — 4-5 text nav links — 1-2 primary actions) */}
      <header className="sticky top-0 z-30 h-16 px-4 sm:px-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        {/* Zone 1: Single text element Brand Wordmark */}
        <a
          href="#dashboard"
          onClick={(e) => {
            e.preventDefault();
            handleNavigate('dashboard');
          }}
          className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap"
        >
          EduGenie
        </a>

        {/* Zone 2: 5 clean text navigation links with subtle hover underlines */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300"
        >
          <a
            href="#dashboard"
            onClick={(e) => {
              e.preventDefault();
              handleNavigate('dashboard');
            }}
            className={`hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-8 transition-colors whitespace-nowrap ${
              activeModule === 'dashboard'
                ? 'text-slate-900 dark:text-white underline decoration-sky-600 decoration-2'
                : ''
            }`}
          >
            Dashboard
          </a>
          <a
            href="#ask-ai"
            onClick={(e) => {
              e.preventDefault();
              handleNavigate('ask-ai');
            }}
            className={`hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-8 transition-colors whitespace-nowrap ${
              activeModule === 'ask-ai'
                ? 'text-slate-900 dark:text-white underline decoration-sky-600 decoration-2'
                : ''
            }`}
          >
            Ask AI
          </a>
          <a
            href="#explain"
            onClick={(e) => {
              e.preventDefault();
              handleNavigate('explain');
            }}
            className={`hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-8 transition-colors whitespace-nowrap ${
              activeModule === 'explain'
                ? 'text-slate-900 dark:text-white underline decoration-sky-600 decoration-2'
                : ''
            }`}
          >
            Explain Topic
          </a>
          <a
            href="#quiz"
            onClick={(e) => {
              e.preventDefault();
              handleNavigate('quiz');
            }}
            className={`hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-8 transition-colors whitespace-nowrap ${
              activeModule === 'quiz'
                ? 'text-slate-900 dark:text-white underline decoration-sky-600 decoration-2'
                : ''
            }`}
          >
            Generate Quiz
          </a>
          <a
            href="#learning-path"
            onClick={(e) => {
              e.preventDefault();
              handleNavigate('learning-path');
            }}
            className={`hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-8 transition-colors whitespace-nowrap ${
              activeModule === 'learning-path'
                ? 'text-slate-900 dark:text-white underline decoration-sky-600 decoration-2'
                : ''
            }`}
          >
            Learning Path
          </a>
        </nav>

        {/* Zone 3: 1-2 Primary Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleThemeQuick}
            aria-label="Toggle Light or Dark Mode"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            {progress.settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('summarize')}
            className="hidden sm:inline-flex px-4 py-2 text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            Summarize Notes
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Menu"
            className="md:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Workspace Container: Left Sidebar (Desktop/Tablet) + Main Content Viewport */}
      <div className="flex-1 flex">
        {/* Desktop & Tablet Sidebar */}
        <aside
          aria-label="Sidebar Navigation"
          className="hidden md:flex md:w-16 xl:w-64 shrink-0 flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 xl:p-5"
        >
          <div className="space-y-1">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  title={item.label}
                  className={`w-full flex items-center justify-center xl:justify-start gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="hidden xl:inline">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Student Study Profile Summary in Sidebar Footer */}
          <div className="hidden xl:block pt-5 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
              {progress.settings.name}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span>{progress.settings.learningLevel}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {progress.learningStreakDays}d streak
              </span>
            </div>
          </div>
        </aside>

        {/* Mobile Drawer Navigation */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            <div
              className="fixed inset-0 bg-slate-950/60"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-50 w-64 max-w-[80vw] bg-white dark:bg-slate-900 h-full p-5 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    EduGenie
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 text-slate-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1">
                  {SIDEBAR_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeModule === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNavigate(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-sky-600 text-white'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                Learn Smarter. Understand Faster.
              </div>
            </div>
          </div>
        )}

        {/* Active Module Viewport */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 pt-6 max-w-7xl mx-auto w-full">
          {activeModule === 'dashboard' && (
            <DashboardView
              progress={progress}
              onNavigate={handleNavigate}
              onRefreshRecommendations={handleRefreshRecommendations}
            />
          )}

          {activeModule === 'ask-ai' && (
            <AskAiView
              initialPrompt={prefillTopic}
              level={progress.settings.learningLevel}
              language={progress.settings.preferredLanguage}
              onProgressUpdate={setProgress}
            />
          )}

          {activeModule === 'explain' && (
            <ExplainTopicView
              initialTopic={prefillTopic}
              level={progress.settings.learningLevel}
              language={progress.settings.preferredLanguage}
              onProgressUpdate={setProgress}
              onNavigate={handleNavigate}
            />
          )}

          {activeModule === 'summarize' && (
            <SummarizerView
              level={progress.settings.learningLevel}
              language={progress.settings.preferredLanguage}
              onProgressUpdate={setProgress}
            />
          )}

          {activeModule === 'quiz' && (
            <QuizGeneratorView
              initialTopic={prefillTopic}
              level={progress.settings.learningLevel}
              language={progress.settings.preferredLanguage}
              onProgressUpdate={setProgress}
            />
          )}

          {activeModule === 'learning-path' && (
            <LearningPathView
              roadmap={progress.activeRoadmap}
              onProgressUpdate={setProgress}
              onNavigate={handleNavigate}
            />
          )}

          {activeModule === 'progress' && (
            <ProgressView progress={progress} onNavigate={handleNavigate} />
          )}

          {activeModule === 'settings' && (
            <SettingsView
              settings={progress.settings}
              onUpdateSettings={handleUpdateSettings}
              onClearHistory={handleClearHistory}
              progress={progress}
            />
          )}
        </main>
      </div>
    </div>
  );
}
