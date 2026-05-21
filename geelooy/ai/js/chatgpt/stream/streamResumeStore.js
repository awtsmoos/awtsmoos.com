//B"H
const KEY = "awtsmoos.activeStreams.v1";

/**
 * B"H — A tiny tab-local ledger for living extension streams.
 *
 * Each entry is keyed by the background stream id. The extension may keep
 * pumping while the page refreshes; this store remembers the last consumed
 * chunk cursor so a reborn page can ask for only the unrevealed sparks.
 */
export class StreamResumeStore {
  constructor(storage = sessionStorage) {
    this.storage = storage;
  }

  list() {
    try { return JSON.parse(this.storage.getItem(KEY) || "[]").filter(item => item?.id); }
    catch { return []; }
  }

  upsert(entry) {
    if (!entry?.id) return;
    const next = this.list().filter(item => item.id !== entry.id);
    next.push({ ...entry, updatedAt: Date.now() });
    this.write(next.slice(-12));
  }

  patch(id, patch) {
    const found = this.list().find(item => item.id === id);
    if (found) this.upsert({ ...found, ...patch });
  }

  remove(id) {
    this.write(this.list().filter(item => item.id !== id));
  }

  write(items) {
    try { this.storage.setItem(KEY, JSON.stringify(items)); } catch {}
  }
}

export const streamResumeStore = new StreamResumeStore();
