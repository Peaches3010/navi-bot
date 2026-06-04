import type { SessionData, SessionState, BotModule } from "../shared/types/index.js";

const DEFAULT_SESSION: SessionData = {
  state: "IDLE",
  active_module: "IDLE",
  last_activity_at: new Date().toISOString(),
};

const store = new Map<number, SessionData>();
const cleanupStaleSession = (): void => {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const [userId, session] of store) {
    if (new Date(session.last_activity_at).getTime() < cutoff) {
      store.delete(userId);
    }
  }
}

setInterval(cleanupStaleSession, 60 * 60 * 1000);

export const sessionStore = {
  get(userId: number): SessionData {
    if (!store.has(userId)) {
      store.set(userId, { ...DEFAULT_SESSION });
    }
    return store.get(userId)!;
  },

  set(userId: number, data: Partial<SessionData>): void {
    const current = this.get(userId);
    store.set(userId, {
      ...current,
      ...data,
      last_activity_at: new Date().toISOString(),
    });
  },

  clear(userId: number): void {
    store.set(userId, {
      ...DEFAULT_SESSION,
      last_activity_at: new Date().toISOString(),
    });
  },

  setState(userId: number, state: SessionState): void {
    this.set(userId, { state });
  },

  setModule(userId: number, module: BotModule): void {
    this.set(userId, { active_module: module });
  },

  isIdle(userId: number): boolean {
    return this.get(userId).state === "IDLE";
  },
};