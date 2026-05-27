//B"H
import { EVENT_TYPES, applyEventVisibility, loadEventVisibility, saveEventVisibility } from "../settings/eventVisibility.js";
import { checkNodeRelay, openRelayControl, openRelayLogin } from "../chatgpt/transport/nodeRelayFetch.js";
import { loadNodeRelaySettings, saveNodeRelaySettings } from "../chatgpt/transport/nodeRelaySettings.js";
import { automationGraphStore } from "./graphStore.js";
import { cloneDefaultAutomationGraph, cloneStudioExampleGraph } from "./graphDefaults.js";
import { automationArchiveStore, downloadTextFile } from "./messageArchive.js";
import { renderGraphFields, captureGraphFormsFromRoot, createGraphNode } from "./graphEditorUi.js";

export class AutomationPanel {
  constructor({ root, store, onChange, onDownloadChat = null, onDownloadJson = null }) {
    this.root = root;
    this.store = store;
    this.onChange = onChange;
    this.onDownloadChat = onDownloadChat;
    this.onDownloadJson = onDownloadJson;
    this.settings = store.load();
    this.graph = automationGraphStore.load();
    this.eventVisibility = loadEventVisibility();
    this.relaySettings = loadNodeRelaySettings();
    this.tab = "automation";
    applyEventVisibility(this.eventVisibility);
    this.render();
  }

  render() {
    const topbar = this.root.querySelector(":scope > .panel-topbar");
    const content = document.createElement("div");
    content.className = "automation-panel-content";
    content.innerHTML = `<div class="right-tabs">
      ${tab("automation", "Automation", this.tab)}${tab("graph", "Graph", this.tab)}${tab("archive", "Archive", this.tab)}${tab("settings", "Settings", this.tab)}${tab("trace", "Trace filters", this.tab)}
    </div><div class="right-panel-body">${this.body()}</div>`;
    this.root.replaceChildren(...[topbar, content].filter(Boolean));
    this.bindTabs();
    this.bindAutomation();
    this.bindAutomationActions();
    this.bindGraph();
    this.bindArchive();
    this.bindSettingsActions();
    this.bindVisibility();
    this.bindRelay();
  }

  body() {
    if (this.tab === "settings") return `<h2>B"H Cockpit Settings</h2><p class="panel-note">The right drawer is now a multi-panel vessel.</p>${this.exportFields()}${this.relayFields()}${this.visibilityFields()}`;
    if (this.tab === "trace") return `<h2>Message Trace Filters</h2><p class="panel-note">Disable noisy trace families without deleting them from history.</p>${this.visibilityFields()}`;
    if (this.tab === "graph") return this.graphFields();
    if (this.tab === "archive") return this.archiveFields();
    return `<h2>Automation Pipeline</h2>${field("enabled", "Enable auto-continue", "checkbox", this.settings.enabled)}<div class="automation-actions"><button type="button" class="automation-stop-button" data-auto-action="stop">Stop automation now</button></div>${field("maxTurns", "Max turns", "number", this.settings.maxTurns)}${field("delayMs", "Delay ms", "number", this.settings.delayMs)}${field("streamSettleMs", "Stream settle ms", "number", this.settings.streamSettleMs)}<label class="automation-field prompt-field">Prompt<textarea data-auto="prompt" rows="7">${text(this.settings.prompt)}</textarea></label><div class="automation-status" id="automation-status">${this.settings.enabled ? "automation armed" : "automation off"}</div>`;
  }

  graphFields() {
    return renderGraphFields(this.graph);
  }

  exportFields() {
    return `<section class="automation-card chat-export-card"><h3>Chat export</h3><p class="panel-note">Download the loaded RAM conversation as readable HTML, or the full unfiltered debug JSON with records, raw packets, events, and live flags.</p><div class="relay-actions"><button type="button" data-settings-action="download-chat-html">Download chat HTML</button><button type="button" data-settings-action="download-chat-json">Download full debug JSON</button></div><div class="automation-status" id="settings-status">ready</div></section>`;
  }

  archiveFields() {
    return `<section class="automation-archive-panel">
      <h2>Automation Archive</h2>
      <p class="panel-note">Assistant replies are stored in IndexedDB for graph runs. Download or clear the archive here.</p>
      <div class="graph-toolbar">
        <button type="button" data-archive-action="download">Download archive JSON</button>
        <button type="button" data-archive-action="clear">Clear archive</button>
        <button type="button" data-archive-action="count">Count messages</button>
      </div>
      <div class="automation-status" id="archive-status">archive ready</div>
    </section>`;
  }

  relayFields() {
    const enabled = this.relaySettings.enabled ? "checked" : "";
    return `<section class="automation-card relay-card">
      <h3>ChatGPT transport</h3>
      <p class="panel-note">Use the extension bridge, or connect to the experimental split-browser relay already running from <code>geelooy/ai/relay/split-browser</code>.</p>
      <label class="automation-field">Relay URL<input data-relay="url" value="${attr(this.relaySettings.url)}"></label>
      <label class="automation-field"><input data-relay="enabled" type="checkbox" ${enabled}> Use Node relay instead of extension</label>
      <div class="relay-actions"><button type="button" data-relay-action="health">Check split relay</button><button type="button" data-relay-action="control">Get localhost control URL</button><button type="button" data-relay-action="extension">Switch back to extension</button></div>
      <div class="automation-status" id="relay-status">${this.relaySettings.enabled ? "Node relay selected" : "Extension bridge selected"}</div>
    </section>`;
  }

  visibilityFields() {
    return `<div class="event-filter-grid">${EVENT_TYPES.map(type => `<label class="automation-field event-filter"><input data-event-type="${type}" type="checkbox" ${this.eventVisibility[type] !== false ? "checked" : ""}> Show ${label(type)}</label>`).join("")}</div>`;
  }

  bindTabs() { this.root.querySelectorAll("[data-tab]").forEach(btn => btn.onclick = () => { this.tab = btn.dataset.tab; this.render(); }); }
  bindAutomation() {
    this.root.querySelectorAll("[data-auto]").forEach(input => {
      const handler = () => this.captureAutomation();
      input.oninput = handler;
      input.onchange = handler;
    });
  }
  bindAutomationActions() {
    this.root.querySelectorAll("[data-auto-action]").forEach(button => button.onclick = () => {
      if (button.dataset.autoAction !== "stop") return;
      const enabled = this.root.querySelector('[data-auto="enabled"]');
      if (enabled) enabled.checked = false;
      this.captureAutomation();
      this.report("automation stop requested");
    });
  }
  bindAutomationActions() {
    this.root.querySelectorAll("[data-auto-action]").forEach(button => button.onclick = () => {
      if (button.dataset.autoAction !== "stop") return;
      const enabled = this.root.querySelector('[data-auto="enabled"]');
      if (enabled) enabled.checked = false;
      this.captureAutomation();
      this.report("automation stop requested");
    });
  }
  bindVisibility() { this.root.querySelectorAll("[data-event-type]").forEach(input => input.onchange = () => this.captureVisibility()); }

  bindGraph() {
    this.root.querySelectorAll("[data-graph-action]").forEach(button => button.onclick = () => this.handleGraphAction(button.dataset.graphAction));
  }

  bindArchive() {
    this.root.querySelectorAll("[data-archive-action]").forEach(button => button.onclick = () => this.handleArchiveAction(button.dataset.archiveAction));
  }

  bindSettingsActions() {
    this.root.querySelectorAll("[data-settings-action]").forEach(button => button.onclick = () => this.handleSettingsAction(button.dataset.settingsAction));
  }

  bindRelay() {
    this.root.querySelectorAll("[data-relay]").forEach(input => input.oninput = () => this.captureRelay());
    this.root.querySelectorAll("[data-relay-action]").forEach(button => button.onclick = () => this.handleRelayAction(button.dataset.relayAction));
  }

  captureAutomation() {
    const next = {};
    this.root.querySelectorAll("[data-auto]").forEach(input => next[input.dataset.auto] = input.type === "checkbox" ? input.checked : cast(input.value));
    this.settings = this.store.save(next);
    Promise.resolve(this.onChange?.(this.settings)).catch(error => this.report(`automation change failed: ${error?.message || error}`));
  }

  handleGraphAction(action) {
    const status = this.root.querySelector("#graph-status");
    try {
      if (action === "reset") this.graph = automationGraphStore.save(cloneDefaultAutomationGraph());
      if (action === "load-example") this.graph = automationGraphStore.save(cloneStudioExampleGraph());
      if (action === "add-session") this.graph = automationGraphStore.save({ ...this.graph, nodes: [...this.graph.nodes, createGraphNode("session", this.graph.nodes.length)] });
      if (action === "add-send") this.graph = automationGraphStore.save({ ...this.graph, nodes: [...this.graph.nodes, createGraphNode("send", this.graph.nodes.length)] });
      if (action === "add-condition") this.graph = automationGraphStore.save({ ...this.graph, nodes: [...this.graph.nodes, createGraphNode("condition", this.graph.nodes.length)] });
      if (action === "add-memory") this.graph = automationGraphStore.save({ ...this.graph, nodes: [...this.graph.nodes, createGraphNode("memory", this.graph.nodes.length)] });
      if (action === "add-compile") this.graph = automationGraphStore.save({ ...this.graph, nodes: [...this.graph.nodes, createGraphNode("compile", this.graph.nodes.length)] });
      if (action === "add-archive") this.graph = automationGraphStore.save({ ...this.graph, nodes: [...this.graph.nodes, createGraphNode("archive", this.graph.nodes.length)] });
      if (action === "add-delay") this.graph = automationGraphStore.save({ ...this.graph, nodes: [...this.graph.nodes, createGraphNode("delay", this.graph.nodes.length)] });
      if (action === "add-jump") this.graph = automationGraphStore.save({ ...this.graph, nodes: [...this.graph.nodes, createGraphNode("jump", this.graph.nodes.length)] });
      if (action === "add-stop") this.graph = automationGraphStore.save({ ...this.graph, nodes: [...this.graph.nodes, createGraphNode("stop", this.graph.nodes.length)] });
      if (action === "save-forms") this.graph = automationGraphStore.save(this.captureGraphForms());
      if (action?.startsWith?.("delete:")) this.graph = automationGraphStore.save({ ...this.graph, nodes: this.graph.nodes.filter(node => node.id !== action.slice(7)) });
      if (action === "save-json") this.graph = automationGraphStore.save(JSON.parse(this.root.querySelector("[data-graph-json]").value));
      if (action === "download-json") downloadTextFile("BH_automation_graph.json", JSON.stringify(this.graph, null, 2));
      status && (status.textContent = "graph saved");
      this.render();
    } catch (error) {
      status && (status.textContent = `graph error: ${error.message || error}`);
    }
  }

  captureGraphForms() {
    return captureGraphFormsFromRoot(this.root, this.graph);
  }

  handleSettingsAction(action) {
    const status = this.root.querySelector("#settings-status");
    if (action === "download-chat-html") {
      this.onDownloadChat?.();
      if (status) status.textContent = "chat HTML downloaded";
    }
    if (action === "download-chat-json") {
      this.onDownloadJson?.();
      if (status) status.textContent = "full debug JSON downloaded";
    }
    if (action === "download-chat-json") {
      this.onDownloadJson?.();
      if (status) status.textContent = "full debug JSON downloaded";
    }
  }

  async handleArchiveAction(action) {
    const status = this.root.querySelector("#archive-status");
    if (action === "download") {
      downloadTextFile("BH_automation_archive.json", await automationArchiveStore.exportJson());
      status.textContent = "archive downloaded";
    }
    if (action === "clear") {
      await automationArchiveStore.clear();
      status.textContent = "archive cleared";
    }
    if (action === "count") {
      const list = await automationArchiveStore.list();
      status.textContent = `${list.length} archived message(s)`;
    }
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
    if (action === "extension") { this.relaySettings = saveNodeRelaySettings({ enabled: false }); this.relayReport("Extension bridge selected"); this.render(); return; }
    if (action === "control" || action === "login") { this.relaySettings = saveNodeRelaySettings({ ...this.relaySettings, enabled: true }); this.relayReport("Opening localhost control URL…"); const url = action === "login" ? await openRelayLogin() : await openRelayControl(); this.relayReport(`Split relay control opened: ${url}`); this.render(); return; }
    if (action === "health") { this.relayReport("Checking relay…"); const ok = await checkNodeRelay(); this.relayReport(ok ? "Node relay is reachable" : "Node relay not reachable yet. Run: node chatgpt-node-relay.cjs"); }
  }

  getSettings() { return this.settings; }
  getGraph() { return this.graph; }
  report(text) { const status = this.root.querySelector("#automation-status"); if (status) status.textContent = text; }
  relayReport(text) { const status = this.root.querySelector("#relay-status"); if (status) status.textContent = text; }
}

function tab(name, labelText, active) { return `<button type="button" data-tab="${name}" class="${active === name ? "active" : ""}">${labelText}</button>`; }
function field(name, labelText, type, value) { const checked = type === "checkbox" && value ? "checked" : ""; const val = type === "checkbox" ? "" : `value="${attr(value)}"`; return `<label class="automation-field">${labelText}<input data-auto="${name}" type="${type}" ${val} ${checked}></label>`; }
function cast(value) { return /^\d+$/.test(String(value)) ? Number(value) : value; }
function attr(value) { return String(value ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function text(value) { return String(value ?? "").replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }
function label(type) { return ({ awtsmoos_tool: "Awtsmoos tool calls", agent_tool: "Agent tool calls", tool_call: "Generic tool calls", tool_result: "Tool results", status: "Status packets", raw: "Raw packets", hidden: "Hidden messages", code: "Code payloads", thinking: "Thinking traces", oauth: "OAuth prompts" })[type] || type.replace(/_/g, " "); }
