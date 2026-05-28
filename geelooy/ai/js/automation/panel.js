//B"H
import { EVENT_TYPES, applyEventVisibility, loadEventVisibility, saveEventVisibility } from "../settings/eventVisibility.js";
import { checkNodeRelay, openRelayControl, openRelayLogin } from "../chatgpt/transport/nodeRelayFetch.js";
import { loadNodeRelaySettings, saveNodeRelaySettings } from "../chatgpt/transport/nodeRelaySettings.js";
import { automationGraphStore } from "./graphStore.js";
import { cloneDefaultAutomationGraph, cloneStudioExampleGraph } from "./graphDefaults.js";
import { automationArchiveStore, downloadTextFile } from "./messageArchive.js";
import { renderGraphFields, captureGraphFormsFromRoot, createGraphNode } from "./graphEditorUi.js";

const TAB_LABELS = { automation: "Automation", graph: "Graph", archive: "Archive", settings: "Settings", trace: "Trace filters" };

/**
 * Chapter 114: The Right Panel Learns Which Chat It Serves.
 *
 * The panel no longer edits a global automation switch. It is rebound whenever
 * the visible conversation changes, and every checkbox, prompt list, and delay
 * belongs to that one conversation vessel.
 */
export class AutomationPanel {
  constructor({ root, store, onChange, onDownloadChat = null, onDownloadJson = null, conversationId = null }) {
    this.root = root;
    this.store = store;
    this.onChange = onChange;
    this.onDownloadChat = onDownloadChat;
    this.onDownloadJson = onDownloadJson;
    this.conversationId = conversationId;
    this.settings = store.setConversationId?.(conversationId) || store.load(conversationId);
    this.graph = automationGraphStore.load();
    this.eventVisibility = loadEventVisibility();
    this.relaySettings = loadNodeRelaySettings();
    this.tab = "automation";
    applyEventVisibility(this.eventVisibility);
    this.render();
  }

  setConversationId(conversationId = null) {
    this.conversationId = conversationId;
    this.settings = this.store.setConversationId?.(conversationId) || this.store.load(conversationId);
    this.render();
  }

  render() {
    const topbar = this.root.querySelector(":scope > .panel-topbar");
    const content = document.createElement("div");
    content.className = "automation-panel-content";
    content.innerHTML = `${this.menu()}<div class="right-panel-body">${this.body()}</div>`;
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

  menu() {
    return `<details class="right-menu"><summary aria-label="Open settings sections"><span class="hamburger-bars" aria-hidden="true">☰</span><span class="right-menu-current">${TAB_LABELS[this.tab]}</span></summary><div class="right-tabs">${Object.entries(TAB_LABELS).map(([name, labelText]) => tab(name, labelText, this.tab)).join("")}</div></details>`;
  }

  body() {
    if (this.tab === "settings") return `<h3 class="panel-section-label">B"H Cockpit Settings</h3><p class="panel-note">The right drawer is a compact multi-panel vessel.</p>${this.exportFields()}${this.relayFields()}${this.visibilityFields()}`;
    if (this.tab === "trace") return `<h3 class="panel-section-label">Message Trace Filters</h3><p class="panel-note">Disable noisy trace families without deleting them from history.</p>${this.visibilityFields()}`;
    if (this.tab === "graph") return this.graphFields();
    if (this.tab === "archive") return this.archiveFields();
    return this.automationFields();
  }

  automationFields() {
    const mode = this.settings.promptMode || "single";
    return `<h3 class="panel-section-label">Automation Pipeline</h3>
      <div class="chat-scope-pill">This chat: ${this.conversationId ? escapeText(this.conversationId).slice(0, 26) : "new chat"} · ${this.settings.enabled ? "on" : "off"}</div>
      <label class="automation-toggle-row"><span><b>Enable auto-continue</b><small>Only for this current chat. Other chats stay off.</small></span><input data-auto="enabled" type="checkbox" ${this.settings.enabled ? "checked" : ""}></label>
      <div class="automation-actions"><button type="button" class="automation-stop-button" data-auto-action="stop">Stop this chat now</button></div>
      <div class="automation-two-col">${field("maxTurns", "Max turns", "number", this.settings.maxTurns)}${field("delayMs", "Delay ms", "number", this.settings.delayMs)}${field("streamSettleMs", "Stream settle ms", "number", this.settings.streamSettleMs)}</div>
      <label class="automation-field prompt-mode-field">Prompt mode<select data-auto="promptMode"><option value="single" ${sel(mode, "single")}>single prompt</option><option value="cycle" ${sel(mode, "cycle")}>cycle list</option><option value="random" ${sel(mode, "random")}>random from list</option></select></label>
      <label class="automation-field prompt-field">Single prompt<textarea data-auto="prompt" rows="4">${text(this.settings.prompt)}</textarea></label>
      <label class="automation-field prompt-list-field">Prompt list, one per line<textarea data-auto="promptListText" rows="7">${text(this.settings.promptListText)}</textarea><small>Use cycle or random mode to rotate these prompts.</small></label>
      <label class="automation-toggle-row compact"><span><b>Stop on error</b><small>Recommended when ChatGPT returns 403 or auth errors.</small></span><input data-auto="stopOnError" type="checkbox" ${this.settings.stopOnError !== false ? "checked" : ""}></label>
      <div class="automation-status" id="automation-status">${this.settings.enabled ? "automation armed for this chat" : "automation off for this chat"}</div>`;
  }

  graphFields() { return renderGraphFields(this.graph); }
  exportFields() { return `<section class="automation-card chat-export-card"><h3>Chat export</h3><p class="panel-note">Download the loaded RAM conversation as readable HTML, or full debug JSON.</p><div class="relay-actions"><button type="button" data-settings-action="download-chat-html">Download chat HTML</button><button type="button" data-settings-action="download-chat-json">Download debug JSON</button></div><div class="automation-status" id="settings-status">ready</div></section>`; }
  archiveFields() { return `<section class="automation-archive-panel"><h3 class="panel-section-label">Automation Archive</h3><p class="panel-note">Assistant replies are stored for graph runs.</p><div class="graph-toolbar"><button type="button" data-archive-action="download">Download archive JSON</button><button type="button" data-archive-action="clear">Clear archive</button><button type="button" data-archive-action="count">Count messages</button></div><div class="automation-status" id="archive-status">archive ready</div></section>`; }
  relayFields() { return `<section class="automation-card relay-card"><h3>ChatGPT transport</h3><p class="panel-note">Default is extension bridge. Relay is experimental.</p><label class="automation-field">Relay URL<input data-relay="url" value="${attr(this.relaySettings.url)}"></label><label class="automation-toggle-row compact"><span><b>Use Node relay</b><small>Extension is safer for normal ChatGPT automation.</small></span><input data-relay="enabled" type="checkbox" ${this.relaySettings.enabled ? "checked" : ""}></label><div class="relay-actions"><button type="button" data-relay-action="health">Check relay</button><button type="button" data-relay-action="control">Open control</button><button type="button" data-relay-action="extension">Use extension</button></div><div class="automation-status" id="relay-status">${this.relaySettings.enabled ? "Node relay selected" : "Extension bridge selected"}</div></section>`; }
  visibilityFields() { return `<div class="event-filter-grid">${EVENT_TYPES.map(type => `<label class="automation-field event-filter"><input data-event-type="${type}" type="checkbox" ${this.eventVisibility[type] !== false ? "checked" : ""}> Show ${label(type)}</label>`).join("")}</div>`; }

  bindTabs() { this.root.querySelectorAll("[data-tab]").forEach(btn => btn.onclick = () => { this.tab = btn.dataset.tab; this.render(); }); }
  bindAutomation() { this.root.querySelectorAll("[data-auto]").forEach(input => { const handler = () => this.captureAutomation(); input.oninput = handler; input.onchange = handler; }); }
  bindAutomationActions() { this.root.querySelectorAll("[data-auto-action]").forEach(button => button.onclick = () => { if (button.dataset.autoAction !== "stop") return; const enabled = this.root.querySelector('[data-auto="enabled"]'); if (enabled) enabled.checked = false; this.captureAutomation(); this.report("automation stop requested for this chat"); }); }
  bindVisibility() { this.root.querySelectorAll("[data-event-type]").forEach(input => input.onchange = () => this.captureVisibility()); }
  bindGraph() { this.root.querySelectorAll("[data-graph-action]").forEach(button => button.onclick = () => this.handleGraphAction(button.dataset.graphAction)); }
  bindArchive() { this.root.querySelectorAll("[data-archive-action]").forEach(button => button.onclick = () => this.handleArchiveAction(button.dataset.archiveAction)); }
  bindSettingsActions() { this.root.querySelectorAll("[data-settings-action]").forEach(button => button.onclick = () => this.handleSettingsAction(button.dataset.settingsAction)); }
  bindRelay() { this.root.querySelectorAll("[data-relay]").forEach(input => input.oninput = () => this.captureRelay()); this.root.querySelectorAll("[data-relay-action]").forEach(button => button.onclick = () => this.handleRelayAction(button.dataset.relayAction)); }

  captureAutomation() {
    const next = {};
    this.root.querySelectorAll("[data-auto]").forEach(input => next[input.dataset.auto] = input.type === "checkbox" ? input.checked : cast(input.value));
    this.settings = this.store.save(next, this.conversationId);
    Promise.resolve(this.onChange?.(this.settings)).catch(error => this.report(`automation change failed: ${error?.message || error}`));
  }

  handleGraphAction(action) {
    const status = this.root.querySelector("#graph-status");
    try {
      if (action === "reset") this.graph = automationGraphStore.save(cloneDefaultAutomationGraph());
      if (action === "load-example") this.graph = automationGraphStore.save(cloneStudioExampleGraph());
      if (action?.startsWith?.("add-")) this.graph = automationGraphStore.save({ ...this.graph, nodes: [...this.graph.nodes, createGraphNode(action.slice(4), this.graph.nodes.length)] });
      if (action === "save-forms") this.graph = automationGraphStore.save(this.captureGraphForms());
      if (action?.startsWith?.("delete:")) this.graph = automationGraphStore.save({ ...this.graph, nodes: this.graph.nodes.filter(node => node.id !== action.slice(7)) });
      if (action === "save-json") this.graph = automationGraphStore.save(JSON.parse(this.root.querySelector("[data-graph-json]").value));
      if (action === "download-json") downloadTextFile("BH_automation_graph.json", JSON.stringify(this.graph, null, 2));
      status && (status.textContent = "graph saved");
      this.render();
    } catch (error) { status && (status.textContent = `graph error: ${error.message || error}`); }
  }

  captureGraphForms() { return captureGraphFormsFromRoot(this.root, this.graph); }
  handleSettingsAction(action) { const status = this.root.querySelector("#settings-status"); if (action === "download-chat-html") { this.onDownloadChat?.(); status && (status.textContent = "chat HTML downloaded"); } if (action === "download-chat-json") { this.onDownloadJson?.(); status && (status.textContent = "debug JSON downloaded"); } }
  async handleArchiveAction(action) { const status = this.root.querySelector("#archive-status"); if (action === "download") { downloadTextFile("BH_automation_archive.json", await automationArchiveStore.exportJson()); status.textContent = "archive downloaded"; } if (action === "clear") { await automationArchiveStore.clear(); status.textContent = "archive cleared"; } if (action === "count") { status.textContent = `${(await automationArchiveStore.list()).length} archived message(s)`; } }
  captureVisibility() { const next = { ...this.eventVisibility }; this.root.querySelectorAll("[data-event-type]").forEach(input => next[input.dataset.eventType] = input.checked); this.eventVisibility = saveEventVisibility(next); }
  captureRelay() { const next = {}; this.root.querySelectorAll("[data-relay]").forEach(input => next[input.dataset.relay] = input.type === "checkbox" ? input.checked : input.value); this.relaySettings = saveNodeRelaySettings(next); this.relayReport(this.relaySettings.enabled ? "Node relay selected" : "Extension bridge selected"); }
  async handleRelayAction(action) { if (action === "extension") { this.relaySettings = saveNodeRelaySettings({ enabled: false }); this.relayReport("Extension bridge selected"); this.render(); return; } if (action === "control" || action === "login") { this.relaySettings = saveNodeRelaySettings({ ...this.relaySettings, enabled: true }); this.relayReport("Opening localhost control URL…"); const url = action === "login" ? await openRelayLogin() : await openRelayControl(); this.relayReport(`Split relay control opened: ${url}`); this.render(); return; } if (action === "health") { this.relayReport("Checking relay…"); this.relayReport(await checkNodeRelay() ? "Node relay is reachable" : "Node relay not reachable yet"); } }

  getSettings(conversationId = this.conversationId) { return conversationId === this.conversationId ? this.settings : this.store.load(conversationId); }
  getGraph() { return this.graph; }
  report(text) { const status = this.root.querySelector("#automation-status"); if (status) status.textContent = text; }
  relayReport(text) { const status = this.root.querySelector("#relay-status"); if (status) status.textContent = text; }
}

function tab(name, labelText, active) { return `<button type="button" data-tab="${name}" class="${active === name ? "active" : ""}">${labelText}</button>`; }
function field(name, labelText, type, value) { return `<label class="automation-field">${labelText}<input data-auto="${name}" type="${type}" value="${attr(value)}"></label>`; }
function sel(value, option) { return value === option ? "selected" : ""; }
function cast(value) { return /^\d+$/.test(String(value)) ? Number(value) : value; }
function attr(value) { return String(value ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function text(value) { return String(value ?? "").replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }
function escapeText(value) { return text(value); }
function label(type) { return ({ awtsmoos_tool: "Awtsmoos tool calls", agent_tool: "Agent tool calls", tool_call: "Generic tool calls", tool_result: "Tool results", status: "Status packets", raw: "Raw packets", hidden: "Hidden messages", code: "Code payloads", thinking: "Thinking traces", oauth: "OAuth prompts" })[type] || type.replace(/_/g, " "); }
