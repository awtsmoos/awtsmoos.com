//B"H
import { markdownToHtml } from "/heichelos/post/parsing.js";
import { normalizeMessage, classifyTransportEvent } from "./messageNormalizer.js";
import { parseSemanticText, semanticFragmentsToHtml } from "./semanticText.js";
import { escapeHtml } from "./escapeHtml.js";
import { MessageVault } from "./messageVault.js";

const LONG_TEXT = 6500;
const LONG_EVENTS = 2600;
const KEEP_HOT = 36;

/**
 * Chapter 3: A thousand messages may pass through the gate without crushing it.
 * The Awtsmoos reveals only the nearest sparks in DOM, while older fire is kept
 * in the vault. Scrolling up suspends autoscroll; returning to the bottom binds
 * the river again to its living edge.
 */
export class MessageRenderer {
  constructor({ chatBox }) {
    this.chatBox = chatBox;
    this.vault = new MessageVault();
    this.records = new Map();
    this.order = [];
    this.userPinnedScroll = false;
    this.observer = new IntersectionObserver(entries => this.onVisible(entries), {
      root: chatBox,
      rootMargin: "900px 0px",
      threshold: 0.01
    });
    chatBox.addEventListener("scroll", () => this.trackScrollIntent(), { passive: true });
  }

  clear() {
    this.records.clear();
    this.order = [];
    this.chatBox.innerHTML = "";
    this.userPinnedScroll = false;
  }

  add(input) {
    const msg = normalizeMessage(input);
    const id = msg.id || crypto.randomUUID();
    const shell = document.createElement("div");
    const bubble = document.createElement("div");
    shell.className = `message-shell ${msg.role === "user" ? "end-flow" : "start-flow"}`;
    shell.dataset.messageId = id;
    bubble.className = `message ${msg.role} is-loading`;
    bubble.innerHTML = `<div class="message-loading"><i></i><span></span><span></span><span></span><em>awakening stream</em></div>`;
    shell.appendChild(bubble);
    this.chatBox.appendChild(shell);
    const record = { id, shell, bubble, role: msg.role, text: msg.text, events: msg.events, heavy: this.isHeavy(msg), hot: true };
    this.records.set(id, record);
    this.order.push(id);
    this.vault.put(id, { text: msg.text, events: msg.events, role: msg.role });
    this.hydrate(record);
    this.renderEventDetails(shell, record.events, id);
    this.observer.observe(shell);
    this.pruneColdDom();
    this.scrollDown();
    return { shell, bubble, message: msg, id };
  }

  async updateBubble(bubble, input, role = "assistant") {
    const shell = bubble.closest(".message-shell");
    const id = shell?.dataset.messageId;
    const normalized = typeof input === "string" ? null : normalizeMessage(input);
    const text = normalized?.text || (typeof input === "string" ? input : "");
    const record = this.records.get(id) || { shell, bubble, role, events: [] };
    if (normalized?.events?.length) record.events = mergeEvents(record.events || [], normalized.events);
    if (text) record.text = text;
    record.role = role;
    record.heavy = String(record.text || "").length > LONG_TEXT || JSON.stringify(record.events || []).length > LONG_EVENTS;
    this.records.set(id, record);
    await this.vault.put(id, { text: record.text || "", role, events: record.events || [] });
    if (text) this.setBubbleHtml(bubble, text, role);
    this.renderEventDetails(shell, record.events || [], id);
    this.scrollDown();
  }

  pushTransport(shell, event) {
    const id = shell?.dataset.messageId;
    const record = this.records.get(id);
    if (!record) return;
    record.events = mergeEvents(record.events || [], [classifyTransportEvent(event)]);
    this.renderEventDetails(shell, record.events, id);
  }

  isHeavy(msg) { return String(msg.text || "").length > LONG_TEXT || JSON.stringify(msg.events || []).length > LONG_EVENTS; }

  setBubbleHtml(bubble, text, role = "assistant") {
    bubble.classList.remove("is-loading");
    const html = semanticFragmentsToHtml(parseSemanticText(text || ""));
    bubble.innerHTML = role === "assistant" ? markdownToHtml(html) : html;
  }

  async hydrate(record) {
    const saved = await this.vault.get(record.id);
    this.setBubbleHtml(record.bubble, saved?.text || record.text || "", saved?.role || record.role);
    record.shell.classList.remove("is-offloaded");
    record.hot = true;
  }

  offload(record, force = false) {
    if ((!force && !record.heavy) || record.shell.classList.contains("is-offloaded")) return;
    const chars = String(record.text || "").length;
    const events = (record.events || []).length;
    record.bubble.innerHTML = `<button class="message-offload">Stored ${chars.toLocaleString()} chars · ${events} event(s). Click to reveal.</button>`;
    record.shell.querySelector(".transport-details")?.remove();
    record.shell.classList.add("is-offloaded");
    record.hot = false;
    record.bubble.querySelector("button")?.addEventListener("click", () => this.hydrate(record));
  }

  pruneColdDom() {
    const cold = this.order.slice(0, Math.max(0, this.order.length - KEEP_HOT));
    for (const id of cold) {
      const record = this.records.get(id);
      if (record) this.offload(record, true);
    }
  }

  onVisible(entries) {
    for (const entry of entries) {
      const record = this.records.get(entry.target.dataset.messageId);
      if (!record) continue;
      if (entry.isIntersecting) this.hydrate(record); else this.offload(record);
    }
  }

  renderEventDetails(shell, events, id) {
    shell.querySelector(".transport-details")?.remove();
    if (!events?.length || shell.classList.contains("is-offloaded")) return;
    const grouped = groupEvents(events);
    const details = document.createElement("details");
    details.className = "transport-details";
    const summary = Object.entries(grouped).map(([k, v]) => `${labelKind(k)}:${v.length}`).join(" • ");
    details.innerHTML = `<summary>${summary}</summary><div class="event-tabs">${Object.entries(grouped).map(renderGroup).join("")}</div><button class="load-events">Raw trace</button>`;
    details.querySelector(".load-events").onclick = async () => {
      const saved = await this.vault.get(id);
      details.querySelector(".event-tabs").innerHTML = `<pre>${escapeHtml(JSON.stringify(saved?.events || [], null, 2))}</pre>`;
    };
    shell.appendChild(details);
  }

  showError(title, error, raw = null) {
    const text = `${title}\n\n${error?.message || error || "Unknown error"}${raw ? "\n\n" + raw : ""}`;
    return this.add({ message: { author: { role: "assistant" }, content: { parts: [text] }, metadata: { is_error: true } } });
  }

  trackScrollIntent() {
    const distance = this.chatBox.scrollHeight - this.chatBox.scrollTop - this.chatBox.clientHeight;
    this.userPinnedScroll = distance > 96;
    this.chatBox.classList.toggle("is-user-reading", this.userPinnedScroll);
  }

  addAudio(shell, onClick) {
    const audio = document.createElement("div");
    audio.className = "audio";
    audio.textContent = "Play / Download";
    audio.onclick = onClick;
    shell.appendChild(audio);
  }

  scrollDown() {
    if (this.userPinnedScroll) return;
    requestAnimationFrame(() => { this.chatBox.scrollTop = this.chatBox.scrollHeight; });
  }
}

function mergeEvents(current, next) {
  return [...current, ...next].slice(-420);
}

function groupEvents(events) {
  return events.reduce((acc, event) => {
    const kind = event.kind || "raw";
    (acc[kind] ||= []).push(event);
    return acc;
  }, {});
}

function labelKind(kind) {
  return ({ thinking: "Thinking", tool_call: "Tools", tool_result: "Results", status: "Status", hidden: "Hidden", oauth: "Sign-in", raw: "Raw" })[kind] || kind;
}

function renderGroup([kind, events]) {
  return `<details class="event-group ${escapeHtml(kind)}" ${kind === "thinking" ? "open" : ""}>
    <summary>${escapeHtml(labelKind(kind))} <small>${events.length}</small></summary>
    <div class="event-lanes">${events.slice(-40).map(renderEvent).join("")}</div>
  </details>`;
}

function renderEvent(event) {
  const text = event.text || event.label || event.kind || "event";
  const action = event.action ? `<a class="event-action" href="${escapeHtml(event.action.href)}" target="_blank" rel="noreferrer">${escapeHtml(event.action.label)}</a>` : "";
  return `<article class="event-lane ${escapeHtml(event.kind || "raw")}"><b>${escapeHtml(event.label || event.kind || "raw")}</b><span>${escapeHtml(text).slice(0, 900)}${action}</span></article>`;
}
