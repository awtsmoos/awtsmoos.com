// B"H
import { h, field, area, out, $ } from "../ui/dom.js";
import { callFs } from "../api/tunnel.js";
import { show } from "../ui/api.js";

/**
 * B"H
 * Chapter 354: Tunnel Control Received The Spawn Dials.
 *
 * The pane is no longer a demo. It stores provider keys, sets recursive task
 * limits, launches generic big tasks, and checks task status/results. The UI is
 * a control room where infinity is invited through measured vessels.
 */
export function aiAgents() {
  return h("section", { className: "pane awt-ai-console", data: { pane: "aiAgents" } }, [
    h("div", { className: "page-head" }, [h("p", { className: "eyebrow", text: "AI Agents" }), h("h2", { text: "Delegation council" })]),
    providerPanel(), configPanel(), taskPanel(), messagePanel(), out("aiAgentsOut", "AI-agent council not loaded yet.")
  ]);
}

function providerPanel() {
  return h("article", { className: "panel stack awt-ai-provider-panel" }, [
    h("h3", { text: "Provider keys" }),
    h("p", { text: "Save OpenRouter, MiniMax, or Groq API keys for spawned agents." }),
    h("div", { className: "form-grid" }, [h("label", {}, ["Provider", providerSelect()]), field("aiProviderKey", "API key", { type: "password", placeholder: "Paste provider API key" })]),
    h("div", { className: "button-row" }, [button("saveAiProviderKeyBtn", "Save provider key", "primary"), button("removeAiProviderKeyBtn", "Remove key"), button("loadAiAgentsBtn", "Refresh council")])
  ]);
}

function configPanel() {
  return h("article", { className: "panel stack awt-ai-config-panel" }, [
    h("h3", { text: "Recursive spawn limits" }),
    h("p", { text: "Raise these when you want more agents. Defaults are guarded so one prompt cannot explode forever." }),
    h("div", { className: "form-grid" }, [
      field("aiMaxDepth", "Max recursive depth", { type: "number", value: "3", min: "0" }),
      field("aiMaxChildren", "Max children per task", { type: "number", value: "8", min: "0" }),
      field("aiMaxTotalTasks", "Max total task records", { type: "number", value: "80", min: "1" }),
      h("label", {}, ["Allow recursive spawn", h("select", { id: "aiAllowRecursive" }, [h("option", { value: "true", text: "Yes" }), h("option", { value: "false", text: "No" })])])
    ]),
    button("saveAiConfigBtn", "Save spawn limits", "primary")
  ]);
}

function taskPanel() {
  return h("article", { className: "panel stack awt-ai-task-panel" }, [
    h("h3", { text: "Generic big task" }),
    h("div", { className: "form-grid" }, [
      field("aiTaskTitle", "Task title", { value: "Research and build plan" }),
      field("aiTaskOutputDir", "Output directory", { placeholder: "AI_THOUGHTS/agent-tasks/run-name" }),
      field("aiTaskFileName", "Output file", { placeholder: "result.md" }),
      area("aiTaskPrompt", "Prompt", "Break this project into child tasks. Append awtsmoos_agent_tasks JSON for useful delegates.")
    ]),
    h("div", { className: "button-row" }, [button("spawnAiTaskBtn", "Spawn generic task", "primary"), button("listAiTasksBtn", "List tasks")]),
    h("div", { className: "form-grid" }, [field("aiTaskId", "Task id", { placeholder: "task id from spawn/list" })]),
    h("div", { className: "button-row" }, [button("aiTaskStatusBtn", "Check status"), button("aiTaskResultBtn", "Get result")])
  ]);
}

function messagePanel() {
  return h("article", { className: "panel stack awt-ai-message-panel" }, [
    h("h3", { text: "Direct delegate message" }),
    h("div", { className: "form-grid" }, [field("aiAgentId", "Agent id", { value: "minimax-deep" }), field("aiAgentModel", "Model override", { placeholder: "optional" }), area("aiAgentSystem", "System override", ""), area("aiAgentMessage", "Message", "Brainstorm three implementation risks and fixes.")]),
    button("sendAiAgentBtn", "Send message", "primary")
  ]);
}

function providerSelect() {
  return h("select", { id: "aiProviderId" }, [h("option", { value: "openrouter", text: "OpenRouter" }), h("option", { value: "minimax", text: "MiniMax" }), h("option", { value: "groq", text: "Groq" })]);
}
function button(id, text, className = "") { return h("button", { id, className, text }); }

export function mountAiAgents(getTunnelName) {
  if (!$("loadAiAgentsBtn")) return;
  $("loadAiAgentsBtn").onclick = () => run(getTunnelName, { action: "aiAgentList" });
  $("saveAiConfigBtn").onclick = () => run(getTunnelName, { action: "aiAgentConfigSet", maxDepth: $("aiMaxDepth").value, maxChildrenPerTask: $("aiMaxChildren").value, maxTotalTasks: $("aiMaxTotalTasks").value, allowRecursiveSpawn: $("aiAllowRecursive").value });
  $("saveAiProviderKeyBtn").onclick = () => run(getTunnelName, { action: "aiAgentSetProviderKey", provider: $("aiProviderId").value, apiKey: $("aiProviderKey").value });
  $("removeAiProviderKeyBtn").onclick = () => run(getTunnelName, { action: "aiAgentRemoveProviderKey", provider: $("aiProviderId").value });
  $("sendAiAgentBtn").onclick = () => run(getTunnelName, messagePayload("aiAgentMessage"));
  $("spawnAiTaskBtn").onclick = () => run(getTunnelName, taskPayload());
  $("listAiTasksBtn").onclick = () => run(getTunnelName, { action: "aiAgentTaskList", limit: 25 });
  $("aiTaskStatusBtn").onclick = () => run(getTunnelName, { action: "aiAgentTaskStatus", taskId: $("aiTaskId").value });
  $("aiTaskResultBtn").onclick = () => run(getTunnelName, { action: "aiAgentTaskResult", taskId: $("aiTaskId").value });
}

function messagePayload(action) {
  return { action, agentId: $("aiAgentId").value, provider: $("aiProviderId").value, model: $("aiAgentModel").value, system: $("aiAgentSystem").value, message: $("aiAgentMessage").value, stream: true };
}
function taskPayload() {
  return { ...messagePayload("aiAgentSpawnTask"), kind: "genericTask", title: $("aiTaskTitle").value, prompt: $("aiTaskPrompt").value, outputDir: $("aiTaskOutputDir").value, fileName: $("aiTaskFileName").value, maxDepth: $("aiMaxDepth").value, maxChildrenPerTask: $("aiMaxChildren").value, maxTotalTasks: $("aiMaxTotalTasks").value, allowRecursiveSpawn: $("aiAllowRecursive").value };
}
async function run(getTunnelName, opts) { $("aiAgentsOut").textContent = "Calling " + opts.action + "..."; show("aiAgentsOut", await callFs(getTunnelName(), opts)); }
