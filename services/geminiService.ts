import { GoogleGenAI, Type, Schema, Chat } from "@google/genai";
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

export const agentService = {
  createChat(): Chat {
    const ai = getClient();
    return ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "You are a helpful and expert AI software development assistant integrated into the BMAD Studio IDE. Help users with coding, debugging, architecture, and explaining the generated artifacts.",
      }
    });
  },

  async generateUserStories(input: string, repo?: Repository, feedback?: string, existingStories?: UserStory[]): Promise<UserStory[]> {
    const ai = getClient();
    const context = repo 
      ? `Repository Context: "${repo.name}" (${repo.language}). Description: "${repo.description}".\nUser Request: "${input}".`
      : `New Project Request: "${input}".`;

    let prompt = `You are GitHub Copilot Workspace, an advanced AI system for project planning.
      
      Task: Analyze the request and break it down into professional User Stories.
      Context: ${context}
      
      Return a JSON array of stories. Each story must have acceptance criteria.`;

    if (feedback && existingStories && existingStories.length > 0) {
      prompt = `You are GitHub Copilot Workspace, acting as a Product Owner.
      
      Task: Refine the existing User Stories based on the user's feedback.
      
      Original Request Context: ${context}
      
      Current User Stories:
      ${JSON.stringify(existingStories, null, 2)}
      
      User Feedback for Refinement:
      "${feedback}"
      
      Instructions:
      1. Review the feedback and the current stories.
      2. Modify, add, or remove stories to address the feedback.
      3. Ensure Acceptance Criteria are detailed and testable.
      4. Maintain the existing ID format if preserving a story, generate new IDs for new stories.
      
      Return the updated JSON array of stories.`;
    } else if (feedback) {
      prompt += `\n\nCRITICAL: The user has reviewed the previous stories and provided feedback for refinement.
      Feedback: "${feedback}"
      
      Regenerate the user stories, incorporating this feedback. Modify, add, or remove stories as requested to better fit the user's needs.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: userStorySchema,
      }
    });
    
    if (response.text) {
      return JSON.parse(response.text) as UserStory[];
    }
    throw new Error("Copilot Workspace failed to generate stories");
  },

  async generateDevTasks(stories: UserStory[], feedback?: string): Promise<DevTask[]> {
    const ai = getClient();
    const storiesJson = JSON.stringify(stories);
    
    let prompt = `You are the BMAD Orchestrator (Behavioral Multi-Agent Developer).
      
      Task: Convert these User Stories into granular Development Tasks (GitHub Issues style).
      Format: Use 'TASK-101', 'TASK-102' for keys.
      Stories: ${storiesJson}
      
      Assign all tasks to 'COPILOT_CORE'.`;
      
    if (feedback) {
        prompt += `\n\nIMPORTANT: The user has requested changes to the previous plan. 
        Feedback: "${feedback}"
        Adjust the tasks accordingly to address this feedback.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: devTaskSchema,
      }
    });

    if (response.text) {
      const rawTasks = JSON.parse(response.text) as any[];
      return rawTasks.map(t => ({
        ...t,
        assignee: AgentRole.COPILOT_CORE,
        status: 'TODO'
      }));
    }
    throw new Error("BMAD Orchestrator failed to plan tasks");
  },

  async generateCode(tasks: DevTask[], projectContext: string, repo?: Repository, feedback?: string): Promise<CodeFile[]> {
    const ai = getClient();
    const tasksJson = JSON.stringify(tasks);
    
    const repoContext = repo 
      ? `Existing Repo: "${repo.name}" (${repo.language}).` 
      : "Context: New Project Initialization.";

    let prompt = `You are GitHub Copilot Core, an expert AI pair programmer.
      
      Task: Implement the following tasks by writing the necessary code files.
      Input Tasks: ${tasksJson}
      ${repoContext}
      Original Request: ${projectContext}
      
      MANDATORY REQUIREMENTS:
      1. Write clean, modern, production-ready code.
      2. For EVERY implementation file (e.g., 'utils.ts'), you MUST generate a corresponding test file (e.g., 'utils.test.ts').
      3. **TESTING STRICTNESS**: Test files must be comprehensive. Include positive cases, negative cases, and edge cases. 
      4. Ensure 90% logic coverage.
      5. Include necessary configuration files.`;

    if (feedback) {
        prompt += `\n\nCRITICAL REWORK INSTRUCTION: The user rejected the previous implementation.
        Feedback: "${feedback}"
        You MUST adjust the code to satisfy this feedback while maintaining the tasks.`;
    }

    prompt += `\n\nOutput: JSON object with a 'files' array.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: codeFileSchema,
      }
    });

    if (response.text) {
      const result = JSON.parse(response.text);
      return result.files as CodeFile[];
    }
    throw new Error("Copilot Core failed to generate code");
  },

  async generateOnboardingArtifacts(repo: Repository): Promise<CodeFile[]> {
    const ai = getClient();
    
    let prompt = `You are the BMAD Onboarding Agent.
      
      Task: Generate compliance and test artifacts for an existing repository to make it "BMAD Compliant".
      Repository: "${repo.name}" (${repo.language}).
      
      Requirements:
      1. Generate a 'bmad.config.json' file with project settings.
      2. Generate a '.github/workflows/bmad-ci.yml' for CI/CD.
      3. Generate a 'SECURITY.md' policy.
      4. Simulate scanning the repo and generate 2 mock source files (e.g., 'core.ts', 'api.ts') and their corresponding TEST files ('core.test.ts', 'api.test.ts') that achieve high coverage.
      
      The goal is to show the user that we have back-filled the missing tests.
      
      Output: JSON object with a 'files' array.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: codeFileSchema,
      }
    });

    if (response.text) {
        const result = JSON.parse(response.text);
        return result.files as CodeFile[];
    }
    throw new Error("Onboarding generation failed");
  },

  async generateProjectDocs(stories: UserStory[], tasks: DevTask[]): Promise<CodeFile[]> {
    const ai = getClient();
    const storiesJson = JSON.stringify(stories);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are the Lead Technical Writer and QA Architect for this project.
      
      Task: Generate comprehensive documentation and a test plan.
      Input Stories: ${storiesJson}
      
      Requirements:
      1. **TECHNICAL_ARCHITECTURE.md**: Explain the system design, components, and data flow.
      2. **USER_GUIDE.md**: A functional manual for end-users explaining how to use the features.
      3. **TEST_PLAN.md**: A detailed list of Test Cases.
         - Format: table or list.
         - Columns: ID, Description, Pre-conditions, Expected Result.
         - Must cover Happy Path, Error Handling, and Boundary values for the User Stories.
         
      Return the response as a JSON object with a 'files' array containing these 3 files.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: codeFileSchema,
      }
    });

    if (response.text) {
      const result = JSON.parse(response.text);
      return result.files as CodeFile[];
    }
    return [];
  },

  async reviewCode(files: CodeFile[]): Promise<CodeReviewComment[]> {
    const ai = getClient();
    const filesJson = JSON.stringify(files.map(f => ({ path: f.path, content: f.content.substring(0, 1000) })));
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are Copilot Security (powered by CodeQL).
      
      Task: Perform a security and quality audit on the following code files.
      Files: ${filesJson}
      
      Focus on:
      1. Security vulnerabilities (OWASP Top 10)
      2. Compliance with BMAD standards (ensure tests exist)
      3. Code quality and best practices
      
      Return a JSON array of review comments.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: reviewSchema,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as CodeReviewComment[];
    }
    throw new Error("Copilot Security audit failed");
  }
};