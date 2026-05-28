//B"H
const KEY = "BH_awtsmoos_ai_automation_settings_by_conversation_v2";
const OLD_KEY = "BH_awtsmoos_ai_automation_settings_v1";
const FALLBACK_ID = "__no_conversation__";
const MIN_DELAY_MS = 5000;
const MIN_STREAM_SETTLE_MS = 1500;

export const DEFAULT_AUTOMATION_SETTINGS = Object.freeze({
  enabled: false,
  mode: "continue",
  maxTurns: 3,
  delayMs: MIN_DELAY_MS,
  streamSettleMs: MIN_STREAM_SETTLE_MS,
  prompt: "continue with the next precise verified step",
  promptMode: "single",
  promptListText: "continue with the next precise verified step\ncontinue the story naturally\nexpand the next beat with vivid detail",
  stopOnError: true
});

/**
 * Chapter 111: Each Conversation Receives Its Own Flame.
 *
 * Automation is no longer a single global switch haunting every chat. Each
 * conversation id stores its own settings, defaulting off, so two browser tabs
 * can carry two separate vessels while the UI always reflects the currently
 * visible chat. The Awtsmoos heals old saved settings into this map without
 * turning future chats on by accident.
 */
export class AutomationSettingsStore {
  constructor({ storage = globalThis.localStorage } = {}) {
    this.storage = storage;
    this.conversationId = FALLBACK_ID;
  }

  setConversationId(conversationId = null) {
    this.conversationId = normalizeId(conversationId);
    return this.load();
  }

  load(conversationId = this.conversationId) {
    const id = normalizeId(conversationId);
    const all = this.loadAll();
    return normalizeSettings({ ...DEFAULT_AUTOMATION_SETTINGS, ...(all[id] || {}) });
  }

  save(next = {}, conversationId = this.conversationId) {
    const id = normalizeId(conversationId);
    const all = this.loadAll();
    const settings = normalizeSettings({ ...DEFAULT_AUTOMATION_SETTINGS, ...(all[id] || {}), ...next });
    all[id] = settings;
    this.storage.setItem(KEY, JSON.stringify(all));
    return settings;
  }

  loadAll() {
    try {
      const raw = JSON.parse(this.storage.getItem(KEY) || "{}");
      if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw;
    } catch {}
    return this.migrateOldSettings();
  }

  migrateOldSettings() {
    try {
      const oldRaw = JSON.parse(this.storage.getItem(OLD_KEY) || "{}");
      const all = oldRaw && Object.keys(oldRaw).length ? { [FALLBACK_ID]: normalizeSettings({ ...DEFAULT_AUTOMATION_SETTINGS, ...oldRaw, enabled: false }) } : {};
      this.storage.setItem(KEY, JSON.stringify(all));
      return all;
    } catch {
      return {};
    }
  }
}

export function normalizeAutomationSettings(settings = {}) {
  return normalizeSettings({ ...DEFAULT_AUTOMATION_SETTINGS, ...settings });
}

export function parsePromptList(settings = {}) {
  return String(settings.promptListText || "")
    .split(/\r?\n+/)
    .map(item => item.trim())
    .filter(Boolean);
}

function normalizeSettings(settings = {}) {
  const promptMode = ["single", "cycle", "random"].includes(settings.promptMode) ? settings.promptMode : "single";
  const promptListText = String(settings.promptListText || DEFAULT_AUTOMATION_SETTINGS.promptListText);
  return {
    ...settings,
    enabled: Boolean(settings.enabled),
    mode: String(settings.mode || "continue"),
    maxTurns: Math.max(1, Number(settings.maxTurns || DEFAULT_AUTOMATION_SETTINGS.maxTurns)),
    delayMs: Math.max(MIN_DELAY_MS, Number(settings.delayMs || DEFAULT_AUTOMATION_SETTINGS.delayMs)),
    streamSettleMs: Math.max(MIN_STREAM_SETTLE_MS, Number(settings.streamSettleMs || DEFAULT_AUTOMATION_SETTINGS.streamSettleMs)),
    prompt: String(settings.prompt || DEFAULT_AUTOMATION_SETTINGS.prompt),
    promptMode,
    promptListText,
    stopOnError: settings.stopOnError !== false
  };
}

function normalizeId(conversationId = null) {
  return String(conversationId || FALLBACK_ID);
}
