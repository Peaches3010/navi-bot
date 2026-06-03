export * from "./calendar.types.js";
export * from "./interview.types.js";
export * from "./vibe-code.types.js";

export type BotModule = "CALENDAR" | "INTERVIEW" | "VIBE_CODE" | "IDLE";

export type SessionState =
  | "IDLE"
  // Calendar
  | "WAITING_FOR_TIME"
  | "WAITING_FOR_DURATION"
  | "WAITING_FOR_CONFIRMATION"
  | "WAITING_FOR_SLOT_CHOICE"
  // Interview
  | "INTERVIEW_SETUP"
  | "INTERVIEW_IN_PROGRESS"
  | "INTERVIEW_AWAITING_ANSWER"
  | "INTERVIEW_AWAITING_FOLLOWUP"
  | "INTERVIEW_PAUSED"
  // Vibe Code
  | "VIBE_CODE_AWAITING_CODE"
  | "VIBE_CODE_AWAITING_ACTION"
  | "VIBE_CODE_PROCESSING";

export interface SessionData {
  state: SessionState;
  active_module: BotModule;
  pending_calendar_intent?: import("./calendar.types.js").CalendarIntent;
  pending_slots?: import("./calendar.types.js").FreeSlot[];
  interview?: import("./interview.types.js").InterviewSessionState;
  vibe_code?: import("./vibe-code.types.js").VibeCodeState;
  last_activity_at: string;
}