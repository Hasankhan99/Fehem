import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Server-side Gemini client
  function getGeminiClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // In-memory store for user learning records and synced progress
  const userRecordsStore: Record<string, any> = {};

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // User Record Tracking API (Google Auth & guest sync)
  app.get("/api/user/record", (req, res) => {
    const userId = (req.query.userId as string) || (req.query.email as string);
    if (!userId) {
      return res.status(400).json({ error: "userId or email query param required" });
    }
    const record = userRecordsStore[userId] || null;
    res.json({ status: "ok", record });
  });

  app.post("/api/user/record", (req, res) => {
    const { userId, email, data } = req.body;
    const key = userId || email;
    if (!key || !data) {
      return res.status(400).json({ error: "userId and data payload required" });
    }
    userRecordsStore[key] = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    res.json({ status: "ok", record: userRecordsStore[key] });
  });

  // AI Micro-Reel Generation Endpoint
  app.post("/api/generate-reel", async (req, res) => {
    try {
      const { topic, type = "all" } = req.body;

      if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
        return res.status(400).json({ error: "Topic is required" });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key is not configured in the environment. Please check the Secrets panel.",
        });
      }

      const prompt = `You are designing a high-impact, single-concept micro-learning social media Reel on psychology, human behavior, mindset, habits, productivity, or personal development.
User Topic or Book Request: "${topic.trim()}".
Requested Focus: "${type}".

CRITICAL GUIDELINES:
1. NO CODE DETECTION: Do NOT generate code snippets, programming tutorials, or software engineering content. Focus purely on psychology, human behavior, mindset, habits, productivity, and personal development.
2. DO NOT SUMMARIZE THE ENTIRE BOOK: Select ONE specific, high-leverage concept, mental model, principle, or behavioral mechanism from the book or topic.
3. SINGLE CLEAR IDEA: Explain that single idea in a simple, captivating, and practical way for social media audiences (like an Instagram Reel / TikTok insight).
4. BOOK INSPIRATION: Choose concepts from world-class psychology and personal development literature such as:
   - Atomic Habits (James Clear)
   - Deep Work (Cal Newport)
   - The 7 Habits of Highly Effective People (Stephen R. Covey)
   - Eat That Frog! (Brian Tracy)
   - The Power of Habit (Charles Duhigg)
   - Getting Things Done (David Allen)
   - Mindset: The New Psychology of Success (Carol S. Dweck)
   - Thinking, Fast and Slow (Daniel Kahneman)
   - The Subtle Art of Not Giving a F*ck (Mark Manson)
   - The Mountain Is You (Brianna Wiest)
   - The Daily Stoic (Ryan Holiday)
   - Grit: The Power of Passion and Perseverance (Angela Duckworth)
   - How to Win Friends and Influence People (Dale Carnegie)
   - Never Split the Difference (Chris Voss)
   - Crucial Conversations (Kerry Patterson, Joseph Grenny, Ron McMillan, and Al Switzler)
   - Daring Greatly (Brené Brown)
   - Man’s Search for Meaning (Viktor E. Frankl)
   - The Psychology of Money (Morgan Housel)
   - The Power of Now (Eckhart Tolle)
   - Essentialism: The Disciplined Pursuit of Less (Greg McKeown)
5. QUOTE & ANIMATION ALIGNMENT:
   Provide an exact quote and 3 progressive synchronized quote phases that align directly with the animated visual mechanism:
   - Phase 0 (The Trigger / Stimulus / Problem)
   - Phase 1 (The Space / Mechanism / Shift)
   - Phase 2 (The Golden Rule / Transformation)
   Map to the most accurate visualConceptType: 'habit-loop' | 'system1-system2' | 'stimulus-response-gap' | 'eisenhower-matrix' | 'growth-mindset' | 'deep-work-funnel' | 'tactical-empathy' | 'dichotomy-of-control' | 'eat-that-frog' | 'grit-equation' | 'crucial-conversations' | 'domino-effect' | 'ikigai' | 'essentialism-filter' | 'psychology-money' | 'power-of-now' | 'mountain-is-you' | 'daring-greatly' | 'subtle-art-values' | 'win-friends' | 'gtd-workflow' | 'compounding-curve'.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "You are a master psychology communicator and social media educator specializing in human behavior, behavioral economics, cognitive biases, and habit formation. You distill single life-altering concepts into unforgettable, visually synchronized micro-reels with zero fluff.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Punchy, magnetic title under 45 characters focusing on ONE concept" },
              subtitle: { type: Type.STRING, description: "Book name and author, e.g. 'Thinking, Fast and Slow by Daniel Kahneman'" },
              category: {
                type: Type.STRING,
                description: "Must be one of: psychology, habits, mindset, productivity, communication",
              },
              source: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Book name" },
                  authorOrTopic: { type: Type.STRING, description: "Author name" },
                  tag: { type: Type.STRING, description: "Short category badge e.g. 'Cognitive Psychology' or 'Habit Loop'" },
                },
                required: ["name", "authorOrTopic", "tag"],
              },
              coreIdea: {
                type: Type.STRING,
                description: "The core unforgettable insight or direct book quote (under 140 chars)",
              },
              quoteAuthor: {
                type: Type.STRING,
                description: "Author attributed to the quote",
              },
              quotePhases: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phase: { type: Type.INTEGER, description: "0, 1, or 2" },
                    stepLabel: { type: Type.STRING, description: "e.g. 'The Stimulus', 'The Choice', 'The Growth'" },
                    text: { type: Type.STRING, description: "Phase text fragment" },
                    emphasis: { type: Type.STRING, description: "Key takeaway phrase" },
                  },
                  required: ["phase", "stepLabel", "text"],
                },
                description: "Exactly 3 progressive phases of the quote synchronized with the visual animation",
              },
              visualConceptType: {
                type: Type.STRING,
                description: "Visual concept animation type: habit-loop, system1-system2, stimulus-response-gap, eisenhower-matrix, growth-mindset, deep-work-funnel, tactical-empathy, dichotomy-of-control, eat-that-frog, grit-equation, crucial-conversations, domino-effect, ikigai, essentialism-filter, psychology-money, power-of-now, mountain-is-you, daring-greatly, subtle-art-values, win-friends, gtd-workflow, or compounding-curve",
              },
              conceptAnimationLabel: {
                type: Type.STRING,
                description: "Short label for the graphic e.g. 'System 1 vs System 2 Dual-Process'",
              },
              estimatedReadSeconds: {
                type: Type.INTEGER,
                description: "Estimated micro-read time, typically 25 to 35 seconds",
              },
              takeaways: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    point: { type: Type.STRING, description: "Short bold summary phrase" },
                    detail: { type: Type.STRING, description: "Crisp, practical real-life explanation" },
                    isActionable: { type: Type.BOOLEAN },
                  },
                  required: ["point", "detail", "isActionable"],
                },
                description: "Exactly 3 bite-sized key takeaways breaking down the single concept",
              },
              mentalModel: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Name of the mental model or behavioral rule" },
                  description: { type: Type.STRING, description: "Concise definition" },
                  formulaOrRule: { type: Type.STRING, description: "Punchy rule or heuristic e.g. 'Stimulus -> Space -> Response'" },
                },
                required: ["name", "description", "formulaOrRule"],
              },
              immediateActionChallenge: {
                type: Type.STRING,
                description: "Specific 2-minute actionable challenge the viewer can test right now",
              },
              quiz: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: "Quick psychology comprehension check question" },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Exactly 4 options",
                  },
                  correctIndex: { type: Type.INTEGER, description: "Index of correct option 0-3" },
                  explanation: { type: Type.STRING, description: "Why that option is correct based on the psychological principle" },
                },
                required: ["question", "options", "correctIndex", "explanation"],
              },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              audioScript: {
                type: Type.STRING,
                description: "Engaging 25-35 second spoken social media script for text-to-speech audio narration",
              },
            },
            required: [
              "title",
              "subtitle",
              "category",
              "source",
              "coreIdea",
              "quotePhases",
              "visualConceptType",
              "conceptAnimationLabel",
              "estimatedReadSeconds",
              "takeaways",
              "mentalModel",
              "immediateActionChallenge",
              "quiz",
              "tags",
              "audioScript",
            ],
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("No response generated by model");
      }

      const parsedReel = JSON.parse(text);
      // Attach generated id and likesCount
      const reelWithMeta = {
        ...parsedReel,
        id: `gen-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        likesCount: Math.floor(Math.random() * 80) + 120,
        createdAt: new Date().toISOString(),
        isUserGenerated: true,
      };

      return res.json({ reel: reelWithMeta });
    } catch (err: unknown) {
      console.error("Error generating reel:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to generate reel";
      return res.status(500).json({ error: errorMessage });
    }
  });

  // Vite development middleware or static serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Fehem server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Server startup error:", err);
  process.exit(1);
});
