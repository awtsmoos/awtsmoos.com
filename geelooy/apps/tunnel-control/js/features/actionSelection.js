// B"H

import { ACTION_CATALOG } from "./actionCatalogData.js";

/** B"H — Chapter 805: The selected action received one clear chamber. */
export function bindCatalogCards() {
  for (const card of document.querySelectorAll("[data-action]")) {
    card.addEventListener("click", () => selectCatalogAction(card.dataset.action, card));
  }
}

export function selectCatalogAction(name, card) {
  const item = ACTION_CATALOG.find(entry => entry.name === name);
  if (!item) return;
  // B"H — Run 08: websiteMissionId/Prompt/Message exist in TWO panes (this
  // codex and AI agents). Global getElementById returns whichever copy DOM
  // adoption placed first, so field show/hide landed on the other pane and
  // the codex kept another action's fields. Every lookup is scoped to the
  // pane that owns the clicked card.
  const root = card?.closest("[data-pane]") || document;
  const inPane = id => root.querySelector(`#${id}`);
  for (const c of document.querySelectorAll("[data-action]")) c.classList.toggle("active", c.dataset.action === name);
  setValue(inPane, "actionName", item.name);
  setValue(inPane, "actionPath", item.defaults?.path || ".");
  setValue(inPane, "maxChars", "12000");
  setText(inPane, "actionDetailTitle", item.title);
  setText(inPane, "actionDetailDesc", item.desc);
  setText(inPane, "actionDetailBadge", `${item.group} · ${(item.badges || []).join(" · ")}`);
  const detail = inPane("actionDetail");
  detail?.removeAttribute("hidden");
  applyActionFields(item, inPane);
  detail?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function setValue(inPane, id, value) { const node = inPane(id); if (node) node.value = value; }
function setText(inPane, id, value) { const node = inPane(id); if (node) node.textContent = value; }

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

function applyActionFields(item, inPane) {
  const show = visibleFieldsFor(item);
  for (const id of OPTIONAL_FIELDS) {
    const label = inPane(id)?.closest("label");
    if (!label) continue;
    label.hidden = !show.has(id);
    label.classList.remove("is-muted");
  }
}
