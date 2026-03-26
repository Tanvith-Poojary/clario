import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AI_SYSTEM_INSTRUCTION } from "../constants";
import { Journey } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const JOURNEY_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A short, calm title for the journey (e.g. 'Navigating Project Stress')" },
    description: { type: Type.STRING, description: "A 1-sentence description of the emotional struggle." },
    phases: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING, description: "The insight or validating thought." },
          action: { type: Type.STRING, description: "One small, micro-action." },
          isCompleted: { type: Type.BOOLEAN, description: "Always false initially" }
        },
        required: ["title", "content", "action", "isCompleted"]
      }
    }
  },
  required: ["title", "description", "phases"]
};

const ANALYSIS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    scoreDelta: { 
      type: Type.INTEGER, 
      description: "A number between -10 and 10 indicating the change in the user's clarity/calmness based on the recent conversation interaction. Positive = clearer/calmer. Negative = more confused/distressed/low mood." 
    },
    reasoning: { 
      type: Type.STRING, 
      description: "A very brief (under 10 words) explanation for the system log." 
    }
  },
  required: ["scoreDelta", "reasoning"]
};

export const generateAIResponse = async (
  userMessage: string,
  chatHistory: { role: string; parts: { text: string }[] }[]
): Promise<string> => {
  try {
    const model = 'gemini-3-flash-preview';

    const formattedHistory = chatHistory.map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: msg.parts
    }));

    const chat = ai.chats.create({
      model: model,
      history: formattedHistory,
      config: {
        systemInstruction: AI_SYSTEM_INSTRUCTION,
        temperature: 0.7, 
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    const result = await chat.sendMessage({ message: userMessage });
    return result.text || "I'm listening, but having trouble finding the words right now.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having a moment of silence (connection error). Please try again in a moment.";
  }
};

export const createJourneyFromChat = async (
  chatHistory: { role: string; parts: { text: string }[] }[]
): Promise<Partial<Journey>> => {
  try {
    const model = 'gemini-3-flash-preview';

    // We summarize the chat context for the model to generate the path
    const prompt = `
      Based on our conversation history, create a "Journey" for this user.
      A Journey is a 3-phase path to clarity.
      
      Rules:
      1. Title should be specific to their situation.
      2. Phases are: Understanding, Validation, and Perspective (or similar flow).
      3. Actions must be "micro-actions" (takes < 2 mins, emotional/mental, not "fix it" tasks).
      4. Tone: Calm, non-judgmental, slow.
    `;

    const formattedHistory = chatHistory.map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: msg.parts
    }));

    const response = await ai.models.generateContent({
      model: model,
      contents: [
        ...formattedHistory.map(h => ({ role: h.role, parts: h.parts })),
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: JOURNEY_SCHEMA,
      }
    });

    let jsonString = response.text || '';
    
    // Clean up markdown code blocks if present
    if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    if (jsonString) {
      try {
        const data = JSON.parse(jsonString);
        // Validate that phases exist to prevent crashes
        if (data && Array.isArray(data.phases) && data.phases.length > 0) {
          return data;
        }
      } catch (e) {
        console.error("JSON Parse Error:", e);
      }
    }
    throw new Error("Invalid generation");

  } catch (error) {
    console.error("Error creating journey, using fallback:", error);
    // Return a generic fallback so the user always gets something
    return {
      title: "Your Personal Path",
      description: "A path created from your recent reflection.",
      phases: [
        {
          title: "Pause",
          content: "You've been carrying a lot. It's okay to set it down for a moment.",
          action: "Take three deep breaths, counting to four on each inhale.",
          isCompleted: false
        },
        {
          title: "Reflection",
          content: "Clarity comes from stillness, not rushing.",
          action: "Write down one word that describes how you want to feel.",
          isCompleted: false
        }
      ]
    };
  }
};

export const analyzeChat = async (
  chatHistory: { role: string; parts: { text: string }[] }[]
): Promise<{ scoreDelta: number, reasoning: string } | null> => {
  try {
    const model = 'gemini-3-flash-preview';
    
    // Strengthened prompt to ensure deflection happens for negative emotions
    const prompt = `
      Analyze the user's latest message in the context of the history for emotional clarity and calmness.
      
      Output JSON only: { "scoreDelta": number, "reasoning": string }

      Scoring Rules (Range -10 to +10):
      - SIGNIFICANT DROP (-5 to -10): User says "I feel low", "sad", "depressed", "hopeless", or expresses crisis.
      - MODERATE DROP (-2 to -4): User expresses worry, fatigue, annoyance, confusion.
      - NEUTRAL (0): Casual conversation, greetings, simple questions.
      - MODERATE RISE (+2 to +4): User feels understood, calmer, or hopeful.
      - SIGNIFICANT RISE (+5 to +10): User has a breakthrough, clear plan, or expresses joy.
      
      BE SENSITIVE: If they say they feel low, the score MUST drop significantly to reflect that.
    `;

    const formattedHistory = chatHistory.map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: msg.parts
    }));

    const response = await ai.models.generateContent({
      model: model,
      contents: [
        ...formattedHistory.map(h => ({ role: h.role, parts: h.parts })),
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA
      }
    });

    let jsonString = response.text || '';
    
    // Robust cleanup to handle cases where model adds text before/after JSON
    const firstBrace = jsonString.indexOf('{');
    const lastBrace = jsonString.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
        jsonString = jsonString.substring(firstBrace, lastBrace + 1);
    } else {
        // Fallback cleanup
        if (jsonString.startsWith('```')) {
            jsonString = jsonString.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
    }

    if (jsonString) {
        return JSON.parse(jsonString);
    }
    return null;

  } catch (error) {
    console.error("Analysis Error:", error);
    return null;
  }
};