// B"H — Browsing history: localStorage-backed, searchable, clearable.
const KEY = "merkava.history.v1";
const MAX_ENTRIES = 2000;

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

export class HistoryStore {
  constructor() { this.entries = load(); }

  #save() {
    try { localStorage.setItem(KEY, JSON.stringify(this.entries.slice(0, MAX_ENTRIES))); } catch {}
  }

  /** Record a visit. Same URL refreshes visitedAt and moves to front. */
  add(url, title) {
    url = String(url || "").trim();
    if (!url || url === "about:blank") return;
    const now = Date.now();
    this.entries = this.entries.filter((e) => e.url !== url);
    this.entries.unshift({ url, title: String(title || url).slice(0, 120), visitedAt: now });
    if (this.entries.length > MAX_ENTRIES) this.entries.length = MAX_ENTRIES;
    this.#save();
  }

  list(limit = 200) { return this.entries.slice(0, limit); }

  search(q, limit = 200) {
    q = String(q || "").trim().toLowerCase();
    if (!q) return this.list(limit);
    return this.entries.filter((e) =>
      e.url.toLowerCase().includes(q) || (e.title || "").toLowerCase().includes(q)
    ).slice(0, limit);
  }

  remove(url) {
    this.entries = this.entries.filter((e) => e.url !== url);
    this.#save();
  }

  clear() { this.entries = []; this.#save(); }

  get count() { return this.entries.length; }
}
