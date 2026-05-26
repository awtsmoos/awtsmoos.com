//B"H
const KEY = "awtsmoos.activeStreams.v2";
const LEGACY_KEY = "awtsmoos.activeStreams.v1";
const TAB_KEY = "awtsmoos.streamTabId.v1";
const EVENT = "awtsmoos-active-streams";

/**
 * B"H — A durable ledger for living extension/relay streams.
 *
 * The first version lived in sessionStorage, which died when the whole tab was
 * closed. This vessel uses localStorage so a reopened page can discover stream
 * ids/cursors again while the extension service worker or Node relay is still
 * alive. Every entry also records the tab id that last touched it, so multiple
 * tabs can observe the same river without pretending only one tab exists.
 */
export class StreamResumeStore {
  constructor(storage = localStorage, tabStorage = sessionStorage) {
    this.storage = storage;
    this.tabStorage = tabStorage;
    this.tabId = getTabId(tabStorage);
    this.migrateLegacy();
  }

  list() {
    try { return JSON.parse(this.storage.getItem(KEY) || "[]").filter(item => item?.id); }
    catch { return []; }
  }

  upsert(entry) {
    if (!entry?.id) return;
    const next = this.list().filter(item => item.id !== entry.id);
    next.push({ status: "streaming", tabId: this.tabId, ...entry, updatedAt: Date.now() });
    this.write(next.slice(-200));
  }

  patch(id, patch) {
    const found = this.list().find(item => item.id === id);
    if (found) this.upsert({ ...found, ...patch, tabId: this.tabId });
  }

  claim(id) {
    this.patch(id, { claimedAt: Date.now(), claimedBy: this.tabId });
  }

  remove(id) {
    this.write(this.list().filter(item => item.id !== id));
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
