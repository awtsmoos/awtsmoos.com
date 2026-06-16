// B"H
import { h, field, area, out, $ } from "../ui/dom.js";
import { callFs } from "../api/tunnel.js";
import { show } from "../ui/api.js";
import { currentTargetVesselName, rememberTargetVessel, VIRTUAL_OS_TUNNEL } from "./vessels/selector.js";

const MODEL_MEMORY = "awtAiAgentModelChoice";
export const AI_PROVIDER_OPTIONS = Object.freeze([
  { value: "openrouter", text: "OpenRouter" },
  { value: "minimax", text: "MiniMax" },
  { value: "deepseek", text: "DeepSeek" },
  { value: "groq", text: "Groq" }
]);
let council = { agents: [], providers: [], config: {} };

/**
 * B"H
 * Chapter 36: The delegation council received a steering wheel.
 */
export function aiAgents() {
  return h("section", { className: "pane awt-ai-console", data: { pane: "aiAgents" } }, [
    h("div", { className: "page-head" }, [h("p", { className: "eyebrow", text: "AI Agents" }), h("h2", { text: "Delegation council" })]),
    targetPanel(), providerPanel(), configPanel(), taskPanel(), messagePanel(), out("aiAgentsOut", "Refresh the council to see live keys, models, target vessel, and readiness.")
  ]);
}

function targetPanel() {
  return h("article", { className: "panel stack awt-ai-target-panel" }, [
    h("h3", { text: "Target vessel for AI tools" }),
    h("p", { text: "All AI provider actions route to this selected vessel: native tunnel, browser tab, or hosted Virtual OS." }),
    h("div", { className: "form-grid" }, [
      h("label", {}, ["Selected vessel", h("select", { id: "aiTargetVessel" }, [h("option", { value: VIRTUAL_OS_TUNNEL, text: "Hosted Virtual OS" })])]),
      h("label", {}, ["Current target", h("input", { id: "aiTargetVesselDisplay", readOnly: true, value: VIRTUAL_OS_TUNNEL })])
    ]),
    h("p", { className: "notice", text: "Provider keys saved only to a native tunnel will not automatically exist in Hosted Virtual OS. Use the remote checkbox only when you explicitly want that copy." })
  ]);
}

function providerPanel() {
  return h("article", { className: "panel stack awt-ai-provider-panel" }, [
    h("h3", { text: "Provider keys and live models" }),
    h("p", { text: "By default a provider key is saved only to your selected local/browser vessel. Check the remote option only when hosted Virtual OS should use it too." }),
    h("div", { id: "aiProviderStatus", className: "awt-provider-status", text: "No provider status loaded yet." }),
    h("div", { className: "form-grid" }, [h("label", {}, ["Provider", providerSelect()]), h("label", {}, ["Live model", h("select", { id: "aiModelSelect" }, [h("option", { value: "", text: "Refresh council first" })])]), field("aiAgentModel", "Custom model override", { placeholder: "optional exact model id" }), field("aiProviderKey", "API key", { type: "password", placeholder: "Paste provider API key" })]),
    remoteSaveWarning(),
    h("div", { className: "button-row" }, [button("saveAiProviderKeyBtn", "Save provider key", "primary"), button("removeAiProviderKeyBtn", "Remove key"), button("loadAiAgentsBtn", "Refresh council")])
  ]);
}

function remoteSaveWarning() {
  return h("label", { className: "notice danger" }, [h("input", { id: "saveProviderKeyToAccount", type: "checkbox" }), " Also save this provider API key to my Awtsmoos account for hosted Virtual OS. This stores the key remotely, not only on this device."]);
}

function configPanel() {
  return h("article", { className: "panel stack awt-ai-config-panel" }, [h("h3", { text: "Recursive spawn limits" }), h("p", { text: "Raise these when you want more agents. Defaults are guarded so one prompt cannot explode forever." }), h("div", { className: "form-grid" }, [field("aiMaxDepth", "Max recursive depth", { type: "number", value: "3", min: "0" }), field("aiMaxChildren", "Max children per task", { type: "number", value: "8", min: "0" }), field("aiMaxTotalTasks", "Max total task records", { type: "number", value: "80", min: "1" }), h("label", {}, ["Allow recursive spawn", h("select", { id: "aiAllowRecursive" }, [h("option", { value: "true", text: "Yes" }), h("option", { value: "false", text: "No" })])])]), button("saveAiConfigBtn", "Save spawn limits", "primary")]);
}

function taskPanel() {
  return h("article", { className: "panel stack awt-ai-task-panel" }, [h("h3", { text: "Generic big task" }), h("div", { className: "form-grid" }, [field("aiTaskTitle", "Task title", { value: "Research and build plan" }), field("aiTaskOutputDir", "Output directory", { placeholder: "AI_THOUGHTS/agent-tasks/run-name" }), field("aiTaskFileName", "Output file", { placeholder: "result.md" }), area("aiTaskPrompt", "Prompt", "Break this project into child tasks. Append awtsmoos_agent_tasks JSON for useful delegates.")]), h("div", { className: "button-row" }, [button("spawnAiTaskBtn", "Spawn generic task", "primary"), button("listAiTasksBtn", "List tasks")]), h("div", { className: "form-grid" }, [field("aiTaskId", "Task id", { placeholder: "task id from spawn/list" })]), h("div", { className: "button-row" }, [button("aiTaskStatusBtn", "Check status"), button("aiTaskResultBtn", "Get result")])]);
}

function messagePanel() {
  return h("article", { className: "panel stack awt-ai-message-panel" }, [h("h3", { text: "Direct delegate message" }), h("div", { className: "form-grid" }, [field("aiAgentId", "Agent id", { value: "minimax-deep" }), area("aiAgentSystem", "System override", ""), area("aiAgentMessage", "Message", "Brainstorm three implementation risks and fixes.")]), button("sendAiAgentBtn", "Send message", "primary")]);
}

function providerSelect() { return h("select", { id: "aiProviderId" }, AI_PROVIDER_OPTIONS.map(option => h("option", { value: option.value, text: option.text }))); }
function button(id, text, className = "") { return h("button", { id, className, text }); }

export function mountAiAgents(getTunnelName) {
  if (!$("loadAiAgentsBtn")) return;
  restoreChoice(); hydrateTarget(getTunnelName);
  $("aiTargetVessel").onchange = () => hydrateTarget(getTunnelName, $("aiTargetVessel").value);
  $("aiProviderId").onchange = () => { saveChoice(); renderModels(); };
  $("aiModelSelect").onchange = saveChoice;
  $("loadAiAgentsBtn").onclick = () => refreshCouncil(getTunnelName, "Council refreshed.");
  $("saveAiConfigBtn").onclick = () => run(getTunnelName, { action: "aiAgentConfigSet", maxDepth: $("aiMaxDepth").value, maxChildrenPerTask: $("aiMaxChildren").value, maxTotalTasks: $("aiMaxTotalTasks").value, allowRecursiveSpawn: $("aiAllowRecursive").value });
  $("saveAiProviderKeyBtn").onclick = async () => { await saveProviderKey(getTunnelName); };
  $("removeAiProviderKeyBtn").onclick = async () => { await run(getTunnelName, { action: "aiAgentRemoveProviderKey", provider: $("aiProviderId").value }); await refreshCouncil(getTunnelName, "Provider key removed from the selected vessel. Remove again with Hosted Virtual OS selected if a remote copy exists."); };
  $("sendAiAgentBtn").onclick = () => run(getTunnelName, messagePayload("aiAgentMessage"));
  $("spawnAiTaskBtn").onclick = () => run(getTunnelName, taskPayload());
  $("listAiTasksBtn").onclick = () => run(getTunnelName, { action: "aiAgentTaskList", limit: 25 });
  $("aiTaskStatusBtn").onclick = () => run(getTunnelName, { action: "aiAgentTaskStatus", taskId: $("aiTaskId").value });
  $("aiTaskResultBtn").onclick = () => run(getTunnelName, { action: "aiAgentTaskResult", taskId: $("aiTaskId").value });
  refreshCouncil(getTunnelName, "Council loaded after refresh.").catch(error => show("aiAgentsOut", { ok: false, error: String(error) }));
}

export function resolveAiTarget(getTunnelName) { return currentTargetVesselName($("aiTargetVessel")?.value || getTunnelName?.() || VIRTUAL_OS_TUNNEL); }

function hydrateTarget(getTunnelName, explicit = "") {
  const target = rememberTargetVessel(explicit || currentTargetVesselName(getTunnelName?.() || VIRTUAL_OS_TUNNEL));
  if ($("aiTargetVessel")) {
    const exists = Array.from($("aiTargetVessel").children || []).some(option => option.value === target);
    if (!exists) $("aiTargetVessel").append(h("option", { value: target, text: target }));
    $("aiTargetVessel").value = target;
  }
  if ($("aiTargetVesselDisplay")) $("aiTargetVesselDisplay").value = target;
  return target;
}

async function saveProviderKey(getTunnelName) {
  const saveToAccount = Boolean($("saveProviderKeyToAccount")?.checked);
  const got = await run(getTunnelName, { action: "aiAgentSetProviderKey", provider: $("aiProviderId").value, apiKey: $("aiProviderKey").value, saveProviderKeyToAccount: saveToAccount, saveToAccount });
  $("aiProviderKey").value = ""; $("saveProviderKeyToAccount").checked = false;
  const message = saveToAccount ? "Provider key saved to selected vessel and copied to Awtsmoos account for Virtual OS." : "Provider key saved to selected vessel only; Virtual OS will not receive it.";
  await refreshCouncil(getTunnelName, message);
  return got;
}

async function refreshCouncil(getTunnelName, message) {
  const got = await callFs(resolveAiTarget(getTunnelName), { action: "aiAgentList" });
  council = { agents: got.agents || [], providers: got.providers || [], config: got.config || {} };
  applyConfig(council.config); renderProviderStatus(); renderModels();
  show("aiAgentsOut", { ...got, uiMessage: `${message} Target: ${resolveAiTarget(getTunnelName)}` });
}

function applyConfig(config) { if (!config) return; if ($("aiMaxDepth")) $("aiMaxDepth").value = config.maxDepth ?? $("aiMaxDepth").value; if ($("aiMaxChildren")) $("aiMaxChildren").value = config.maxChildrenPerTask ?? $("aiMaxChildren").value; if ($("aiMaxTotalTasks")) $("aiMaxTotalTasks").value = config.maxTotalTasks ?? $("aiMaxTotalTasks").value; if ($("aiAllowRecursive")) $("aiAllowRecursive").value = String(config.allowRecursiveSpawn !== false); }
function renderProviderStatus() { const box = $("aiProviderStatus"); if (!box) return; box.replaceChildren(...council.providers.map(provider => h("div", { className: "notice awt-provider-chip" }, [h("b", { text: provider.name || provider.id }), " — ", provider.hasKey ? `saved ${provider.keyMask || "masked"}` : "no key", h("br"), h("span", { text: `default ${provider.defaultModel || "unknown"} · ${provider.keySource || "account/session"}` })]))); }
function renderModels() { const select = $("aiModelSelect"); if (!select) return; const provider = $("aiProviderId")?.value || "minimax"; const models = modelOptions(provider); select.replaceChildren(...models.map(model => h("option", { value: model, text: model }))); const saved = readChoice(); const next = models.includes(saved.model) ? saved.model : models[0] || ""; select.value = next; if (!$("aiAgentModel").value) $("aiAgentModel").placeholder = next || "optional exact model id"; chooseAgentForProvider(provider, next); saveChoice(); }
function modelOptions(provider) { const live = council.agents.filter(agent => agent.provider === provider).map(agent => agent.model).filter(Boolean); const defaults = council.providers.filter(p => p.id === provider).map(p => p.defaultModel).filter(Boolean); return [...new Set([...live, ...defaults])]; }
function chooseAgentForProvider(provider, model) { const agent = council.agents.find(item => item.provider === provider && item.model === model) || council.agents.find(item => item.provider === provider); if (agent && $("aiAgentId")) $("aiAgentId").value = agent.id; }
function messagePayload(action) { const model = $("aiAgentModel").value || $("aiModelSelect")?.value || ""; return { action, targetVessel: resolveAiTarget(), agentId: $("aiAgentId").value, provider: $("aiProviderId").value, model, system: $("aiAgentSystem").value, message: $("aiAgentMessage").value, stream: true }; }
function taskPayload() { return { ...messagePayload("aiAgentSpawnTask"), kind: "genericTask", title: $("aiTaskTitle").value, prompt: $("aiTaskPrompt").value, outputDir: $("aiTaskOutputDir").value, fileName: $("aiTaskFileName").value, maxDepth: $("aiMaxDepth").value, maxChildrenPerTask: $("aiMaxChildren").value, maxTotalTasks: $("aiMaxTotalTasks").value, allowRecursiveSpawn: $("aiAllowRecursive").value }; }
async function run(getTunnelName, opts) { $("aiAgentsOut").textContent = "Calling " + opts.action + " on " + resolveAiTarget(getTunnelName) + "..."; const got = await callFs(resolveAiTarget(getTunnelName), { ...opts, targetVessel: resolveAiTarget(getTunnelName) }); show("aiAgentsOut", got); return got; }
function readChoice() { try { return JSON.parse(localStorage.getItem(MODEL_MEMORY) || "{}"); } catch { return {}; } }
function saveChoice() { localStorage.setItem(MODEL_MEMORY, JSON.stringify({ provider: $("aiProviderId")?.value || "minimax", model: $("aiModelSelect")?.value || "" })); }
function restoreChoice() { const saved = readChoice(); if (saved.provider && $("aiProviderId")) $("aiProviderId").value = saved.provider; }
