
import { GoogleGenAI, ChatSession, FunctionDeclaration, Type, Tool } from "@google/genai";
import { SPARTAN_SYSTEM_INSTRUCTION } from "../constants";

let ai: GoogleGenAI | null = null;
let chatSession: ChatSession | null = null;

// --- Tool Definitions ---
const connectRepositoryTool: FunctionDeclaration = {
  name: "connect_repository",
  description: "Connects a GitHub repository to the Spartan Orchestrator.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      url: {
        type: Type.STRING,
        description: "The full URL of the GitHub repository (e.g., https://github.com/user/repo).",
      },
      branch: {
        type: Type.STRING,
        description: "The branch to monitor (default: main).",
      }
    },
    required: ["url"],
  },
};

const mountDriveTool: FunctionDeclaration = {
  name: "mount_drive",
  description: "Mounts a Google Drive path to the local file system for monitoring.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      path: {
        type: Type.STRING,
        description: "The folder path in Google Drive (e.g., /My Drive/SPARTAN-WORKFORCE/).",
      }
    },
    required: ["path"],
  },
};

const tools: Tool[] = [
  {
    functionDeclarations: [connectRepositoryTool, mountDriveTool],
  },
];

export const initializeGemini = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY not found in environment variables");
    return false;
  }
  
  try {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return true;
  } catch (error) {
    console.error("Failed to initialize Gemini:", error);
    return false;
  }
};

export const getChatSession = async (): Promise<ChatSession> => {
  if (!ai) {
    initializeGemini();
  }

  if (!ai) {
    throw new Error("Gemini AI instance not initialized.");
  }

  if (!chatSession) {
    chatSession = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: SPARTAN_SYSTEM_INSTRUCTION,
        temperature: 0.7,
        tools: tools, 
      },
    });
  }
  
  return chatSession;
};

// Returns the full response object so App.tsx can handle function calls
export const sendMessageToOrchestrator = async (message: string) => {
  try {
    const session = await getChatSession();
    const result = await session.sendMessage({ message });
    return result; 
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};

// Helper to send tool results back to the model
export const sendToolResponse = async (functionCallId: string, name: string, result: any) => {
    try {
        const session = await getChatSession();
        const response = await session.sendMessage({
            parts: [
                {
                    functionResponse: {
                        name: name,
                        response: { result: result }
                    }
                }
            ]
        });
        return response;
    } catch (error) {
        console.error("Error sending tool response:", error);
        throw error;
    }
}
