import React from 'react';

export type QuizQuestion = {
  id: string;
  question: string;
  options?: string[]; // If undefined, it's a numeric/text input
  correctAnswer: string;
  explanation: string;
};

export type FileAsset = {
  name: string;
  content: string; // CSV, SQL, JSON content, or Image Prompt/Base64
  type: 'csv' | 'sql' | 'json' | 'image';
};

export type SubTask = {
  id: string;
  title: string;
  isCompleted: boolean;
};

export type Task = {
  id: string;
  title: string;
  descriptionShort: string; // Brief one-liner
  difficulty: 'Easy' | 'Medium' | 'Hard'; // New field for complexity level
  dueDate: string; // ISO Date string
  skills: string[];
  isCompleted: boolean;
  completedAt?: number; // Timestamp of completion
  thumbnailUrl?: string; // AI Generated cover image (approx 560x280)
  
  // Complexity additions
  subTasks?: SubTask[];

  // Details (Loaded on demand)
  detailsLoaded: boolean;
  senderName?: string;
  senderRole?: string;
  emailSubject?: string;
  emailBody?: string;
  assets?: FileAsset[]; // Downloadable dummy data
  quiz?: QuizQuestion[]; // Validation questions
  userAnswers?: Record<string, string>; // Persisted quiz answers
  technicalGuide?: string; // e.g., "Step 1: Create dbt model..."
  solutionWriteup?: string; // Kaggle-style solution explanation
};

export type CompanyType = {
  id: string;
  label: string;
  icon: React.ReactNode;
  industry: string;
  description: string;
};

export type BrandAssets = {
  logoUrl?: string;
  bannerUrl?: string;
};

export type UserState = {
  email: string;
  name?: string;
  companyId: string;
  createdAt: number; // Timestamp
  tasks: Task[];
  workspaces?: Record<string, Task[]>; // Multi-workspace support
  lastActiveView?: 'board' | 'detail' | 'profile'; // For session restore
  lastActiveTaskId?: string; // For session restore
};

export type EnvConfig = {
  dockerCompose: string;
  initSql: string;
};