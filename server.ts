import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  generateQaResponse,
  generateTopicExplanation,
  generateSummary,
  generateQuizQuestions,
  generateLearningPathAndRecommendations,
} from './server/aiService.ts';
import {
  loadProgressStore,
  recordStudyActivity,
  updateSettingsStore,
  clearHistoryStore,
} from './server/store.ts';
import type { LearningLevel } from './src/types/edugenie.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  // Helper to format friendly error responses
  const handleApiError = (res: Response, error: unknown, fallbackMessage: string) => {
    console.error('[EduGenie API Error]:', error);
    const message =
      error instanceof Error && error.message
        ? error.message
        : fallbackMessage;
    res.status(500).json({
      error: true,
      message: message.includes('API_KEY')
        ? 'Gemini API key is missing or invalid. Please verify your GEMINI_API_KEY configuration.'
        : message,
    });
  };

  // ============================================================================
  // 1. Q&A Endpoint: GET /qa and POST /qa (plus /api/qa alias)
  // ============================================================================
  const handleQa = async (req: Request, res: Response) => {
    try {
      const question =
        (req.method === 'GET' ? (req.query.question as string) : req.body?.question) ||
        (req.query.q as string) ||
        '';
      const history = req.body?.history || [];
      const store = loadProgressStore();
      const level =
        ((req.query.level as LearningLevel) ||
          req.body?.level ||
          store.settings.learningLevel) ??
        'Intermediate';
      const language =
        ((req.query.language as string) ||
          req.body?.language ||
          store.settings.preferredLanguage) ??
        'English';

      if (!question || typeof question !== 'string' || !question.trim()) {
        res.status(400).json({
          error: true,
          message: 'Please enter a valid question for EduGenie.',
        });
        return;
      }

      if (question.length > 4000) {
        res.status(400).json({
          error: true,
          message: 'Your question exceeds the 4,000-character limit. Please shorten it or use the Summarizer.',
        });
        return;
      }

      const result = await generateQaResponse({
        question: question.trim(),
        history,
        level,
        language,
      });

      const updatedProgress = recordStudyActivity({
        activityType: 'Q&A',
        topic: question.trim().slice(0, 65),
        durationMinutes: 8,
      });

      res.json({
        ...result,
        progress: updatedProgress,
      });
    } catch (error) {
      handleApiError(res, error, 'Unable to process your question right now. Please try again.');
    }
  };

  app.get('/qa', handleQa);
  app.post('/qa', handleQa);
  app.get('/api/qa', handleQa);
  app.post('/api/qa', handleQa);

  // ============================================================================
  // 2. Topic Explanation Endpoint: POST /explain (plus /api/explain alias)
  // ============================================================================
  const handleExplain = async (req: Request, res: Response) => {
    try {
      const topic = req.body?.topic || (req.query.topic as string) || '';
      const simplify = Boolean(req.body?.simplify);
      const engineMode = req.body?.engineMode || 'lamini-flan-t5';
      const store = loadProgressStore();
      const level: LearningLevel = req.body?.level || store.settings.learningLevel || 'Intermediate';
      const language: string = req.body?.language || store.settings.preferredLanguage || 'English';

      if (!topic || typeof topic !== 'string' || !topic.trim()) {
        res.status(400).json({
          error: true,
          message: 'Please provide a topic you would like EduGenie to explain.',
        });
        return;
      }

      const explanation = await generateTopicExplanation({
        topic: topic.trim(),
        simplify,
        level,
        language,
        engineMode,
      });

      const updatedProgress = recordStudyActivity({
        activityType: 'Explanation',
        topic: topic.trim(),
        durationMinutes: 15,
      });

      res.json({
        explanation,
        progress: updatedProgress,
      });
    } catch (error) {
      handleApiError(res, error, 'Unable to generate topic explanation at this moment.');
    }
  };

  app.post('/explain', handleExplain);
  app.post('/api/explain', handleExplain);

  // ============================================================================
  // 3. Summarizer Endpoint: POST /summarize (plus /api/summarize alias)
  // ============================================================================
  const handleSummarize = async (req: Request, res: Response) => {
    try {
      const text = req.body?.text || '';
      const mode = req.body?.mode === 'detailed' ? 'detailed' : 'short';
      const store = loadProgressStore();
      const level: LearningLevel = req.body?.level || store.settings.learningLevel || 'Intermediate';
      const language: string = req.body?.language || store.settings.preferredLanguage || 'English';

      if (!text || typeof text !== 'string' || text.trim().length < 20) {
        res.status(400).json({
          error: true,
          message: 'Please paste at least a short paragraph of study material (minimum 20 characters) to summarize.',
        });
        return;
      }

      if (text.length > 30000) {
        res.status(400).json({
          error: true,
          message: 'Study material exceeds the 30,000-character limit. Please summarize one chapter or section at a time.',
        });
        return;
      }

      const summaryResult = await generateSummary({
        text: text.trim(),
        mode,
        level,
        language,
      });

      const firstLine = text.trim().split('\n')[0].slice(0, 50) || 'Study Notes Summary';
      const updatedProgress = recordStudyActivity({
        activityType: 'Summary',
        topic: `${firstLine}...`,
        durationMinutes: 12,
      });

      res.json({
        ...summaryResult,
        progress: updatedProgress,
      });
    } catch (error) {
      handleApiError(res, error, 'Unable to summarize your study material right now.');
    }
  };

  app.post('/summarize', handleSummarize);
  app.post('/api/summarize', handleSummarize);

  // ============================================================================
  // 4. Quiz Generator Endpoint: POST /quiz (plus /api/quiz alias)
  // ============================================================================
  const handleQuiz = async (req: Request, res: Response) => {
    try {
      const topic = req.body?.topic || '';
      const numQuestions = Number(req.body?.numQuestions) || 5;
      const difficulty = ['Easy', 'Medium', 'Hard'].includes(req.body?.difficulty)
        ? req.body.difficulty
        : 'Medium';
      const store = loadProgressStore();
      const level: LearningLevel = req.body?.level || store.settings.learningLevel || 'Intermediate';
      const language: string = req.body?.language || store.settings.preferredLanguage || 'English';

      if (!topic || typeof topic !== 'string' || !topic.trim()) {
        res.status(400).json({
          error: true,
          message: 'Please enter a topic or paste study material to generate a quiz.',
        });
        return;
      }

      const quizData = await generateQuizQuestions({
        topic: topic.trim(),
        numQuestions,
        difficulty,
        level,
        language,
      });

      res.json(quizData);
    } catch (error) {
      handleApiError(res, error, 'Unable to generate quiz questions right now.');
    }
  };

  app.post('/quiz', handleQuiz);
  app.post('/api/quiz', handleQuiz);

  // ============================================================================
  // 5. Learning Recommendations & Roadmap Endpoint:
  //    GET /learn/recommendations and POST /learn/recommendations
  // ============================================================================
  const handleRecommendations = async (req: Request, res: Response) => {
    try {
      const store = loadProgressStore();
      const subject =
        (req.method === 'GET' ? (req.query.subject as string) : req.body?.subject) || '';
      const generateNew =
        req.method === 'POST' || Boolean(req.query.generate === 'true' && subject);

      if (!generateNew) {
        res.json({
          roadmap: store.activeRoadmap,
          recommendations: store.recommendations,
          progress: store,
        });
        return;
      }

      if (!subject.trim()) {
        res.status(400).json({
          error: true,
          message: 'Please specify a subject or topic to build your personalized learning path.',
        });
        return;
      }

      const level: LearningLevel =
        (req.body?.level as LearningLevel) ||
        (req.query.level as LearningLevel) ||
        store.settings.learningLevel ||
        'Intermediate';
      const goal: string =
        req.body?.goal ||
        (req.query.goal as string) ||
        `Master core concepts and practical problem-solving in ${subject}`;
      const studyTime: string =
        req.body?.studyTime || (req.query.studyTime as string) || '45 mins / day';

      const generated = await generateLearningPathAndRecommendations({
        subject: subject.trim(),
        level,
        goal,
        studyTime,
        language: store.settings.preferredLanguage,
        studiedTopics: store.studiedTopicsList,
      });

      const updatedProgress = recordStudyActivity({
        activityType: 'Roadmap',
        topic: `${subject.trim()} Learning Path`,
        durationMinutes: 10,
        roadmapUpdate: generated.roadmap,
        recommendationsUpdate: generated.recommendations,
      });

      res.json({
        roadmap: generated.roadmap,
        recommendations: generated.recommendations,
        progress: updatedProgress,
      });
    } catch (error) {
      handleApiError(res, error, 'Unable to generate personalized learning path right now.');
    }
  };

  app.get('/learn/recommendations', handleRecommendations);
  app.post('/learn/recommendations', handleRecommendations);
  app.get('/api/learn/recommendations', handleRecommendations);
  app.post('/api/learn/recommendations', handleRecommendations);

  // ============================================================================
  // 6. Progress & Settings Endpoints:
  //    GET /progress, POST /progress/update, POST /settings, POST /history/clear
  // ============================================================================
  app.get(['/progress', '/api/progress'], (_req: Request, res: Response) => {
    const store = loadProgressStore();
    res.json(store);
  });

  app.post(['/progress/update', '/api/progress/update'], (req: Request, res: Response) => {
    try {
      const {
        activityType,
        topic,
        durationMinutes,
        quizResult,
        toggleStageId,
      } = req.body || {};

      const updated = recordStudyActivity({
        activityType: activityType || 'Explanation',
        topic: topic || 'Study Activity',
        durationMinutes: Number(durationMinutes) || 10,
        quizResult,
        toggleStageId,
      });

      res.json(updated);
    } catch (error) {
      handleApiError(res, error, 'Failed to update learning progress.');
    }
  });

  app.post(['/settings', '/api/settings'], (req: Request, res: Response) => {
    try {
      const updated = updateSettingsStore(req.body || {});
      res.json(updated);
    } catch (error) {
      handleApiError(res, error, 'Failed to save user settings.');
    }
  });

  app.post(['/history/clear', '/api/history/clear'], (_req: Request, res: Response) => {
    try {
      const reset = clearHistoryStore();
      res.json(reset);
    } catch (error) {
      handleApiError(res, error, 'Failed to clear study history.');
    }
  });

  // ============================================================================
  // Vite Middleware (Dev) or Static Assets (Prod)
  // ============================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduGenie server running on http://localhost:${PORT}`);
  });
}

startServer();
