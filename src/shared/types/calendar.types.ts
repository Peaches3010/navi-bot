export type TaskType = "REMINDER" | "CALENDAR_EVENT" | "TODO";
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "DONE" | "CANCELLED" | "OVERDUE";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface CalendarEvent {
  id: string;
  title: string;
  start_at: Date;
  end_at: Date;
  notes?: string;
}

export interface FreeSlot {
  start_at: Date;
  end_at: Date;
  duration_minutes: number;
}

export interface CreateTaskInput {
  title: string;
  type: TaskType;
  priority?: Priority;
  tags?: string[];
  due_at?: Date;
  start_at?: Date;
  end_at?: Date;
  remind_at?: Date;
  duration_min?: number;
  notes?: string;
}

export interface TimeRange {
  start: Date;
  end: Date;
}

export type CalendarIntentType =
  | "create_reminder"
  | "create_calendar_event"
  | "find_free_slots"
  | "plan_tasks"
  | "list_today"
  | "list_tasks"
  | "update_task"
  | "delete_task"
  | "unknown";

export interface CalendarIntent {
  intent: CalendarIntentType;
  confidence: number;
  entities: {
    title?: string;
    date?: string;
    time?: string;
    remind_at?: string;
    start_at?: string;
    end_at?: string;
    duration_minutes?: number;
    time_preference?: string;
    priority?: Priority;
    tags?: string[];
    tasks?: Array<{
      title: string;
      duration_minutes: number;
      deadline?: string;
    }>;
  };
  missing_fields: string[];
}