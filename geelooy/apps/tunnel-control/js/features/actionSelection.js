// B"H

import { $ } from "../lib/dom.js";
import { ACTION_CATALOG } from "./actionCatalogData.js";

/** B"H — Chapter 805: The selected action received one clear chamber. */
export function bindCatalogCards() {
  for (const card of document.querySelectorAll("[data-action]")) {
    card.addEventListener("click", () => selectCatalogAction(card.dataset.action));
  }
}

export function selectCatalogAction(name) {
  const item = ACTION_CATALOG.find(entry => entry.name === name);
  if (!item) return;
  for (const card of document.querySelectorAll("[data-action]")) card.classList.toggle("active", card.dataset.action === name);
  setValue("actionName", item.name);
  setValue("actionPath", item.defaults?.path || ".");
  setValue("maxChars", "12000");
  setText("actionDetailTitle", item.title);
  setText("actionDetailDesc", item.desc);
  setText("actionDetailBadge", `${item.group} · ${(item.badges || []).join(" · ")}`);
  $("actionDetail")?.removeAttribute("hidden");
  toggleAdvancedFields(item.defaults || {});
}

function setValue(id, value) { const node = $(id); if (node) node.value = value; }
function setText(id, value) { const node = $(id); if (node) node.textContent = value; }
function mute(id, muted = true) { $(id)?.closest("label")?.classList.toggle("is-muted", muted); }
function toggleAdvancedFields(defaults) {
  for (const id of ["writeContent", "bulkPaths", "bulkWriteJson", "missionGoal", "missionId", "missionRounds", "selfEmail", "missionAnswer", "websiteMissionId", "websiteAgentCount", "websiteStartSpacing", "websiteMessageTarget", "websiteMissionPrompt", "websiteMissionMessage"]) mute(id, true);
  if (defaults.needsContent) mute("writeContent", false);
  if (defaults.needsBulk) mute("bulkPaths", false);
  if (defaults.needsBulkWrite) mute("bulkWriteJson", false);
  if (defaults.needsMissionGoal) mute("missionGoal", false);
  if (defaults.needsMissionId) mute("missionId", false);
  if (defaults.needsMissionAutopilot) { mute("missionRounds", false); mute("missionAnswer", false); }
  if (defaults.needsMissionMail || defaults.needsMissionAutopilot || defaults.needsMissionGoal) mute("selfEmail", false);
  if (defaults.needsWebsiteMissionId) mute("websiteMissionId", false);
  if (defaults.needsWebsiteMissionPrompt) {
    mute("websiteMissionPrompt", false);
    mute("websiteAgentCount", false);
    mute("websiteStartSpacing", false);
  }
  if (defaults.needsWebsiteMissionMessage) {
    mute("websiteMissionMessage", false);
    mute("websiteMessageTarget", false);
  }
}
