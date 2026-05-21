//B"H
import { EVENT_TYPES, applyEventVisibility, loadEventVisibility, saveEventVisibility } from "../settings/eventVisibility.js";
import { checkNodeRelay, openRelayControl, openRelayLogin } from "../chatgpt/transport/nodeRelayFetch.js";
import { loadNodeRelaySettings, saveNodeRelaySettings } from "../chatgpt/transport/nodeRelaySettings.js";

export class AutomationPanel {
  constructor({ root, store, onChange }) {
    this.root = root;
    this.store = store;
    this.onChange = onChange;
    this.settings = store.load();
    this.eventVisibility = loadEventVisibility();
    this.relaySettings = loadNodeRelaySettings();
    this.tab = "automation";
    applyEventVisibility(this.eventVisibility);
    this.render();
  }

  /**
   * Chapter 49: The Cockpit Kept Every Door Within Reach.
   *
   * The Awtsmoos lets Settings remain available at every hour: extension path,
   * localhost relay path, trace filters, and automation all sit in one drawer.
   *
   * @returns {void}
   */
  render() {
    this.root.innerHTML = `<div class="right-tabs">
      ${tab("automation", "Automation", this.tab)}${tab("settings", "Settings", this.tab)}${tab("trace", "Trace filters", this.tab)}
    </div><div class="right-panel-body">${this.body()}</div>`;
    this.bindTabs();
    this.bindAutomation();
    this.bindVisibility();
    this.bindRelay();
  }

  body() {
    if (this.tab === "settings") return `<h2>B"H Cockpit Settings</h2><p class="panel-note">The right drawer is now a multi-panel vessel.</p>${this.relayFields()}${this.visibilityFields()}`;
    if (this.tab === "trace") return `<h2>Message Trace Filters</h2><p class="panel-note">Disable noisy trace families without deleting them from history.</p>${this.visibilityFields()}`;
    return `<h2>Automation Pipeline</h2>${field("enabled", "Enable auto-continue", "checkbox", this.settings.enabled)}${field("maxTurns", "Max turns", "number", this.settings.maxTurns)}${field("delayMs", "Delay ms", "number", this.settings.delayMs)}<label class="automation-field">Prompt<input data-auto="prompt" value="${attr(this.settings.prompt)}"></label><div class="automation-status" id="automation-status">automation off</div>`;
  }

  relayFields() {
    const enabled = this.relaySettings.enabled ? "checked" : "";
    return `<section class="automation-card relay-card">
      <h3>ChatGPT transport</h3>
      <p class="panel-note">Use the extension bridge, or connect to the experimental split-browser relay already running from <code>geelooy/ai/relay/split-browser</code>.</p>
      <p class="panel-note">Run <code>node index.js</code> there, then open the localhost control URL to render ChatGPT through Node.</p>
      <label class="automation-field">Relay URL<input data-relay="url" value="${attr(this.relaySettings.url)}"></label>
      <label class="automation-field"><input data-relay="enabled" type="checkbox" ${enabled}> Use Node relay instead of extension</label>
      <div class="relay-actions">
        <button type="button" data-relay-action="health">Check split relay</button>
        <button type="button" data-relay-action="control">Get localhost control URL</button>
        <button type="button" data-relay-action="extension">Switch back to extension</button>
      </div>
      <div class="automation-status" id="relay-status">${this.relaySettings.enabled ? "Node relay selected" : "Extension bridge selected"}</div>
    </section>`;
  }

  visibilityFields() {
    return `<div class="event-filter-grid">${EVENT_TYPES.map(type => `<label class="automation-field event-filter"><input data-event-type="${type}" type="checkbox" ${this.eventVisibility[type] !== false ? "checked" : ""}> Show ${label(type)}</label>`).join("")}</div>`;
  }

  bindTabs() {
    this.root.querySelectorAll("[data-tab]").forEach(btn => btn.onclick = () => {
      this.tab = btn.dataset.tab;
      this.render();
    });
  }

  bindAutomation() {
    this.root.querySelectorAll("[data-auto]").forEach(input => input.oninput = () => this.captureAutomation());
  }

  bindVisibility() {
    this.root.querySelectorAll("[data-event-type]").forEach(input => input.onchange = () => this.captureVisibility());
  }

  bindRelay() {
    this.root.querySelectorAll("[data-relay]").forEach(input => input.oninput = () => this.captureRelay());
    this.root.querySelectorAll("[data-relay-action]").forEach(button => button.onclick = () => this.handleRelayAction(button.dataset.relayAction));
  }

  captureAutomation() {
    const next = {};
    this.root.querySelectorAll("[data-auto]").forEach(input => next[input.dataset.auto] = input.type === "checkbox" ? input.checked : cast(input.value));
    this.settings = this.store.save(next);
    this.onChange?.(this.settings);
  }

  captureVisibility() {
    const next = { ...this.eventVisibility };
    this.root.querySelectorAll("[data-event-type]").forEach(input => next[input.dataset.eventType] = input.checked);
    this.eventVisibility = saveEventVisibility(next);
  }

  captureRelay() {
    const next = {};
    this.root.querySelectorAll("[data-relay]").forEach(input => next[input.dataset.relay] = input.type === "checkbox" ? input.checked : input.value);
    this.relaySettings = saveNodeRelaySettings(next);
    this.relayReport(this.relaySettings.enabled ? "Node relay selected" : "Extension bridge selected");
  }

  async handleRelayAction(action) {
    if (action === "extension") {
      this.relaySettings = saveNodeRelaySettings({ enabled: false });
      this.relayReport("Extension bridge selected");
      this.render();
      return;
    }
    if (action === "control" || action === "login") {
      this.relaySettings = saveNodeRelaySettings({ ...this.relaySettings, enabled: true });
      this.relayReport("Opening localhost control URL…");
      const url = action === "login" ? await openRelayLogin() : await openRelayControl();
      this.relayReport(`Split relay control opened: ${url}`);
      this.render();
      return;
    }
    if (action === "health") {
      this.relayReport("Checking relay…");
      const ok = await checkNodeRelay();
      this.relayReport(ok ? "Node relay is reachable" : "Node relay not reachable yet. Run: node chatgpt-node-relay.cjs");
    }
  }

  getSettings() { return this.settings; }
  report(text) { const status = this.root.querySelector("#automation-status"); if (status) status.textContent = text; }
  relayReport(text) { const status = this.root.querySelector("#relay-status"); if (status) status.textContent = text; }
}

function tab(name, labelText, active) { return `<button type="button" data-tab="${name}" class="${active === name ? "active" : ""}">${labelText}</button>`; }
function field(name, labelText, type, value) { const checked = type === "checkbox" && value ? "checked" : ""; const val = type === "checkbox" ? "" : `value="${attr(value)}"`; return `<label class="automation-field">${labelText}<input data-auto="${name}" type="${type}" ${val} ${checked}></label>`; }
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
