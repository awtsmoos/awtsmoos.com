// B"H
import { h, field, area, out, $ } from "../ui/dom.js";
import { callFs } from "../api/tunnel.js";
import { show } from "../ui/api.js";

/**
 * B"H
 * Chapter 336: The Dashboard Heard The Council Behind The Glass.
 *
 * This pane lets a human place MiniMax or OpenRouter keys, list the delegate
 * agents, and send a test message. One agent may now awaken fifty delegates,
 * yet the UI begins with two clean vessels and one honest output flame.
 *
 * @returns {HTMLElement} AI-agent feature pane.
 */
export function aiAgents() {
  return h("section", { className: "pane", data: { pane: "aiAgents" } }, [
    h("div", { className: "page-head" }, [
      h("p", { className: "eyebrow", text: "AI Agents" }),
      h("h2", { text: "Delegation council" })
    ]),
    h("article", { className: "panel stack" }, [
      h("h3", { text: "Provider keys" }),
      h("div", { className: "form-grid" }, [
        h("label", {}, ["Provider", providerSelect()]),
        field("aiProviderKey", "API key", { type: "password", placeholder: "MiniMax or OpenRouter key" })
      ]),
      h("div", { className: "button-row" }, [
        h("button", { id: "saveAiProviderKeyBtn", className: "primary", text: "Save provider key" }),
        h("button", { id: "removeAiProviderKeyBtn", text: "Remove key" }),
        h("button", { id: "loadAiAgentsBtn", text: "List agents" })
      ])
    ]),
    h("article", { className: "panel stack" }, [
      h("h3", { text: "Send a delegate message" }),
      h("div", { className: "form-grid" }, [
        field("aiAgentId", "Agent id", { value: "openrouter-general" }),
        field("aiAgentModel", "Model override", { placeholder: "optional" }),
        area("aiAgentSystem", "System override", ""),
        area("aiAgentMessage", "Message", "Brainstorm three implementation risks and fixes.")
      ]),
      h("button", { id: "sendAiAgentBtn", className: "primary", text: "Send message" })
    ]),
    out("aiAgentsOut", "AI-agent council not loaded yet.")
  ]);
}

function providerSelect() {
  return h("select", { id: "aiProviderId" }, [
    h("option", { value: "openrouter", text: "OpenRouter" }),
    h("option", { value: "minimax", text: "MiniMax" })
  ]);
}

/**
 * B"H
 * Mounts AI-agent controls to tunnel actions.
 *
 * @param {Function} getTunnelName Active tunnel reader.
 * @returns {void}
 */
export function mountAiAgents(getTunnelName) {
  if (!$("loadAiAgentsBtn")) return;
  $("loadAiAgentsBtn").onclick = () => run(getTunnelName, { action: "aiAgentList" });
  $("saveAiProviderKeyBtn").onclick = () => run(getTunnelName, {
    action: "aiAgentSetProviderKey",
    provider: $("aiProviderId").value,
    apiKey: $("aiProviderKey").value
  });
  $("removeAiProviderKeyBtn").onclick = () => run(getTunnelName, {
    action: "aiAgentRemoveProviderKey",
    provider: $("aiProviderId").value
  });
  $("sendAiAgentBtn").onclick = () => run(getTunnelName, {
    action: "aiAgentMessage",
    agentId: $("aiAgentId").value,
    model: $("aiAgentModel").value,
    system: $("aiAgentSystem").value,
    message: $("aiAgentMessage").value,
    stream: true
  });
}

async function run(getTunnelName, opts) {
  $("aiAgentsOut").textContent = "Calling " + opts.action + "...";
  show("aiAgentsOut", await callFs(getTunnelName(), opts));
}
