//B"H
const KEY = "awtsmoos.activeStreams.v2";
const LEGACY_KEY = "awtsmoos.activeStreams.v1";
const TAB_KEY = "awtsmoos.streamTabId.v1";
const EVENT = "awtsmoos-active-streams";
const DONE_STATUSES = new Set(["done", "stopped", "error"]);
const DONE_TTL_MS = 15000;
const ACTIVE_TTL_MS = 1000 * 60 * 30;

/**
 * B"H — A durable ledger for living extension/relay streams.
 *
 * This store remembers active rivers across reloads, but it refuses to let old
 * ghosts keep the sidebar saying "streaming" after the source has finished.
 */
export class StreamResumeStore {
  constructor(storage = localStorage, tabStorage = sessionStorage) {
    this.storage = storage;
    this.tabStorage = tabStorage;
    this.tabId = getTabId(tabStorage);
    this.migrateLegacy();
    installStorageWakeup(this);
    this.prune();
  }

  list({ activeOnly = false } = {}) {
    const items = this.readClean();
    return activeOnly ? items.filter(isLivingStream) : items;
  }

  active() {
    return this.list({ activeOnly: true });
  }

  upsert(entry) {
    if (!entry?.id) return;
    const next = this.readClean().filter(item => item.id !== entry.id);
    next.push({ status: "streaming", tabId: this.tabId, ...entry, updatedAt: Date.now() });
    this.write(this.clean(next).slice(-200));
  }

  patch(id, patch) {
    const found = this.readClean().find(item => item.id === id);
    if (found) this.upsert({ ...found, ...patch, tabId: this.tabId });
  }

  claim(id) {
    this.patch(id, { claimedAt: Date.now(), claimedBy: this.tabId });
  }

  release(id) {
    const found = this.readClean().find(item => item.id === id);
    if (found) this.upsert({ ...found, claimedAt: 0, claimedBy: null, status: found.status || "streaming" });
  }

  remove(id) {
    this.write(this.readClean().filter(item => item.id !== id));
  }

  prune() {
    this.write(this.clean(this.readRaw()));
  }

  removeStaleForConversation(conversationId, { keepRecentMs = 30000 } = {}) {
    if (!conversationId) return;
    const now = Date.now();
    this.write(this.readClean().filter(item => {
      const owner = item.conversationId || item.surfaceConversationId;
      if (owner !== conversationId) return true;
      if (DONE_STATUSES.has(item.status)) return false;
      return now - Number(item.updatedAt || item.createdAt || 0) <= keepRecentMs;
    }));
  }

  readRaw() {
    try { return JSON.parse(this.storage.getItem(KEY) || "[]").filter(item => item?.id); }
    catch { return []; }
  }

  readClean() {
    const raw = this.readRaw();
    const clean = this.clean(raw);
    if (clean.length !== raw.length) this.write(clean);
    return clean;
  }

  clean(items = []) {
    const now = Date.now();
    return items.filter(item => {
      const age = now - Number(item.updatedAt || item.doneAt || item.createdAt || 0);
      if (DONE_STATUSES.has(item.status)) return age <= DONE_TTL_MS;
      return age <= ACTIVE_TTL_MS;
    });
  }

  write(items) {
    try { this.storage.setItem(KEY, JSON.stringify(items)); } catch {}
    announce(items);
  }

  migrateLegacy() {
    try {
      if (this.storage.getItem(KEY)) return;
      const legacy = sessionStorage?.getItem?.(LEGACY_KEY);
      if (legacy) this.storage.setItem(KEY, legacy);
    } catch {}
  }
}

export function isLivingStream(item = {}) {
  return Boolean(item?.id) && !DONE_STATUSES.has(item.status);
}

function installStorageWakeup(store) {
  if (globalThis.__awtsmoosStreamStorageWakeup) return;
  globalThis.__awtsmoosStreamStorageWakeup = true;
  globalThis.addEventListener?.("storage", event => {
    if (event?.key === KEY) announce(store.list());
  });
}

function getTabId(tabStorage) {
  try {
    let id = tabStorage.getItem(TAB_KEY);
    if (!id) {
      id = `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      tabStorage.setItem(TAB_KEY, id);
    }
    return id;
  } catch {
    return `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

function announce(items) {
  try { globalThis.dispatchEvent?.(new CustomEvent(EVENT, { detail: { streams: items } })); } catch {}
}

export const streamResumeStore = new StreamResumeStore();
export const ACTIVE_STREAMS_EVENT = EVENT;
