// B"H
const fsp = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { safePath } = require("./pathGuard.js");

const DIR = ".awtsmoos/actions";
const LOG = `${DIR}/history.jsonl`;
const RES = `${DIR}/results`;
const SKIP = new Set(["actionHistoryList","actionHistoryGet","actionHistorySearch"]);

function id(prefix = "act") {
  return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;
}
async function ensure(config) {
  await fsp.mkdir(safePath(config, DIR), { recursive: true });
  await fsp.mkdir(safePath(config, RES), { recursive: true });
}
async function record(config, input, output, meta = {}) {
  if (SKIP.has(input.action)) return output;
  await ensure(config);
  const actionId = output.actionId || id("act");
  const resultRef = `${RES}/${actionId}.json`;
  const entry = { actionId, inputRef: `cmd_${actionId}`, outputRef: resultRef, parentActionId: input.parentActionId || null, action: input.action, input, ok: output?.ok !== false, createdAt: new Date().toISOString(), ...meta };
  await fsp.writeFile(safePath(config, resultRef), JSON.stringify({ entry, output }, null, 2), "utf8");
  await fsp.appendFile(safePath(config, LOG), JSON.stringify(entry) + "\n", "utf8");
  return { ...output, actionId, inputRef: entry.inputRef, outputRef: resultRef, replayable: true };
}
async function list(config, limit = 50) {
  try { const lines = (await fsp.readFile(safePath(config, LOG), "utf8")).trim().split(/\r?\n/).filter(Boolean); return lines.slice(-limit).map(JSON.parse).reverse(); } catch { return []; }
}
async function get(config, actionId) {
  const found = (await list(config, 5000)).find(x => x.actionId === actionId);
  if (!found) return null;
  try { return JSON.parse(await fsp.readFile(safePath(config, found.outputRef), "utf8")); } catch { return { entry: found, output: null }; }
}
function patch(input, patchObj = {}) { return { ...input, ...patchObj }; }
function replaceAt(input, key, find, replace) {
  const out = JSON.parse(JSON.stringify(input)); let box = out;
  const parts = String(key || "").split(".").filter(Boolean);
  while (parts.length > 1) box = box[parts.shift()] ??= {};
  const last = parts[0]; box[last] = String(box[last] ?? "").split(find).join(replace);
  return out;
}
module.exports = { record, list, get, patch, replaceAt, id };
