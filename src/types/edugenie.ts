export type LearningLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type ThemeMode = 'light' | 'dark';
export type ModuleId =
  | 'dashboard'
  | 'ask-ai'
  | 'explain'
  | 'quiz'
  | 'summarize'
  | 'learning-path'
  | 'progress'
  | 'settings';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  followUpQuestions?: string[];
}

export interface TopicExplanation {
  topic: string;
  level: LearningLevel;
  simplified: boolean;
  engineUsed: string;
  definition: string;
  simpleExplanation: string;
  keyPoints: string[];
  example: string;
  realWorldApplication: string;
  quickRevision: string[];
  timestamp: string;
}

export interface SummaryResult {
  mode: 'short' | 'detailed';
  summary: string;
  keyPoints: string[];
  importantTerms: Array<{
    term: string;
    definition: string;
  }>;
  wordCountOriginal: number;
  wordCountSummary: number;
  timestamp: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizData {
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questions: QuizQuestion[];
}

export interface QuizAttemptRecord {
  id: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  score: number;
  total: number;
  percentage: number;
  date: string;
}

export interface LearningStage {
  id: string;
  stageNumber: string;
  topic: string;
  difficulty: LearningLevel;
  estimatedTime: string;
  description: string;
  practiceActivity: string;
  completed: boolean;
}

export interface LearningRoadmap {
  id: string;
  subject: string;
  level: LearningLevel;
  goal: string;
  studyTime: string;
  stages: LearningStage[];
  updatedAt: string;
}

export interface RecommendationItem {
  id: string;
  title: string;
  category: string;
  difficulty: LearningLevel;
  estimatedMinutes: number;
  reason: string;
  targetTopic: string;
  actionModule: 'explain' | 'quiz' | 'ask-ai' | 'learning-path';
}

export interface CourseProgressItem {
  id: string;
  title: string;
  category: string;
  completedModules: number;
  totalModules: number;
  progressPercent: number;
  lastStudied: string;
}

export interface StudySessionRecord {
  id: string;
  activityType: 'Q&A' | 'Explanation' | 'Quiz' | 'Summary' | 'Roadmap';
  topic: string;
  durationMinutes: number;
  timestamp: string;
}

export interface UserSettings {
  name: string;
  email: string;
  institution: string;
  theme: ThemeMode;
  learningLevel: LearningLevel;
  preferredLanguage: string;
  notifications: {
    dailyReminder: boolean;
    quizMilestone: boolean;
    weeklyDigest: boolean;
  };
}

export interface ProgressState {
  topicsStudiedCount: number;
  studiedTopicsList: string[];
  quizAttemptsCount: number;
  averageQuizScore: number;
  learningStreakDays: number;
  totalStudyMinutes: number;
  courses: CourseProgressItem[];
  quizHistory: QuizAttemptRecord[];
  studySessions: StudySessionRecord[];
  activeRoadmap: LearningRoadmap;
  recommendations: RecommendationItem[];
  settings: UserSettings;
}
