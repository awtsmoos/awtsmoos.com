//B"H
import { EVENT_TYPES, applyEventVisibility, loadEventVisibility, saveEventVisibility } from "../settings/eventVisibility.js";

export class AutomationPanel {
  constructor({ root, store, onChange }) {
    this.root = root; this.store = store; this.onChange = onChange;
    this.settings = store.load(); this.eventVisibility = loadEventVisibility(); this.tab = "automation";
    applyEventVisibility(this.eventVisibility); this.render();
  }

  render() {
    this.root.innerHTML = `<div class="right-tabs">
      ${tab("automation", "Automation", this.tab)}${tab("settings", "Settings", this.tab)}${tab("trace", "Trace filters", this.tab)}
    </div><div class="right-panel-body">${this.body()}</div>`;
    this.root.querySelectorAll("[data-tab]").forEach(btn => btn.onclick = () => { this.tab = btn.dataset.tab; this.render(); });
    this.root.querySelectorAll("[data-auto]").forEach(input => input.oninput = () => this.captureAutomation());
    this.root.querySelectorAll("[data-event-type]").forEach(input => input.onchange = () => this.captureVisibility());
  }

  body() {
    if (this.tab === "settings") return `<h2>B"H Cockpit Settings</h2><p class="panel-note">The right drawer is now a multi-panel vessel.</p>${this.visibilityFields()}`;
    if (this.tab === "trace") return `<h2>Message Trace Filters</h2><p class="panel-note">Disable noisy trace families without deleting them from history.</p>${this.visibilityFields()}`;
    return `<h2>Automation Pipeline</h2>${field("enabled", "Enable auto-continue", "checkbox", this.settings.enabled)}${field("maxTurns", "Max turns", "number", this.settings.maxTurns)}${field("delayMs", "Delay ms", "number", this.settings.delayMs)}<label class="automation-field">Prompt<input data-auto="prompt" value="${attr(this.settings.prompt)}"></label><div class="automation-status" id="automation-status">automation off</div>`;
  }

  visibilityFields() {
    return `<div class="event-filter-grid">${EVENT_TYPES.map(type => `<label class="automation-field event-filter"><input data-event-type="${type}" type="checkbox" ${this.eventVisibility[type] !== false ? "checked" : ""}> Show ${label(type)}</label>`).join("")}</div>`;
  }

  captureAutomation() {
    const next = {};
    this.root.querySelectorAll("[data-auto]").forEach(input => next[input.dataset.auto] = input.type === "checkbox" ? input.checked : cast(input.value));
    this.settings = this.store.save(next); this.onChange?.(this.settings);
  }

  captureVisibility() {
    const next = { ...this.eventVisibility };
    this.root.querySelectorAll("[data-event-type]").forEach(input => next[input.dataset.eventType] = input.checked);
    this.eventVisibility = saveEventVisibility(next);
  }

  getSettings() { return this.settings; }
  report(text) { const status = this.root.querySelector("#automation-status"); if (status) status.textContent = text; }
}

function tab(name, label, active) { return `<button type="button" data-tab="${name}" class="${active === name ? "active" : ""}">${label}</button>`; }
function field(name, label, type, value) { const checked = type === "checkbox" && value ? "checked" : ""; const val = type === "checkbox" ? "" : `value="${attr(value)}"`; return `<label class="automation-field">${label}<input data-auto="${name}" type="${type}" ${val} ${checked}></label>`; }
function cast(value) { return /^\d+$/.test(String(value)) ? Number(value) : value; }
function attr(value) { return String(value ?? "").replaceAll('"', "&quot;"); }
function label(type) {
  const labels = {
    awtsmoos_tool: "Awtsmoos tool calls",
    agent_tool: "Agent tool calls",
    tool_call: "Generic tool calls",
    tool_result: "Tool results",
    status: "Status packets",
    raw: "Raw packets",
    hidden: "Hidden messages",
    code: "Code payloads",
    thinking: "Thinking traces",
    oauth: "OAuth prompts"
  };
  return labels[type] || type.replace(/_/g, " ");
}
