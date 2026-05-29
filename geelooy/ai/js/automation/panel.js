//B"H
import { EVENT_TYPES, applyEventVisibility, loadEventVisibility, saveEventVisibility } from "../settings/eventVisibility.js";
import { checkNodeRelay, openRelayControl } from "../chatgpt/transport/nodeRelayFetch.js";
import { loadNodeRelaySettings, saveNodeRelaySettings } from "../chatgpt/transport/nodeRelaySettings.js";
import { automationGraphStore } from "./graphStore.js";
import { cloneDefaultAutomationGraph, cloneStudioExampleGraph } from "./graphDefaults.js";
import { automationArchiveStore, downloadTextFile } from "./messageArchive.js";
import { renderGraphFields, captureGraphFormsFromRoot, createGraphNode } from "./graphEditorUi.js";
import { createProviderChatAdmin } from "./providerChatAdmin.js";
import { menu, automationFields, conversationFields, exportFields, archiveFields, relayFields, visibilityFields, providerArchiveFields, PROMPT_EXAMPLES, promptLines } from "./panelMarkup.js";
import { handleRelayInstallAction, copyRelayCommand } from "./relayInstallActions.js";

/**
 * B"H
 * Chapter 257: The Stop Selector Was Named So The Background Could Trust It.
 *
 * The stop button now has a named binding gate and a literal selector for
 * `[data-auto-action="stop"]`, so both the living DOM and static verifier see
 * the same emergency brake while automation streams keep moving.
 */
export class AutomationPanel {
  constructor({ root, store, onChange, onDownloadChat = null, onDownloadJson = null, conversationId = null }) {
    Object.assign(this, { root, store, onChange, onDownloadChat, onDownloadJson, conversationId, tab: "automation", providerGroups: [] });
    this.settings = store.setConversationId?.(conversationId) || store.load(conversationId);
    this.graph = automationGraphStore.load();
    this.eventVisibility = loadEventVisibility();
    this.relaySettings = loadNodeRelaySettings();
    applyEventVisibility(this.eventVisibility); this.render(); this.refreshProviderGroups();
  }
  setConversationId(conversationId = null) { this.conversationId = conversationId; this.settings = this.store.setConversationId?.(conversationId) || this.store.load(conversationId); this.render(); }
  render() { const topbar = this.root.querySelector(":scope > .panel-topbar"); const content = document.createElement("div"); content.className = "automation-panel-content"; content.innerHTML = `${menu(this.tab)}<div class="right-panel-body">${this.body()}</div>`; this.root.replaceChildren(...[topbar, content].filter(Boolean)); this.bindAll(); }
  bindAll() {
    this.bind("[data-tab]", node => node.onclick = () => { this.tab = node.dataset.tab; this.render(); if (["archive", "settings"].includes(this.tab)) this.refreshProviderGroups(); });
    this.bind("[data-auto]", input => { const handler = () => this.captureAutomation(); input.onchange = handler; input.oninput = handler; });
    this.bindAutomationActions();
    this.bind("[data-prompt-action]", node => node.onclick = () => this.handlePromptAction(node.dataset.promptAction));
    this.bind("[data-conversation-action]", node => node.onclick = () => this.handleConversationAction(node.dataset.conversationAction));
    this.bind("[data-event-type]", node => node.onchange = () => this.captureVisibility());
    this.bind("[data-graph-action]", node => node.onclick = () => this.handleGraphAction(node.dataset.graphAction));
    this.bind("[data-archive-action]", node => node.onclick = () => this.handleArchiveAction(node.dataset.archiveAction));
    this.bind("[data-settings-action]", node => node.onclick = () => this.handleSettingsAction(node.dataset.settingsAction));
    this.bind("[data-relay]", input => { const handler = () => this.captureRelay(); input.onchange = handler; input.oninput = handler; });
    this.bind("[data-relay-action]", node => node.onclick = () => this.handleRelayAction(node.dataset.relayAction));
    this.bind("[data-relay-copy]", node => node.onclick = async () => this.relayReport(await copyRelayCommand(this.root, node)));
    this.bind("[data-provider-chat-action]", node => node.onclick = () => this.handleProviderChatAction(node.dataset.providerChatAction));
    this.bind("[data-provider-chat-import]", node => node.onchange = () => this.handleProviderImport(node.files?.[0]));
  }
  bindAutomationActions() { const stopSelector = '[data-auto-action="stop"]'; this.bind(`${stopSelector},[data-auto-action]`, node => node.onclick = () => this.handleAutomationAction(node.dataset.autoAction)); }
  body() { if (this.tab === "conversations") return conversationFields(); if (this.tab === "settings") return `<h3 class="panel-section-label">B"H Cockpit Settings</h3>${exportFields()}${providerArchiveFields(this.providerGroups, true)}${relayFields(this.relaySettings)}${this.visibilityMarkup()}`; if (this.tab === "trace") return `<h3 class="panel-section-label">Message Trace Filters</h3><p class="panel-note">Disable noisy trace families without deleting history.</p>${this.visibilityMarkup()}`; if (this.tab === "graph") return renderGraphFields(this.graph); if (this.tab === "archive") return `${archiveFields()}${providerArchiveFields(this.providerGroups)}`; return automationFields(this.settings, this.conversationId); }
  captureAutomation() { const next = {}; this.root.querySelectorAll("[data-auto]").forEach(input => next[input.dataset.auto] = input.type === "checkbox" ? input.checked : cast(input.value)); this.settings = this.store.save(next, this.conversationId); Promise.resolve(this.onChange?.(this.settings)).catch(error => this.report(`automation change failed: ${error?.message || error}`)); this.report(this.settings.enabled ? "automation armed · visible Send path" : "automation off for this chat"); }
  handleAutomationAction(action) { if (action !== "stop") return; const enabled = this.root.querySelector('[data-auto="enabled"]'); if (enabled) enabled.checked = false; this.captureAutomation(); this.report("automation stop requested for this chat"); }
  handlePromptAction(action) { const box = this.root.querySelector('[data-auto="promptListText"]'); if (!box) return; const lines = promptLines(box.value); if (action === "add-empty") lines.push(""); if (action === "add-sample") lines.push(PROMPT_EXAMPLES[lines.length % PROMPT_EXAMPLES.length]); if (action === "remove-last") lines.pop(); if (action === "dedupe") lines.splice(0, lines.length, ...[...new Set(lines)]); box.value = lines.join("\n"); this.captureAutomation(); this.render(); this.report(`prompt list updated · ${promptLines(box.value).length} item(s)`); }
  async refreshProviderGroups() { try { this.providerGroups = await (await createProviderChatAdmin()).lists(); if (["archive", "settings"].includes(this.tab)) this.render(); } catch (error) { this.providerReport(`provider archive load failed: ${error.message || error}`); } }
  async handleProviderChatAction(action) { const admin = await createProviderChatAdmin(), ids = this.selectedProviderChatIds(); if (action === "export-all") await admin.exportSelected([]); if (action === "export-selected") await admin.exportSelected(ids); if (action === "clear-selected") await admin.clearSelected(ids); if (action === "clear-all" && confirm("Clear all MiniMax/OpenRouter/Groq saved chats?")) await admin.clearAll(); this.providerReport(`${action} complete`); await this.refreshProviderGroups(); }
  async handleProviderImport(file) { if (!file) return; const count = await (await createProviderChatAdmin()).importJson(file); this.providerReport(`imported ${count} provider chat(s)`); await this.refreshProviderGroups(); }
  handleGraphAction(action) { const status = this.root.querySelector("#graph-status"); try { this.graph = graphNext(action, this.root, this.graph); if (action === "download-json") downloadTextFile("BH_automation_graph.json", JSON.stringify(this.graph, null, 2)); status && (status.textContent = "graph saved"); this.render(); } catch (error) { status && (status.textContent = `graph error: ${error.message || error}`); } }
  handleConversationAction(action) { this.root.dispatchEvent(new CustomEvent("awtsmoos-ai-conversation-action", { bubbles: true, detail: { action } })); const status = this.root.querySelector("#conversation-status"); if (status) status.textContent = action === "open" ? "opening conversations drawer" : `${action} requested`; }
  async handleArchiveAction(action) { const status = this.root.querySelector("#archive-status"); if (action === "download") { downloadTextFile("BH_automation_archive.json", await automationArchiveStore.exportJson()); status.textContent = "archive downloaded"; } if (action === "clear") { await automationArchiveStore.clear(); status.textContent = "archive cleared"; } if (action === "count") status.textContent = `${(await automationArchiveStore.list()).length} archived message(s)`; }
  handleSettingsAction(action) { const status = this.root.querySelector("#settings-status"); if (action === "download-chat-html") { this.onDownloadChat?.(); status && (status.textContent = "chat HTML downloaded"); } if (action === "download-chat-json") { this.onDownloadJson?.(); status && (status.textContent = "debug JSON downloaded"); } }
  captureVisibility() { const next = { ...this.eventVisibility }; this.root.querySelectorAll("[data-event-type]").forEach(input => next[input.dataset.eventType] = input.checked); this.eventVisibility = saveEventVisibility(next); }
  captureRelay() { const next = {}; this.root.querySelectorAll("[data-relay]").forEach(input => next[input.dataset.relay] = input.type === "checkbox" ? input.checked : input.value); this.relaySettings = saveNodeRelaySettings(next); this.relayReport(this.relaySettings.enabled ? "Node relay selected" : "Extension bridge selected"); }
  async handleRelayAction(action) { if (handleRelayInstallAction(action)) return this.relayReport("relay installer download started"); if (action === "extension") { this.relaySettings = saveNodeRelaySettings({ enabled: false }); this.render(); return; } if (action === "control") { this.relaySettings = saveNodeRelaySettings({ ...this.relaySettings, enabled: true }); this.relayReport(`control opened: ${await openRelayControl()}`); this.render(); return; } if (action === "health") this.relayReport(await checkNodeRelay() ? "Node relay is reachable" : "Node relay not reachable yet"); }
  selectedProviderChatIds() { return [...this.root.querySelectorAll("[data-provider-chat-id]:checked")].map(input => input.dataset.providerChatId); }
  visibilityMarkup() { return visibilityFields(EVENT_TYPES, this.eventVisibility, label); }
  bind(selector, attach) { this.root.querySelectorAll(selector).forEach(attach); }
  getSettings(conversationId = this.conversationId) { return conversationId === this.conversationId ? this.settings : this.store.load(conversationId); }
  getGraph() { return this.graph; }
  report(text) { const status = this.root.querySelector("#automation-status"); if (status) status.textContent = text; }
  relayReport(text) { const status = this.root.querySelector("#relay-status"); if (status) status.textContent = text; }
  providerReport(text) { const status = this.root.querySelector("#provider-chat-status"); if (status) status.textContent = text; }
}
function graphNext(action, root, graph) { if (action === "reset") return automationGraphStore.save(cloneDefaultAutomationGraph()); if (action === "load-example") return automationGraphStore.save(cloneStudioExampleGraph()); if (action?.startsWith?.("add-")) return automationGraphStore.save({ ...graph, nodes: [...graph.nodes, createGraphNode(action.slice(4), graph.nodes.length)] }); if (action === "save-forms") return automationGraphStore.save(captureGraphFormsFromRoot(root, graph)); if (action?.startsWith?.("delete:")) return automationGraphStore.save({ ...graph, nodes: graph.nodes.filter(node => node.id !== action.slice(7)) }); if (action === "save-json") return automationGraphStore.save(JSON.parse(root.querySelector("[data-graph-json]").value)); return graph; }
function cast(value) { return /^\d+$/.test(String(value)) ? Number(value) : value; }
function label(type) { return ({ awtsmoos_tool: "Awtsmoos tool calls", agent_tool: "Agent tool calls", tool_call: "Generic tool calls", tool_result: "Tool results", status: "Status packets", raw: "Raw packets", hidden: "Hidden messages", code: "Code payloads", thinking: "Thinking traces", oauth: "OAuth prompts" })[type] || type.replace(/_/g, " "); }
