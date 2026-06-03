export type Level = "JUNIOR" | "MID" | "SENIOR";
export type InterviewType = "TECHNICAL" | "SYSTEM_DESIGN" | "BEHAVIORAL" | "MIXED";
export type SessionStatus = "IN_PROGRESS" | "COMPLETED" | "PAUSED" | "ABANDONED";
export type Trend = "IMPROVING" | "DECLINING" | "STABLE";

export const TOPICS = {
  nodejs: "Node.js",
  javascript: "JavaScript/TypeScript",
  system_design: "System Design",
  database: "Database",
  dsa: "DSA",
  devops: "DevOps",
} as const;

export type TopicKey = keyof typeof TOPICS;

export interface EvaluationScores {
  correctness: number;
  completeness: number;
  clarity: number;
  depth: number;
  best_practices: number;
}

export interface QuestionData {
  id: string;
  topic: string;
  subtopic: string;
  level: Level;
  type: InterviewType;
  question: string;
  ideal_answer: string;
  key_points: string[];
  follow_ups: string[];
  tags: string[];
}

export interface EvaluationResult {
  scores: EvaluationScores;
  total: number;
  good_points: string[];
  missing_points: string[];
  feedback: string;
  needs_followup: boolean;
  followup_question?: string;
}

export interface SessionSummary {
  overall_score: number;
  performance_level: "Excellent" | "Good" | "Average" | "Needs Improvement";
  strengths: string[];
  weaknesses: string[];
  top_weak_topics: Array<{ topic: string; subtopic: string; score: number }>;
  study_recommendations: Array<{
    topic: string;
    subtopic: string;
    priority: "high" | "medium" | "low";
    estimated_hours: number;
  }>;
  interview_readiness: "Ready" | "Almost Ready" | "Not Ready";
  motivational_message: string;
}

export interface InterviewSessionState {
  session_id: string;
  status: SessionStatus;
  type: InterviewType;
  topics: TopicKey[];
  level: Level;
  total_questions: number;
  current_index: number;
  current_question?: QuestionData;
  awaiting_followup: boolean;
  scores: number[];
  setup_step?: "type" | "topic" | "level" | "count" | "ready";
}