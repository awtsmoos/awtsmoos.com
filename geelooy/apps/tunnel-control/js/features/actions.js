// B"H

import { $, jsonText, text } from "../lib/dom.js";
import { callFs, buildFsUrl } from "../api/tunnel.js";
import { ACTION_CATALOG } from "./actionCatalogData.js";

/**
 * B"H
 * Chapter 20: The chosen action opened its own chamber.
 *
 * The Awtsmoos lets the catalog remain the first surface. This mount binds each
 * action card to the detail form, then opens URL/result scrolls only after the
 * user runs the action.
 *
 * @param {() => string} getTunnelName Tunnel getter.
 * @returns {void}
 */
export function mountActions(getTunnelName) {
  bindCatalogCards();
  const run = $("runActionBtn");
  if (run) run.onclick = async () => runSelectedAction(getTunnelName);
  const copy = $("copyActionUrlBtn");
  if (copy) copy.onclick = async () => navigator.clipboard.writeText($("actionUrlOut").textContent);
}

/**
 * B"H
 * Binds action cards.
 *
 * @returns {void}
 */
function bindCatalogCards() {
  for (const card of document.querySelectorAll("[data-action]")) {
    card.addEventListener("click", () => selectCatalogAction(card.dataset.action));
  }
}

/**
 * B"H
 * Selects a catalog action.
 *
 * @param {string} name Action name.
 * @returns {void}
 */
function selectCatalogAction(name) {
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

/**
 * B"H
 * Runs the selected action.
 *
 * @param {() => string} getTunnelName Tunnel getter.
 * @returns {Promise<void>} Completion.
 */
async function runSelectedAction(getTunnelName) {
  const opts = buildOptions();
  openDetails("actionUrlOut");
  openDetails("actionOut");
  text("actionUrlOut", buildFsUrl(getTunnelName(), opts));
  text("actionOut", "Running...");
  jsonText("actionOut", await callFs(getTunnelName(), opts));
}

/**
 * B"H
 * Builds request options from the detail form.
 *
 * @returns {object} Request options.
 */
function buildOptions() {
  const action = $("actionName").value;
  const opts = { action, path: $("actionPath").value, maxChars: $("maxChars").value };
  const item = ACTION_CATALOG.find(entry => entry.name === action);
  if ($("conversationId")?.value) opts.conversationId = $("conversationId").value;
  if ($("conversationName")?.value) opts.conversationName = $("conversationName").value;
  if (item?.defaults?.needsMissionGoal) Object.assign(opts, missionStartOptions());
  if (item?.defaults?.needsMissionId) opts.missionId = $("missionId")?.value || opts.missionId;
  if (item?.defaults?.needsMissionAutopilot) Object.assign(opts, missionAutopilotOptions(action));
  if (item?.defaults?.needsMissionMail) Object.assign(opts, missionMailOptions(action));
  if (action === "tree") Object.assign(opts, { depth: $("treeDepth")?.value || 2, limit: $("treeLimit")?.value || 120 });
  if (action === "write") opts.content = $("writeContent").value;
  if (action === "bulk") opts.paths = splitLines($("bulkPaths").value);
  if (action === "bulkWrite") opts.files = parseBulkWrite();
  return opts;
}

function missionStartOptions() {
  return {
    goal: $("missionGoal")?.value || "Autonomous tunnel mission",
    auto: true,
    selfMail: Boolean(($("selfEmail")?.value || "").trim()),
    maxAutopilotRounds: $("missionRounds")?.value || 8,
    maxSelfBrainstormCycles: $("missionRounds")?.value || 8,
    definitionOfDone: ["implementation exists", "verification passed", "stress coverage"]
  };
}

function missionAutopilotOptions(action) {
  const answer = $("missionAnswer")?.value || "";
  const opts = { rounds: $("missionRounds")?.value || 8, selfEmail: $("selfEmail")?.value || "", mail: Boolean(($("selfEmail")?.value || "").trim()) };
  if (action === "missionBrainstorm" && answer) opts.answers = [answer];
  return opts;
}

function missionMailOptions(action) {
  const note = $("missionAnswer")?.value || "";
  return {
    to: $("selfEmail")?.value || "",
    selfEmail: $("selfEmail")?.value || "",
    summary: note,
    body: action === "missionSelfMailDraft" ? note : undefined
  };
}

/**
 * B"H
 * Parses bulk-write JSON safely.
 *
 * @returns {object[]} Parsed files.
 */
function parseBulkWrite() {
  try { return JSON.parse($("bulkWriteJson").value); }
  catch (error) { text("actionOut", `Invalid bulk write JSON: ${error.message}`); openDetails("actionOut"); throw error; }
}

function splitLines(value) { return String(value || "").split(/\r?\n/g).map(x => x.trim()).filter(Boolean); }
function setValue(id, value) { const node = $(id); if (node) node.value = value; }
function setText(id, value) { const node = $(id); if (node) node.textContent = value; }
function openDetails(id) { $(id)?.closest("details")?.setAttribute("open", "open"); }
function toggleAdvancedFields(defaults) {
  for (const id of ["writeContent", "bulkPaths", "bulkWriteJson", "missionGoal", "missionId", "missionRounds", "selfEmail", "missionAnswer"]) $(id)?.closest("label")?.classList.add("is-muted");
  if (defaults.needsContent) $("writeContent")?.closest("label")?.classList.remove("is-muted");
  if (defaults.needsBulk) $("bulkPaths")?.closest("label")?.classList.remove("is-muted");
  if (defaults.needsBulkWrite) $("bulkWriteJson")?.closest("label")?.classList.remove("is-muted");
  if (defaults.needsMissionGoal) $("missionGoal")?.closest("label")?.classList.remove("is-muted");
  if (defaults.needsMissionId) $("missionId")?.closest("label")?.classList.remove("is-muted");
  if (defaults.needsMissionAutopilot) { $("missionRounds")?.closest("label")?.classList.remove("is-muted"); $("missionAnswer")?.closest("label")?.classList.remove("is-muted"); }
  if (defaults.needsMissionMail || defaults.needsMissionAutopilot || defaults.needsMissionGoal) $("selfEmail")?.closest("label")?.classList.remove("is-muted");
}
