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

// GLOBAL DEFINITION (Shared across users)
export type Task = {
  id: string;
  title: string;
  descriptionShort: string; // Brief one-liner
  difficulty: 'Easy' | 'Medium' | 'Hard'; // New field for complexity level
  dueDate: string; // ISO Date string (Base offset)
  skills: string[];
  thumbnailUrl?: string; // AI Generated cover image
  
  // Complexity additions
  subTasks?: SubTask[];

  // Follow-up Logic (Graph Structure)
  relatedTasks?: Task[]; // Nested history/follow-up tasks
  isFollowUp?: boolean; // UI Badge to denote this is a continuation
  parentTaskId?: string; // Reference ID (optional)

  // Details (Loaded on demand, Cached Globally)
  detailsLoaded: boolean;
  senderName?: string;
  senderRole?: string;
  emailSubject?: string;
  emailBody?: string;
  assets?: FileAsset[]; // Downloadable dummy data
  quiz?: QuizQuestion[]; // Validation questions
  technicalGuide?: string; // e.g., "Step 1: Create dbt model..."
  solutionWriteup?: string; // Global "Answer Key"
  
  // MERGED FIELDS (User Specific - Populated at runtime)
  isCompleted?: boolean;
  completedAt?: number;
  userAnswers?: Record<string, string>;
};

// USER STATE (Progress Only)
export type TaskProgress = {
    taskId: string;
    isCompleted: boolean;
    completedAt?: number;
    userAnswers?: Record<string, string>;
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

export type UserMetrics = {
  experienceHours: number;
  impactScore: number;
  achievements: string[]; // IDs of unlocked achievements
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null; // ISO Date YYYY-MM-DD
  contributionHistory: Record<string, number>; // "YYYY-MM-DD": count
  xp: number;
  level: 'Junior' | 'Intermediate' | 'Senior';
};

export type UserState = {
  uid: string; // Firebase Auth UID
  email: string;
  name?: string;
  photoUrl?: string;
  companyId: string;
  createdAt: number; // Timestamp
  lastLogin?: number;
  
  // Progress Tracking
  progress: Record<string, TaskProgress>; // Map taskId -> Progress
  
  lastActiveView?: 'board' | 'detail' | 'profile' | 'onboarding'; // For session restore
  lastActiveTaskId?: string; // For session restore
  metrics?: UserMetrics; // Persistent stats
};

export type EnvConfig = {
  dockerCompose: string;
  initSql: string;
};