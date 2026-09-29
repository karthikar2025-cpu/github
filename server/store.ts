import fs from 'fs';
import path from 'path';
import type {
  ProgressState,
  QuizAttemptRecord,
  LearningRoadmap,
  RecommendationItem,
  UserSettings,
} from '../src/types/edugenie.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'edugenie_store.json');

const DEFAULT_STATE: ProgressState = {
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
    {
      id: 'sess-4',
      activityType: 'Q&A',
      topic: 'Time Complexity of Merge Sort vs Quick Sort',
      durationMinutes: 18,
      timestamp: 'Yesterday · 06:40 PM',
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
        description: 'Understand how the Python interpreter executes bytecode, indentation rules, and standard I/O.',
        practiceActivity: 'Write a CLI temperature and unit converter using formatted string literals.',
        completed: true,
      },
      {
        id: 'stage-2',
        stageNumber: '02',
        topic: 'Variables, Memory References & Data Types',
        difficulty: 'Beginner',
        estimatedTime: '60 mins',
        description: 'Explore mutable vs immutable types, dynamic typing, strings, lists, tuples, sets, and dictionaries.',
        practiceActivity: 'Build an in-memory student gradebook lookup tool using nested dictionaries and sets.',
        completed: true,
      },
      {
        id: 'stage-3',
        stageNumber: '03',
        topic: 'Conditional Statements & Boolean Logic',
        difficulty: 'Beginner',
        estimatedTime: '45 mins',
        description: 'Control program branching with if/elif/else, structural pattern matching, and truthy/falsy evaluation.',
        practiceActivity: 'Create a loan eligibility evaluator with multi-tier credit and income validation.',
        completed: false,
      },
      {
        id: 'stage-4',
        stageNumber: '04',
        topic: 'Iterative Loops, Comprehensions & Generators',
        difficulty: 'Intermediate',
        estimatedTime: '60 mins',
        description: 'Master for and while loops, enumerate, zip, list/dict comprehensions, and lazy generator expressions.',
        practiceActivity: 'Refactor a 30-line log parser into clean generator pipelines and list comprehensions.',
        completed: false,
      },
      {
        id: 'stage-5',
        stageNumber: '05',
        topic: 'Functions, Closures & Decorators',
        difficulty: 'Intermediate',
        estimatedTime: '75 mins',
        description: 'Design reusable functions with *args, **kwargs, lexical scope, first-class functions, and custom decorators.',
        practiceActivity: 'Implement a @measure_execution_time and @memoize decorator from scratch.',
        completed: false,
      },
      {
        id: 'stage-6',
        stageNumber: '06',
        topic: 'Object-Oriented Programming & Dunder Methods',
        difficulty: 'Intermediate',
        estimatedTime: '90 mins',
        description: 'Model real-world entities using classes, inheritance, composition, dataclasses, and operator overloading.',
        practiceActivity: 'Design a modular Library Inventory system with Book, Member, and Loan classes.',
        completed: false,
      },
      {
        id: 'stage-7',
        stageNumber: '07',
        topic: 'Advanced Python: Asyncio, Typing & Testing',
        difficulty: 'Advanced',
        estimatedTime: '90 mins',
        description: 'Write concurrent I/O routines with async/await, static type annotations, and unit tests with pytest.',
        practiceActivity: 'Build an asynchronous concurrent URL status checker with full type hints.',
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

export function loadProgressStore(): ProgressState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_PATH)) {
      fs.writeFileSync(STORE_PATH, JSON.stringify(DEFAULT_STATE, null, 2), 'utf-8');
      return structuredClone(DEFAULT_STATE);
    }
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      settings: {
        ...DEFAULT_STATE.settings,
        ...(parsed.settings || {}),
      },
    };
  } catch (err) {
    console.error('Error loading progress store, using defaults:', err);
    return structuredClone(DEFAULT_STATE);
  }
}

export function saveProgressStore(state: ProgressState): ProgressState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist store:', err);
  }
  return state;
}

export function recordStudyActivity(params: {
  activityType: 'Q&A' | 'Explanation' | 'Quiz' | 'Summary' | 'Roadmap';
  topic: string;
  durationMinutes?: number;
  quizResult?: {
    difficulty: 'Easy' | 'Medium' | 'Hard';
    score: number;
    total: number;
  };
  roadmapUpdate?: LearningRoadmap;
  recommendationsUpdate?: RecommendationItem[];
  toggleStageId?: string;
  courseProgressBoost?: string;
}): ProgressState {
  const state = loadProgressStore();
  const cleanTopic = params.topic?.trim() || 'General Study Session';
  const duration = params.durationMinutes ?? 12;

  // Record study session
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  state.studySessions.unshift({
    id: `sess-${Date.now()}`,
    activityType: params.activityType,
    topic: cleanTopic,
    durationMinutes: duration,
    timestamp: `Today · ${timeStr}`,
  });
  state.studySessions = state.studySessions.slice(0, 20);
  state.totalStudyMinutes += duration;

  // Add to studied topics if new
  if (
    cleanTopic &&
    !state.studiedTopicsList.some((t) => t.toLowerCase() === cleanTopic.toLowerCase())
  ) {
    state.studiedTopicsList.unshift(cleanTopic);
    state.topicsStudiedCount += 1;
  }

  // Update matching course progress if relevant
  const lowerTopic = cleanTopic.toLowerCase();
  for (const course of state.courses) {
    if (
      (course.id === 'course-python' && lowerTopic.includes('python')) ||
      (course.id === 'course-dsa' &&
        (lowerTopic.includes('tree') ||
          lowerTopic.includes('graph') ||
          lowerTopic.includes('sort') ||
          lowerTopic.includes('data structure') ||
          lowerTopic.includes('algorithm'))) ||
      (course.id === 'course-accounting' &&
        (lowerTopic.includes('account') ||
          lowerTopic.includes('finance') ||
          lowerTopic.includes('balance') ||
          lowerTopic.includes('ledger')))
    ) {
      course.lastStudied = 'Just now';
      if (course.completedModules < course.totalModules) {
        course.completedModules = Math.min(course.totalModules, course.completedModules + 1);
      }
      course.progressPercent = Math.min(
        100,
        Math.round((course.completedModules / course.totalModules) * 100)
      );
    }
  }

  // Handle Quiz Result
  if (params.quizResult) {
    const percentage = Math.round((params.quizResult.score / params.quizResult.total) * 100);
    const newAttempt: QuizAttemptRecord = {
      id: `qz-${Date.now()}`,
      topic: cleanTopic,
      difficulty: params.quizResult.difficulty,
      score: params.quizResult.score,
      total: params.quizResult.total,
      percentage,
      date: now.toISOString().split('T')[0],
    };
    state.quizHistory.unshift(newAttempt);
    state.quizAttemptsCount += 1;
    const totalPct = state.quizHistory.reduce((acc, item) => acc + item.percentage, 0);
    state.averageQuizScore = Math.round(totalPct / state.quizHistory.length);
  }

  // Handle Roadmap replacement
  if (params.roadmapUpdate) {
    state.activeRoadmap = params.roadmapUpdate;
  }

  // Handle Recommendations update
  if (params.recommendationsUpdate && params.recommendationsUpdate.length > 0) {
    state.recommendations = params.recommendationsUpdate;
  }

  // Handle toggling a stage completion
  if (params.toggleStageId && state.activeRoadmap) {
    const stage = state.activeRoadmap.stages.find((s) => s.id === params.toggleStageId);
    if (stage) {
      stage.completed = !stage.completed;
      if (stage.completed) {
        state.topicsStudiedCount += 1;
      }
      // Also sync course progress if roadmap subject matches a course
      const completedCount = state.activeRoadmap.stages.filter((s) => s.completed).length;
      const totalStages = state.activeRoadmap.stages.length || 1;
      const matchingCourse = state.courses.find((c) =>
        c.title.toLowerCase().includes(state.activeRoadmap.subject.toLowerCase()) ||
        state.activeRoadmap.subject.toLowerCase().includes(c.title.toLowerCase())
      );
      if (matchingCourse) {
        matchingCourse.completedModules = completedCount;
        matchingCourse.totalModules = totalStages;
        matchingCourse.progressPercent = Math.round((completedCount / totalStages) * 100);
        matchingCourse.lastStudied = 'Just now';
      }
    }
  }

  return saveProgressStore(state);
}

export function updateSettingsStore(partialSettings: Partial<UserSettings>): ProgressState {
  const state = loadProgressStore();
  state.settings = {
    ...state.settings,
    ...partialSettings,
    notifications: {
      ...state.settings.notifications,
      ...(partialSettings.notifications || {}),
    },
  };
  return saveProgressStore(state);
}

export function clearHistoryStore(): ProgressState {
  const state = loadProgressStore();
  const preservedSettings = state.settings;
  const resetState: ProgressState = {
    ...structuredClone(DEFAULT_STATE),
    topicsStudiedCount: 3,
    studiedTopicsList: ['Python Programming', 'Data Structures', 'Financial Accounting'],
    quizAttemptsCount: 0,
    averageQuizScore: 0,
    quizHistory: [],
    studySessions: [],
    totalStudyMinutes: 0,
    settings: preservedSettings,
  };
  return saveProgressStore(resetState);
}
