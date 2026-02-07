
import { GoogleGenAI, Type } from "@google/genai";
import { AIStarterResponse, Task } from "../types";

// Always use the required initialization format
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIStarterKit = async (task: Task): Promise<AIStarterResponse> => {
  // Using flash for better speed and quota availability for routine analysis
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the following student task and provide a "Help Me Start" guide. 
    Task Title: ${task.title}
    Task Description: ${task.description || 'No description provided.'}
    Course Context: ${task.courseId}
    
    Return a structured JSON object with:
    1. A concise summary of requirements.
    2. Exactly 5 actionable, small steps to get started.
    3. An estimation of time to complete in hours.
    4. A list of key topics to review.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          steps: { type: Type.ARRAY, items: { type: Type.STRING } },
          estimatedTime: { type: Type.STRING },
          linkedResources: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["summary", "steps", "estimatedTime", "linkedResources"]
      }
    }
  });

  // Directly access .text property per guidelines
  const text = response.text;
  if (!text) throw new Error("Empty response from AI");
  return JSON.parse(text.trim());
};

export const chatWithAgent = async (message: string, history: any[]) => {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'You are AcademiQ, an autonomous AI study workspace coordinator. Your goal is to help students arrange their schedule, manage tasks, and optimize their study environment. Be concise, sharp, and encouraging. You can suggest specific schedule shifts if the user asks about their workload.',
    },
  });
  
  const response = await chat.sendMessage({ message });
  return response.text;
};

export const generateWeeklyPlan = async (tasks: Task[], preferences: any) => {
  const prompt = `Create a weekly study plan for a student who prefers to work ${preferences.workStyle}.
  Tasks for the week: ${JSON.stringify(tasks.filter(t => !t.completed))}
  
  Generate a schedule of time blocks. Also, identify if there are any major overlaps or high-stress periods.
  
  Format the response as JSON with:
  - timeBlocks: array of {day, startTime, duration, title, type, color}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text.trim());
};

export const parseSyllabus = async (text: string) => {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Extract all deadlines, exams, and projects from the following syllabus text. Format as a JSON array of objects with keys: title, deadline (YYYY-MM-DD), type, points.
        
        Syllabus text:
        ${text}`,
        config: {
            responseMimeType: "application/json"
        }
    });
    return JSON.parse(response.text.trim());
}
