import { GoogleGenAI, Type } from '@google/genai';
import type {
  LearningLevel,
  TopicExplanation,
  SummaryResult,
  QuizData,
  LearningRoadmap,
  RecommendationItem,
} from '../src/types/edugenie.ts';

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured on the server. Please check your environment secrets.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const MODEL_NAME = 'gemini-3.8-flash';

export async function generateQaResponse(params: {
  question: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  level?: LearningLevel;
  language?: string;
}): Promise<{ answer: string; followUpQuestions: string[] }> {
  const ai = getAiClient();
  const level = params.level || 'Intermediate';
  const language = params.language || 'English';

  const historyContext =
    params.history && params.history.length > 0
      ? '\nRecent conversation context:\n' +
        params.history
          .slice(-6)
          .map((m) => `${m.role === 'user' ? 'Student' : 'EduGenie'}: ${m.content}`)
          .join('\n')
      : '';

  const prompt = `Student Question: ${params.question}${historyContext}`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      systemInstruction: `You are EduGenie, a personal AI learning assistant designed for university and high-school students.
Student Level: ${level}. Preferred Language: ${language}.
Guidelines:
- Provide a clear, educational, well-structured, and accurate response in Markdown format.
- For programming or technical questions, include properly formatted fenced code blocks with language tags and brief line-by-line explanations.
- For academic topics, use clear Markdown headings (###), bullet points, concrete examples, and a brief takeaway summary.
- Return a JSON object containing "answer" (the full Markdown response) and "followUpQuestions" (exactly 3 insightful follow-up questions the student can click next).`,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          answer: {
            type: Type.STRING,
            description: 'Well-structured educational answer in Markdown format.',
          },
          followUpQuestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '3 relevant follow-up questions to deepen understanding.',
          },
        },
        required: ['answer', 'followUpQuestions'],
      },
    },
  });

  const rawText = response.text?.trim();
  if (!rawText) {
    throw new Error('EduGenie received an empty response from the AI model. Please try again.');
  }

  const parsed = JSON.parse(rawText);
  return {
    answer: parsed.answer || 'No explanation generated.',
    followUpQuestions: Array.isArray(parsed.followUpQuestions)
      ? parsed.followUpQuestions.slice(0, 3)
      : [],
  };
}

export async function generateTopicExplanation(params: {
  topic: string;
  simplify?: boolean;
  level?: LearningLevel;
  language?: string;
  engineMode?: 'gemini-structured' | 'lamini-flan-t5';
}): Promise<TopicExplanation> {
  const ai = getAiClient();
  const level = params.level || 'Intermediate';
  const language = params.language || 'English';
  const simplify = Boolean(params.simplify);
  const engineMode = params.engineMode || 'lamini-flan-t5';

  const simplifyInstruction = simplify
    ? 'IMPORTANT: The student clicked "Simplify More". Use everyday analogies, step-by-step intuition, zero unexplained jargon, and crystal-clear language that even a first-time learner can grasp immediately.'
    : `Tailor the depth and terminology for a ${level}-level student.`;

  const engineInstruction =
    engineMode === 'lamini-flan-t5'
      ? 'Synthesize the core explanation with the crisp, direct instruction-following conciseness of the LaMini-Flan-T5 explanation module enhanced by Gemini pedagogical structuring.'
      : 'Use deep academic Gemini synthesis with comprehensive analytical clarity.';

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Explain the academic/technical topic: "${params.topic}".
Language: ${language}.
${simplifyInstruction}
${engineInstruction}`,
    config: {
      systemInstruction: `You are EduGenie's Topic Explanation Engine. Break down any topic into 6 structured pedagogical sections so students can understand faster and revise effectively.`,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          definition: {
            type: Type.STRING,
            description: 'Precise, formal academic definition of the topic (2-3 sentences).',
          },
          simpleExplanation: {
            type: Type.STRING,
            description:
              'Intuitive, plain-language explanation using relatable mental models or analogies.',
          },
          keyPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '4 to 6 essential conceptual bullet points.',
          },
          example: {
            type: Type.STRING,
            description:
              'A concrete worked example, scientific scenario, or code snippet illustrating the concept in action.',
          },
          realWorldApplication: {
            type: Type.STRING,
            description:
              'How this concept is applied in industry, technology, nature, or daily life.',
          },
          quickRevision: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '3 to 4 rapid-fire exam revision takeaways or flashcards.',
          },
        },
        required: [
          'definition',
          'simpleExplanation',
          'keyPoints',
          'example',
          'realWorldApplication',
          'quickRevision',
        ],
      },
    },
  });

  const rawText = response.text?.trim();
  if (!rawText) {
    throw new Error('Could not generate topic explanation. Please try again.');
  }

  const parsed = JSON.parse(rawText);
  return {
    topic: params.topic.trim(),
    level,
    simplified: simplify,
    engineUsed:
      engineMode === 'lamini-flan-t5'
        ? 'Hybrid LaMini-Flan-T5 + Gemini Pedagogical Engine'
        : 'Gemini Deep Academic Engine',
    definition: parsed.definition,
    simpleExplanation: parsed.simpleExplanation,
    keyPoints: parsed.keyPoints || [],
    example: parsed.example,
    realWorldApplication: parsed.realWorldApplication,
    quickRevision: parsed.quickRevision || [],
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

export async function generateSummary(params: {
  text: string;
  mode: 'short' | 'detailed';
  level?: LearningLevel;
  language?: string;
}): Promise<SummaryResult> {
  const ai = getAiClient();
  const level = params.level || 'Intermediate';
  const language = params.language || 'English';
  const mode = params.mode === 'detailed' ? 'detailed' : 'short';

  const wordCountOriginal = params.text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const modeInstruction =
    mode === 'short'
      ? 'Produce a high-impact Executive Short Summary (1 concise paragraph, ~80-130 words) plus 4-5 crisp key points.'
      : 'Produce a comprehensive Detailed Study Summary (2-3 well-organized paragraphs covering all core arguments, mechanisms, and conclusions) plus 6-8 thorough key points.';

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Study Material to Summarize:\n"""\n${params.text}\n"""\n\nMode: ${mode.toUpperCase()}\nStudent Level: ${level}\nLanguage: ${language}\n${modeInstruction}`,
    config: {
      systemInstruction:
        'You are EduGenie Study Summarizer. Distill lecture notes, textbook chapters, and research articles into structured, exam-ready summaries, key points, and glossary terms.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.STRING,
            description: 'The synthesized study summary paragraph(s).',
          },
          keyPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Core bullet-point takeaways from the text.',
          },
          importantTerms: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING },
                definition: { type: Type.STRING },
              },
              required: ['term', 'definition'],
            },
            description: '4 to 6 important technical or academic terms extracted from the material.',
          },
        },
        required: ['summary', 'keyPoints', 'importantTerms'],
      },
    },
  });

  const rawText = response.text?.trim();
  if (!rawText) {
    throw new Error('Failed to summarize the provided study material.');
  }

  const parsed = JSON.parse(rawText);
  const summaryText: string = parsed.summary || '';
  const wordCountSummary = summaryText
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return {
    mode,
    summary: summaryText,
    keyPoints: parsed.keyPoints || [],
    importantTerms: parsed.importantTerms || [],
    wordCountOriginal,
    wordCountSummary,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

export async function generateQuizQuestions(params: {
  topic: string;
  numQuestions?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  level?: LearningLevel;
  language?: string;
}): Promise<QuizData> {
  const ai = getAiClient();
  const count = Math.min(15, Math.max(3, Number(params.numQuestions) || 5));
  const difficulty = params.difficulty || 'Medium';
  const level = params.level || 'Intermediate';
  const language = params.language || 'English';

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Generate a ${count}-question multiple-choice quiz based on the following topic or study material:
"${params.topic}"
Difficulty: ${difficulty}
Student Level: ${level}
Language: ${language}`,
    config: {
      systemInstruction: `You are EduGenie's Assessment & Quiz Generator.
Create rigorous, unambiguous multiple-choice questions with exactly 4 options each (do NOT prefix the option strings with "A.", "B.", etc. — the UI renders the A/B/C/D badges).
Provide a clear, educational explanation for why the correct answer is right and why common misconceptions fail.`,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topicTitle: {
            type: Type.STRING,
            description: 'Clean, concise title for the quiz topic.',
          },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: {
                  type: Type.STRING,
                  description: 'The question prompt.',
                },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Exactly 4 distinct answer choices.',
                },
                correctAnswerIndex: {
                  type: Type.INTEGER,
                  description: 'Zero-based index (0, 1, 2, or 3) of the correct option.',
                },
                explanation: {
                  type: Type.STRING,
                  description: 'Educational explanation of the correct answer.',
                },
              },
              required: ['question', 'options', 'correctAnswerIndex', 'explanation'],
            },
          },
        },
        required: ['topicTitle', 'questions'],
      },
    },
  });

  const rawText = response.text?.trim();
  if (!rawText) {
    throw new Error('Failed to generate quiz questions. Please try again.');
  }

  const parsed = JSON.parse(rawText);
  const questions = (parsed.questions || []).map((q: any, idx: number) => ({
    id: idx + 1,
    question: q.question,
    options: Array.isArray(q.options) ? q.options.slice(0, 4) : ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswerIndex:
      typeof q.correctAnswerIndex === 'number' && q.correctAnswerIndex >= 0 && q.correctAnswerIndex <= 3
        ? q.correctAnswerIndex
        : 0,
    explanation: q.explanation || 'Review the core concepts for this question.',
  }));

  return {
    topic: parsed.topicTitle || params.topic.slice(0, 60),
    difficulty,
    questions,
  };
}

export async function generateLearningPathAndRecommendations(params: {
  subject: string;
  level: LearningLevel;
  goal: string;
  studyTime: string;
  language?: string;
  studiedTopics?: string[];
}): Promise<{ roadmap: LearningRoadmap; recommendations: RecommendationItem[] }> {
  const ai = getAiClient();
  const language = params.language || 'English';

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Create a structured 7-stage personalized learning roadmap and 3 targeted next-step recommendations for:
Subject / Topic: ${params.subject}
Current Level: ${params.level}
Learning Goal: ${params.goal}
Available Study Time: ${params.studyTime}
Preferred Language: ${language}
Previously Studied Topics: ${(params.studiedTopics || []).slice(0, 6).join(', ') || 'None yet'}`,
    config: {
      systemInstruction: `You are EduGenie's Curriculum Architect. Design a progressive 7-stage learning roadmap tailored to the student's current level, goal, and daily study time.
Each stage must include a clear topic title, difficulty ('Beginner', 'Intermediate', or 'Advanced'), estimated time, concise description, and a hands-on practice activity.`,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          stages: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                stageNumber: {
                  type: Type.STRING,
                  description: 'Two-digit stage number like "01", "02", ..., "07".',
                },
                topic: {
                  type: Type.STRING,
                  description: 'Title of the stage module.',
                },
                difficulty: {
                  type: Type.STRING,
                  description: 'Beginner, Intermediate, or Advanced',
                },
                estimatedTime: {
                  type: Type.STRING,
                  description: 'Estimated time to complete (e.g., "45 mins", "1.5 hours").',
                },
                description: {
                  type: Type.STRING,
                  description: 'What the student will learn and why it matters.',
                },
                practiceActivity: {
                  type: Type.STRING,
                  description: 'A concrete mini-exercise or problem to solve.',
                },
              },
              required: [
                'stageNumber',
                'topic',
                'difficulty',
                'estimatedTime',
                'description',
                'practiceActivity',
              ],
            },
          },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                category: { type: Type.STRING },
                difficulty: { type: Type.STRING },
                estimatedMinutes: { type: Type.INTEGER },
                reason: { type: Type.STRING },
                targetTopic: { type: Type.STRING },
                actionModule: {
                  type: Type.STRING,
                  description: 'One of: explain, quiz, ask-ai',
                },
              },
              required: [
                'title',
                'category',
                'difficulty',
                'estimatedMinutes',
                'reason',
                'targetTopic',
                'actionModule',
              ],
            },
          },
        },
        required: ['stages', 'recommendations'],
      },
    },
  });

  const rawText = response.text?.trim();
  if (!rawText) {
    throw new Error('Failed to generate personalized learning path.');
  }

  const parsed = JSON.parse(rawText);
  const stages = (parsed.stages || []).map((s: any, idx: number) => ({
    id: `stage-${Date.now()}-${idx + 1}`,
    stageNumber: String(idx + 1).padStart(2, '0'),
    topic: s.topic,
    difficulty: (['Beginner', 'Intermediate', 'Advanced'].includes(s.difficulty)
      ? s.difficulty
      : params.level) as LearningLevel,
    estimatedTime: s.estimatedTime || '45 mins',
    description: s.description,
    practiceActivity: s.practiceActivity,
    completed: false,
  }));

  const recommendations: RecommendationItem[] = (parsed.recommendations || [])
    .slice(0, 3)
    .map((r: any, idx: number) => ({
      id: `rec-${Date.now()}-${idx + 1}`,
      title: r.title,
      category: r.category || params.subject,
      difficulty: (['Beginner', 'Intermediate', 'Advanced'].includes(r.difficulty)
        ? r.difficulty
        : params.level) as LearningLevel,
      estimatedMinutes: Number(r.estimatedMinutes) || 20,
      reason: r.reason,
      targetTopic: r.targetTopic || r.title,
      actionModule: (['explain', 'quiz', 'ask-ai'].includes(r.actionModule)
        ? r.actionModule
        : 'explain') as 'explain' | 'quiz' | 'ask-ai',
    }));

  return {
    roadmap: {
      id: `roadmap-${Date.now()}`,
      subject: params.subject.trim(),
      level: params.level,
      goal: params.goal.trim(),
      studyTime: params.studyTime.trim(),
      stages,
      updatedAt: 'Just now',
    },
    recommendations,
  };
}
