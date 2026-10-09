// B"H — Downloads: fetch → blob → object URL, with a shelf UI.
let seq = 0;

function fmtBytes(n) {
  if (!Number.isFinite(n) || n < 0) return "—";
  if (n < 1024) return n + " B";
  const u = ["KB", "MB", "GB"];
  let v = n / 1024, i = 0;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return v.toFixed(1) + " " + u[i];
}

export class DownloadManager {
  constructor({ shelfEl, onChange }) {
    this.items = [];
    this.shelfEl = shelfEl;
    this.onChange = onChange || (() => {});
  }

  /** Download a URL to a blob and trigger the host save dialog. */
  async download(url, filename) {
    const id = "dl" + (++seq) + Date.now().toString(36);
    const name = filename || String(url).split("/").pop().split("?")[0] || "download";
    const item = { id, name, url, received: 0, total: 0, state: "active", objectUrl: null, error: "" };
    this.items.unshift(item);
    this.#render();
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const total = Number(res.headers.get("content-length")) || 0;
      item.total = total;
      const reader = res.body ? res.body.getReader() : null;
      if (!reader) {
        const blob = await res.blob();
        item.received = blob.size; item.total = blob.size;
        return this.#finish(item, blob);
      }
      const chunks = [];
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        item.received += value.length;
        this.#render();
      }
      this.#finish(item, new Blob(chunks));
    } catch (e) {
      item.state = "error";
      item.error = /Failed to fetch|NetworkError/i.test(String(e && e.message))
        ? "Fetch blocked — likely CORS. The server must allow cross-origin reads."
        : String((e && e.message) || e);
      this.#render();
      this.onChange();
      return item;
    }
    this.#render();
    this.onChange();
    return item;
  }

  #finish(item, blob) {
    item.objectUrl = URL.createObjectURL(blob);
    item.state = "done";
    if (!item.total) item.total = blob.size;
    const a = document.createElement("a");
    a.href = item.objectUrl;
    a.download = item.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  open(id) {
    const it = this.items.find((x) => x.id === id);
    if (it && it.objectUrl) window.open(it.objectUrl, "_blank", "noopener");
  }

  dismiss(id) {
    const i = this.items.findIndex((x) => x.id === id);
    if (i >= 0) {
      const [it] = this.items.splice(i, 1);
      if (it.objectUrl) URL.revokeObjectURL(it.objectUrl);
      this.#render(); this.onChange();
    }
  }

  clearFinished() {
    const active = this.items.filter((x) => x.state === "active");
    for (const it of this.items) {
      if (it.state !== "active" && it.objectUrl) URL.revokeObjectURL(it.objectUrl);
    }
    this.items = active;
    this.#render(); this.onChange();
  }

  list() { return this.items.slice(); }

  #render() {
    const el = this.shelfEl;
    if (!el) return;
    if (!this.items.length) { el.classList.remove("show"); el.innerHTML = ""; return; }
    el.classList.add("show");
    el.innerHTML = "";
    for (const it of this.items) {
      const row = document.createElement("div");
      row.className = "dl-item";
      const pct = it.total > 0 ? Math.min(100, Math.round((it.received / it.total) * 100)) : 0;
      const meta = it.state === "active"
        ? (it.total ? pct + "% · " + fmtBytes(it.received) + " / " + fmtBytes(it.total) : fmtBytes(it.received))
        : it.state === "done" ? fmtBytes(it.total || it.received) + " · done"
        : "failed";
      row.innerHTML =
        '<span class="dl-name"></span>' +
        (it.state === "active" ? '<span class="dl-bar"><span style="width:' + pct + '%"></span></span>' : "") +
        '<span class="dl-meta"></span>' +
        (it.state === "done" ? '<button class="icon-btn dl-open" title="Open">↗</button>' : "") +
        (it.state === "error" ? '<span class="dl-state-err" title=""></span>' : "") +
        '<button class="icon-btn dl-x" title="Dismiss">✕</button>';
      row.querySelector(".dl-name").textContent = it.name;
      row.querySelector(".dl-meta").textContent = meta;
      if (it.state === "done") row.querySelector(".dl-open").addEventListener("click", () => this.open(it.id));
      if (it.state === "error") row.querySelector(".dl-state-err").textContent = it.error;
      row.querySelector(".dl-x").addEventListener("click", () => this.dismiss(it.id));
      el.appendChild(row);
    }
  }
}
