//B"H
/**
 * B"H
 * Chapter 162: The Send Button Became A Stop Blade With A Clock.
 *
 * While the stream flows, the composer shows elapsed time and approximate token
 * pressure. Stop aborts the active fetch through AbortController instead of
 * pretending the river has no bank.
 */
export class SendButtonState {
  constructor({ button, statusNode }) {
    this.button = button;
    this.statusNode = statusNode;
    this.controller = null;
    this.startedAt = 0;
    this.timer = null;
    this.metrics = null;
    this.originalText = button?.textContent || "Send ↗";
  }

  begin() {
    this.controller = new AbortController();
    this.startedAt = Date.now();
    this.metrics = null;
    this.button.textContent = "Stop ■";
    this.button.classList.add("is-streaming-stop");
    this.button.disabled = false;
    this.timer = setInterval(() => this.render(), 250);
    this.render();
    return this.controller.signal;
  }

  stop() {
    this.controller?.abort?.();
    this.render("stopping…");
  }

  update(metrics = {}) {
    this.metrics = { ...(this.metrics || {}), ...metrics };
    this.render();
  }

  end() {
    clearInterval(this.timer);
    this.timer = null;
    this.controller = null;
    this.button.textContent = this.originalText;
    this.button.classList.remove("is-streaming-stop");
    this.render("done");
    setTimeout(() => { if (!this.controller) this.clear(); }, 1200);
  }

  isStreaming() { return Boolean(this.controller); }

  render(prefix = "streaming") {
    if (!this.statusNode) return;
    const elapsed = this.startedAt ? ((Date.now() - this.startedAt) / 1000).toFixed(1) : "0.0";
    const m = this.metrics || {};
    const total = Number(m.totalTokens || 0);
    const limit = Number(m.contextWindow || 0);
    const percent = limit ? Math.min(100, Math.round((total / limit) * 100)) : 0;
    const purge = Number(m.purgedMessages || 0) ? ` · purged ${m.purgedMessages}` : "";
    this.statusNode.innerHTML = `<span>${prefix} · ${elapsed}s · ${total || "?"}/${limit || "?"} tokens${purge}</span><meter min="0" max="100" value="${percent}"></meter>`;
  }

  clear() {
    if (this.statusNode) this.statusNode.innerHTML = "";
  }
}
