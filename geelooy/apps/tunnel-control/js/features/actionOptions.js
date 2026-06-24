// B"H

import { $ } from "../lib/dom.js";
import { ACTION_CATALOG } from "./actionCatalogData.js";

/** B"H — Chapter 804: Action options became a small clean vessel. */
export function buildOptions() {
  const action = $("actionName").value;
  const item = ACTION_CATALOG.find(entry => entry.name === action);
  const opts = { action, path: $("actionPath").value, maxChars: $("maxChars").value };
  copyIf(opts, "conversationId");
  copyIf(opts, "conversationName");
  if (item?.defaults?.needsMissionGoal) Object.assign(opts, missionStartOptions());
  if (item?.defaults?.needsMissionId) opts.missionId = $("missionId")?.value || opts.missionId;
  if (item?.defaults?.needsMissionAutopilot) Object.assign(opts, missionAutopilotOptions(action));
  if (item?.defaults?.needsMissionMail) Object.assign(opts, missionMailOptions());
  if (action === "tree") Object.assign(opts, { depth: $("treeDepth")?.value || 2, limit: $("treeLimit")?.value || 120 });
  if (action === "write") opts.content = $("writeContent").value;
  if (action === "bulk") opts.paths = splitLines($("bulkPaths").value);
  if (action === "bulkWrite") opts.files = parseBulkWrite();
  return opts;
}

function copyIf(opts, id) {
  if ($(id)?.value) opts[id] = $(id).value;
}
function missionStartOptions() {
  const rounds = $("missionRounds")?.value || 8;
  return { goal: $("missionGoal")?.value || "Autonomous tunnel mission", auto: true, selfMail: Boolean(($("selfEmail")?.value || "").trim()), maxAutopilotRounds: rounds, maxSelfBrainstormCycles: rounds, definitionOfDone: ["implementation exists", "verification passed", "stress coverage"] };
}
function missionAutopilotOptions(action) {
  const answer = $("missionAnswer")?.value || "";
  const opts = { rounds: $("missionRounds")?.value || 8, selfEmail: $("selfEmail")?.value || "", mail: Boolean(($("selfEmail")?.value || "").trim()) };
  if (action === "missionBrainstorm" && answer) opts.answers = [answer];
  return opts;
}
function missionMailOptions() {
  const note = $("missionAnswer")?.value || "";
  return { to: $("selfEmail")?.value || "", selfEmail: $("selfEmail")?.value || "", summary: note, body: note, includeLatest: true };
}
function parseBulkWrite() {
  try { return JSON.parse($("bulkWriteJson").value); }
  catch (error) { throw new Error(`Invalid bulk write JSON: ${error.message}`); }
}
function splitLines(value) {
  return String(value || "").split(/\r?\n/g).map(x => x.trim()).filter(Boolean);
}
