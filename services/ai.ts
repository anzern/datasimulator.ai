import { GoogleGenAI, Schema, Type } from "@google/genai";
import { CompanyType, Task, EnvConfig } from "../types";
import { ROADMAP_PROMPT, TASK_DETAIL_PROMPT, ENV_SETUP_PROMPT, SINGLE_TASK_PROMPT, FOLLOWUP_TASK_PROMPT, SOLUTION_WRITEUP_PROMPT } from "../constants";

class AIService {
  private genAI: GoogleGenAI;

  constructor() {
    this.genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  // Helper to parse Tasks from JSON response
  private parseTasks(text: string, startDate: number): Task[] {
      try {
        const rawTasks = JSON.parse(text || "[]");
        return rawTasks.map((t: any, index: number) => {
            const daysToAdd = (index + 1) * 2; 
            const dueDate = new Date(startDate + (daysToAdd * 24 * 60 * 60 * 1000)).toISOString();
            
            return {
            ...t,
            dueDate,
            isCompleted: false,
            detailsLoaded: false,
            subTasks: t.subTasks?.map((st: any) => ({ ...st, isCompleted: false })) || []
            };
        });
      } catch (e) {
          console.error("Failed to parse tasks", e);
          return [];
      }
  }

  private getTaskSchema(): Schema {
    return {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          descriptionShort: { type: Type.STRING },
          difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } },
          subTasks: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING }
                },
                required: ['id', 'title']
            }
          }
        },
        required: ['id', 'title', 'descriptionShort', 'difficulty', 'skills', 'subTasks']
      }
    };
  }

  async generateRoadmap(company: CompanyType, startDate: number): Promise<Task[]> {
    try {
      const result = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Company: ${company.label}. ${ROADMAP_PROMPT}`,
        config: { responseMimeType: "application/json", responseSchema: this.getTaskSchema() }
      });
      return this.parseTasks(result.text || "[]", startDate);
    } catch (error) {
      console.error("Error generating roadmap:", error);
      return [];
    }
  }

  async generateAdditionalTasks(company: CompanyType, difficulty: string): Promise<Task[]> {
    try {
        const prompt = SINGLE_TASK_PROMPT.replace('{{DIFFICULTY}}', difficulty);
        const result = await this.genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Company: ${company.label}. ${prompt}`,
            config: { responseMimeType: "application/json", responseSchema: this.getTaskSchema() }
        });
        // Start date is now, effectively
        return this.parseTasks(result.text || "[]", Date.now());
    } catch (error) {
        console.error("Error generating additional task:", error);
        return [];
    }
  }

  async generateFollowUpTask(company: CompanyType, parentTaskTitle: string): Promise<Task[]> {
    try {
        const prompt = FOLLOWUP_TASK_PROMPT.replace('{{PARENT_TITLE}}', parentTaskTitle);
        const result = await this.genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Company: ${company.label}. ${prompt}`,
            config: { responseMimeType: "application/json", responseSchema: this.getTaskSchema() }
        });
        return this.parseTasks(result.text || "[]", Date.now());
    } catch (error) {
        console.error("Error generating follow-up task:", error);
        return [];
    }
  }

  async generateImage(prompt: string, aspectRatio: "1:1" | "16:9" = "1:1"): Promise<string | null> {
    try {
      const response = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: {
           imageConfig: { aspectRatio }
        }
      });
      
      for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
              return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
      }
      return null;
    } catch (e) {
      console.error("Error generating image:", e);
      return null;
    }
  }

  async generateTaskDetails(company: CompanyType, task: Task): Promise<Task> {
    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        senderName: { type: Type.STRING },
        senderRole: { type: Type.STRING },
        emailSubject: { type: Type.STRING },
        emailBody: { type: Type.STRING },
        coverImagePrompt: { type: Type.STRING }, // New field
        technicalGuide: { type: Type.STRING },
        assets: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              content: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['csv', 'sql', 'json', 'image'] }
            },
            required: ['name', 'content', 'type']
          }
        },
        quiz: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ['id', 'question', 'correctAnswer', 'explanation']
          }
        }
      },
      required: ['senderName', 'senderRole', 'emailSubject', 'emailBody', 'assets', 'quiz', 'technicalGuide', 'coverImagePrompt']
    };

    try {
      const result = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Company: ${company.label}. Task: ${task.title}. ${TASK_DETAIL_PROMPT}`,
        config: { responseMimeType: "application/json", responseSchema }
      });
      const details = JSON.parse(result.text || "{}");

      // Generate Assets (Data or Diagrams)
      if (details.assets && Array.isArray(details.assets)) {
        details.assets = await Promise.all(details.assets.map(async (asset: any) => {
            if (asset.type === 'image') {
                const imageBase64 = await this.generateImage(asset.content, "1:1");
                if (imageBase64) {
                    return { ...asset, content: imageBase64 };
                }
            }
            return asset;
        }));
      }

      // Generate Cover Image (16:9 for the 560x280 requirement)
      let thumbnailUrl = task.thumbnailUrl;
      if (details.coverImagePrompt && !thumbnailUrl) {
          const coverBase64 = await this.generateImage(details.coverImagePrompt, "16:9");
          if (coverBase64) {
              thumbnailUrl = coverBase64;
          }
      }

      return { ...task, ...details, thumbnailUrl, detailsLoaded: true };
    } catch (error) {
      console.error("Error generating task details:", error);
      // Fallback object to stop infinite loading loops in UI
      return { 
          ...task, 
          detailsLoaded: true, 
          emailBody: "## System Message\n\nUnable to generate full task details at this time due to high traffic or connectivity issues. Please try reloading the project later.",
          emailSubject: "Content Generation Error",
          senderName: "System",
          senderRole: "Administrator",
          technicalGuide: "Details unavailable.",
          quiz: []
      };
    }
  }

  async generateSolutionWriteup(company: CompanyType, task: Task): Promise<string> {
      try {
          const prompt = SOLUTION_WRITEUP_PROMPT
            .replace('{{TITLE}}', task.title)
            .replace('{{DESCRIPTION}}', task.descriptionShort);

          const result = await this.genAI.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: `Company: ${company.label}. ${prompt}`
          });

          return result.text || "";
      } catch (error) {
          console.error("Error generating solution writeup:", error);
          return "## System Error\nCould not generate solution write-up. Please try again later.";
      }
  }

  async generateEnvConfig(company: CompanyType): Promise<EnvConfig> {
    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        dockerCompose: { type: Type.STRING },
        initSql: { type: Type.STRING }
      },
      required: ['dockerCompose', 'initSql']
    };

    try {
      const result = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Company: ${company.label}. ${ENV_SETUP_PROMPT}`,
        config: { responseMimeType: "application/json", responseSchema }
      });
      const config = JSON.parse(result.text || "{}");
      return config;
    } catch (error) {
      console.error("Error generating env config:", error);
      return {
        dockerCompose: "# Error generating configuration. Please try again.",
        initSql: "-- Error generating SQL. Please try again."
      };
    }
  }
}

export const aiService = new AIService();