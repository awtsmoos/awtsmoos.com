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
  const detail = $("actionDetail");
  detail?.removeAttribute("hidden");
  applyActionFields(item);
  detail?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function setValue(id, value) { const node = $(id); if (node) node.value = value; }
function setText(id, value) { const node = $(id); if (node) node.textContent = value; }

const OPTIONAL_FIELDS = ["actionPath", "maxChars", "writeContent", "bulkPaths", "bulkWriteJson", "missionGoal", "missionId", "missionRounds", "selfEmail", "missionAnswer", "websiteMissionId", "websiteAgentCount", "websiteStartSpacing", "websiteMaxSubagentDepth", "websiteMaxSubagents", "websiteMaxTotalAgents", "websiteSubagentSpacing", "websiteRecursiveSpawn", "websiteMessageTarget", "websiteMissionPrompt", "websiteMissionMessage"];

/**
 * B"H — Run 07: the detail chamber shows ONLY the selected action's real
 * parameters. Dimming (the old is-muted approach) left every field on screen,
 * so a file action appeared to demand website-mission fields and its Run
 * button drowned. Now irrelevant fields leave the layout entirely; the
 * website-mission fields exist only for website-mission actions.
 */
export function visibleFieldsFor(item) {
  const defaults = item?.defaults || {};
  const show = new Set(["actionName"]);
  if ("path" in defaults) { show.add("actionPath"); show.add("maxChars"); }
  if (defaults.needsContent) show.add("writeContent");
  if (defaults.needsBulk) show.add("bulkPaths");
  if (defaults.needsBulkWrite) show.add("bulkWriteJson");
  if (defaults.needsMissionGoal) { show.add("missionGoal"); show.add("selfEmail"); }
  if (defaults.needsMissionId) show.add("missionId");
  if (defaults.needsMissionAutopilot) { show.add("missionRounds"); show.add("missionAnswer"); show.add("selfEmail"); }
  if (defaults.needsMissionNote) show.add("missionAnswer");
  if (defaults.needsMissionMail) { show.add("selfEmail"); show.add("missionAnswer"); }
  if (defaults.needsWebsiteMissionId) show.add("websiteMissionId");
  if (defaults.needsWebsiteMissionPrompt) {
    for (const id of ["websiteMissionPrompt", "websiteAgentCount", "websiteStartSpacing", "websiteMaxSubagentDepth", "websiteMaxSubagents", "websiteMaxTotalAgents", "websiteSubagentSpacing", "websiteRecursiveSpawn"]) show.add(id);
  }
  if (defaults.needsWebsiteMissionMessage) { show.add("websiteMissionMessage"); show.add("websiteMessageTarget"); }
  return show;
}

function applyActionFields(item) {
  const show = visibleFieldsFor(item);
  for (const id of OPTIONAL_FIELDS) {
    const label = $(id)?.closest("label");
    if (!label) continue;
    label.hidden = !show.has(id);
    label.classList.remove("is-muted");
  }
}
