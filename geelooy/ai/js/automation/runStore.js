//B"H
const KEY = "BH_awtsmoos_ai_automation_runs_v1";
const EVENT = "awtsmoos-automation-runs";

/**
 * B"H — A small ledger for many automation rivers.
 *
 * Each conversation can carry its own automation run: turns, status, last
 * reply, and timestamps. The page may reload, sidebar badges may repaint, and
 * hidden chats may continue without borrowing the visible chat's state.
 */
export class AutomationRunStore {
  constructor(storage = localStorage) {
    this.storage = storage;
    installStorageWakeup(this);
  }

  list() {
    try { return JSON.parse(this.storage.getItem(KEY) || "[]").filter(run => run?.conversationId); }
    catch { return []; }
  }

  get(conversationId) {
    return this.list().find(run => run.conversationId === conversationId) || null;
  }

  upsert(run) {
    if (!run?.conversationId) return null;
    const next = this.list().filter(item => item.conversationId !== run.conversationId);
    const merged = { status: "idle", turns: 0, ...this.get(run.conversationId), ...run, updatedAt: Date.now() };
    next.push(merged);
    this.write(next.slice(-80));
    return merged;
  }

  patch(conversationId, patch) {
    return this.upsert({ conversationId, ...patch });
  }

  remove(conversationId) {
    this.write(this.list().filter(run => run.conversationId !== conversationId));
  }

  resetAll() {
    this.write([]);
  }

  write(items) {
    try { this.storage.setItem(KEY, JSON.stringify(items)); } catch {}
    announce(items);
  }
}

function installStorageWakeup(store) {
  if (globalThis.__awtsmoosAutomationStorageWakeup) return;
  globalThis.__awtsmoosAutomationStorageWakeup = true;
  globalThis.addEventListener?.("storage", event => {
    if (event?.key === KEY) announce(store.list());
  });
}

function announce(runs) {
  try { globalThis.dispatchEvent?.(new CustomEvent(EVENT, { detail: { runs } })); } catch {}
}

export const automationRunStore = new AutomationRunStore();
export const AUTOMATION_RUNS_EVENT = EVENT;
