import React from 'react';
import { 
  Share2, Camera, ShoppingBag, Monitor, Music, Wallet, Tv, Car, Search, Rocket 
} from "lucide-react";
import { CompanyType } from './types';

export const COMPANIES: CompanyType[] = [
  { id: 'meta', label: 'Meta', industry: 'Social Media', icon: <Share2 className="w-6 h-6" />, description: 'Optimize ad targeting algorithms, analyze social graph density, and build automated content moderation pipelines at scale.' },
  { id: 'instagram', label: 'Instagram', industry: 'Social Media', icon: <Camera className="w-6 h-6" />, description: 'Develop Reels recommendation engines, model creator monetization strategies, and analyze visual engagement trends.' },
  { id: 'amazon', label: 'Amazon', industry: 'E-commerce & Cloud', icon: <ShoppingBag className="w-6 h-6" />, description: 'Refine supply chain logistics, implement dynamic pricing models, and improve product search relevance.' },
  { id: 'microsoft', label: 'Microsoft', industry: 'Enterprise & Cloud', icon: <Monitor className="w-6 h-6" />, description: 'Forecast Azure cloud consumption, model enterprise churn risk, and analyze developer productivity metrics for GitHub Copilot.' },
  { id: 'spotify', label: 'Spotify', industry: 'Audio Streaming', icon: <Music className="w-6 h-6" />, description: 'Enhance playlist personalization algorithms, drive podcast discovery, and model subscriber retention curves.' },
  { id: 'paytm', label: 'Paytm', industry: 'Fintech', icon: <Wallet className="w-6 h-6" />, description: 'Detect real-time transaction fraud, assess credit risk for lending products, and analyze merchant payment behaviors.' },
  { id: 'netflix', label: 'Netflix', industry: 'Streaming', icon: <Tv className="w-6 h-6" />, description: 'Calculate content valuation metrics, optimize thumbnail A/B testing, and model binge-watching user behavior.' },
  { id: 'uber', label: 'Uber', industry: 'Ride Sharing', icon: <Car className="w-6 h-6" />, description: 'Optimize real-time surge pricing, improve driver-rider matching algorithms, and refine ETA prediction models.' },
  { id: 'google', label: 'Google', industry: 'Tech & Search', icon: <Search className="w-6 h-6" />, description: 'Improve search ranking signals, optimize real-time ad auctions, and analyze video recommendation latency.' },
  { id: 'startup', label: 'Stealth Startup', industry: 'SaaS / Tech', icon: <Rocket className="w-6 h-6" />, description: 'Build the initial data stack, define product-market fit metrics, and implement growth hacking analytics from scratch.' },
];

export const ROADMAP_PROMPT = `
Generate a professional career roadmap consisting of EXACTLY 19 Data Science & Engineering projects.
The projects must reflect real-world business problems and strictly follow this seniority distribution:

1. **5 Junior/Analyst Projects**: 
   - Focus: SQL extraction, Data Cleaning, exploratory analysis, and building business dashboards.
   - Context: Ambiguous raw data, reporting to stakeholders.
   - Examples: "Investigate drop in checkout conversion", "Clean and normalize product catalog data", "Build Q3 Sales Performance Dashboard".
   
2. **5 Mid-Level Projects**: 
   - Focus: Predictive modeling, A/B Test design & analysis, and advanced visualization.
   - Context: optimizing specific business metrics (KPIs).
   - Examples: "Train Churn Prediction Model", "Design Pricing A/B Test", "Develop Customer Segmentation utilizing K-Means".

3. **9 Senior/Staff Projects**: 
   - Focus: MLOps, Data Engineering pipelines, Airflow, Docker, dbt, and GenAI integration.
   - Context: Scalability, architecture, and production deployment.
   - Examples: "Containerize ML Inference API", "Architect Airflow ETL Pipeline for Clickstream Data", "Fine-tune LLM for Automated Support Triage".

Return a JSON array where each object has:
- id: string (unique)
- title: string (Professional JIRA-style ticket title)
- descriptionShort: string (Focus on the BUSINESS IMPACT, not just the tech)
- difficulty: string (Enum: 'Easy', 'Medium', 'Hard')
- skills: string[] (e.g. "dbt", "Airflow", "Docker", "Postgres", "Streamlit", "FastAPI", "Pandas", "Scikit-Learn")
- subTasks: array of { id: string, title: string } (Max 3 subtasks per project)
`;

export const SINGLE_TASK_PROMPT = `
Generate EXACTLY 1 new Data Science/Engineering task.
Difficulty: {{DIFFICULTY}}
Context: The user has requested an additional ticket to work on.

Return a JSON array containing 1 object with:
- id: string (unique)
- title: string (Professional JIRA ticket title)
- descriptionShort: string (Focus on business impact)
- difficulty: string (Enum: 'Easy', 'Medium', 'Hard')
- skills: string[]
- subTasks: array of { id: string, title: string }
`;

export const FOLLOWUP_TASK_PROMPT = `
Generate EXACTLY 1 new Follow-Up Data Science task based on the completion of the previous ticket: "{{PARENT_TITLE}}".
The new task should represent the logical "Next Step" in a production lifecycle (e.g., if they built a model, now deploy it; if they analyzed data, now automate the report).

Return a JSON array containing 1 object with:
- id: string (unique)
- title: string (Professional JIRA ticket title)
- descriptionShort: string (Focus on the next phase of the project)
- difficulty: string (Enum: 'Easy', 'Medium', 'Hard')
- skills: string[]
- subTasks: array of { id: string, title: string }
`;

export const TASK_DETAIL_PROMPT = `
You are a Staff Data Scientist/Engineer acting as a mentor. Generate a realistic project simulation package.

1. emailBody: A realistic email from a Stakeholder (Product Manager, VP of Sales, or Engineering Lead). 
   - Tone: Professional but slightly ambiguous (like real life). 
   - Content: Focus on the *business problem* (e.g., "Revenue is down 5%"), not just the technical requirements. Mention specific KPIs.
2. coverImagePrompt: A detailed prompt to generate a high-quality 16:9 abstract technical illustration representing this project (e.g., "A sophisticated data visualization of network traffic glowing in a dark UI").
3. assets: Generate 2-3 assets.
   - **For Tables/Data**: Provide 'csv' or 'sql' content. It MUST be "Dirty Data" (inconsistent formatting, nulls, duplicates) to force the user to clean it.
   - **For Visuals**: If the task involves Computer Vision or UI analysis, you MUST include an asset with type 'image' containing a detailed image prompt.
4. technicalGuide: A Staff-level execution guide.
   - **Architecture**: How this fits into the stack.
   - **The "Gotchas"**: Specific production pitfalls to avoid.
5. quiz: 5 Validation questions to verify the user understood the business impact and technical implementation.

The goal is to simulate a day on the job, not a classroom exercise.
`;

export const ENV_SETUP_PROMPT = `
You are a Senior DevOps Engineer.
Generate a 'docker-compose.yml' and an 'init.sql' file to provision a local production-grade environment.

Requirements:
1. **Postgres**: Initialize a 'warehouse' database.
2. **Infrastructure**: Include service definitions for tools relevant to the specific industry stack (e.g., Redis, MinIO, or a lightweight Airflow/Prefect agent if feasible).
3. **init.sql**: Create a realistic schema (3-4 related tables) with proper constraints (Foreign Keys, Indexes), but NO data (data will be ingested from task assets).

Return JSON: { dockerCompose: string, initSql: string }
`;