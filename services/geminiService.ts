import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserStory, DevTask, CodeFile, CodeReviewComment, AgentRole, Repository } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY is missing");
  return new GoogleGenAI({ apiKey });
};

// Schema Definitions

const userStorySchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      acceptanceCriteria: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    },
    required: ["id", "title", "description", "acceptanceCriteria"]
  }
};

const devTaskSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      key: { type: Type.STRING },
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      linkedStoryId: { type: Type.STRING },
      assignee: { type: Type.STRING } 
    },
    required: ["id", "key", "title", "description", "linkedStoryId", "assignee"]
  }
};

const codeFileSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    files: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          path: { type: Type.STRING },
          content: { type: Type.STRING },
          language: { type: Type.STRING }
        },
        required: ["path", "content", "language"]
      }
    }
  }
};

const reviewSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      file: { type: Type.STRING },
      severity: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
      comment: { type: Type.STRING },
      suggestion: { type: Type.STRING }
    },
    required: ["file", "severity", "comment"]
  }
};

export const geminiService = {
  async generateUserStories(input: string, repo?: Repository): Promise<UserStory[]> {
    const ai = getClient();
    const context = repo 
      ? `The project is an existing repository named "${repo.name}" (${repo.language}) described as: "${repo.description}". The user wants to create a feature/update: "${input}".`
      : `The project is a new idea: "${input}".`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert Product Owner. Create a list of detailed agile user stories for the following request. ${context} Generate at least 3 stories.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: userStorySchema,
      }
    });
    
    if (response.text) {
      return JSON.parse(response.text) as UserStory[];
    }
    throw new Error("Failed to generate stories");
  },

  async generateDevTasks(stories: UserStory[]): Promise<DevTask[]> {
    const ai = getClient();
    const storiesJson = JSON.stringify(stories);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a Lead Architect. Convert these user stories into technical development tasks (Jira style). Use 'DEV-101', 'DEV-102' format for keys. Assign them to 'DEVELOPER'.\n\nStories: ${storiesJson}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: devTaskSchema,
      }
    });

    if (response.text) {
      const rawTasks = JSON.parse(response.text) as any[];
      // Enforce specific Typescript structure
      return rawTasks.map(t => ({
        ...t,
        assignee: AgentRole.DEVELOPER,
        status: 'TODO'
      }));
    }
    throw new Error("Failed to generate tasks");
  },

  async generateCode(tasks: DevTask[], projectContext: string, repo?: Repository): Promise<CodeFile[]> {
    const ai = getClient();
    const tasksJson = JSON.stringify(tasks);
    
    const repoContext = repo 
      ? `This is an update to the existing repo "${repo.name}" using ${repo.language}.` 
      : "This is a new project.";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: `You are an expert Full Stack Developer Agent. Write the code based on these tasks: ${tasksJson}. ${repoContext} The prompt was: ${projectContext}.
      
      REQUIREMENTS:
      1. Return a valid application structure (React/Node/Python depending on context).
      2. If updating, assume standard structure exists and provide modified/new files.
      3. Ensure the code is complete and compilable conceptually.
      
      Output ONLY the JSON object containing the files array.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: codeFileSchema,
      }
    });

    if (response.text) {
      const result = JSON.parse(response.text);
      return result.files as CodeFile[];
    }
    throw new Error("Failed to generate code");
  },

  async reviewCode(files: CodeFile[]): Promise<CodeReviewComment[]> {
    const ai = getClient();
    const filesJson = JSON.stringify(files.map(f => ({ path: f.path, content: f.content.substring(0, 1000) }))); // Truncate for token limits if needed
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a Senior Code Reviewer Agent. Review the following code files for potential bugs, security issues, or improvements. Be concise.
      
      Code Files: ${filesJson}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: reviewSchema,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as CodeReviewComment[];
    }
    throw new Error("Failed to review code");
  }
};