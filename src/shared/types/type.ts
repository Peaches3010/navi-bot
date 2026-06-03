// ─── Intent Types ─────────────────────────────────────────────
export type IntentType =
  | "create_reminder"
  | "create_calendar_event"
  | "find_free_slots"
  | "plan_tasks"
  | "list_today"
  | "list_tasks"
  | "unknown";

export interface ParsedIntent {
  intent: IntentType;
  confidence: number;
  entities: IntentEntities;
  missing_fields: string[];
  raw_message: string;
}

export interface IntentEntities {
  title?: string;
  date?: string;        // ISO date string
  time?: string;        // HH:mm
  remind_at?: string;   // ISO datetime
  start_at?: string;    // ISO datetime
  end_at?: string;      // ISO datetime
  duration_minutes?: number;
  time_preference?: string;
  priority?: "low" | "medium" | "high";
  recurrence?: string;
  tasks?: TaskInput[];
}

export interface TaskInput {
  title: string;
  duration_minutes: number;
  deadline?: string;
  priority?: "low" | "medium" | "high";
}

// ─── Calendar Types ────────────────────────────────────────────
export interface CalendarEvent {
  id: string;
  title: string;
  start_at: Date;
  end_at: Date;
  notes?: string;
  source: "apple_calendar" | "apple_reminders";
}

export interface FreeSlot {
  start_at: Date;
  end_at: Date;
  duration_minutes: number;
}

// ─── Session Types ─────────────────────────────────────────────
export type SessionState =
  | "IDLE"
  | "WAITING_FOR_TIME"
  | "WAITING_FOR_DURATION"
  | "WAITING_FOR_CONFIRMATION"
  | "WAITING_FOR_SLOT_CHOICE";

export interface SessionData {
  state: SessionState;
  pending_intent?: ParsedIntent;
  pending_slots?: FreeSlot[];
  last_message_at?: string;
}

// ─── Action Result ─────────────────────────────────────────────
export interface ActionResult {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
}