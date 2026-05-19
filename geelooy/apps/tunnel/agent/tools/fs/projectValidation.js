// B"H
const childProcess = require("child_process");
const fs = require("fs/promises");
const path = require("path");
const { safePath } = require("./pathGuard.js");
const { AGENT_VERSION } = require("./actions.js");

function execNode(args, cwd, timeoutMs = 30000) {
  return new Promise(resolve => {
    childProcess.execFile(process.execPath, args, { cwd, timeout: timeoutMs, windowsHide: true, maxBuffer: 240000 }, (err, stdout, stderr) => {
      resolve({ ok: !err, exitCode: err?.code ?? 0, stdout: String(stdout || ""), stderr: String(stderr || ""), error: err ? err.message : null });
    });
  });
}

async function syntaxCheck(config, payload = {}) {
  const p = payload.path || payload.p || ".";
  const full = safePath(config, p);
  const got = await execNode(["--check", full], path.dirname(full), Number(payload.timeoutMs || 30000));
  return { ...got, action: payload.action || "syntaxCheck", path: p, absolutePath: full };
}

async function yamlValidate(config, payload = {}) {
  const p = payload.path || payload.p || ".";
  const full = safePath(config, p);
  const text = await fs.readFile(full, "utf8");
  try {
    const yaml = require("yaml");
    const value = yaml.parse(text);
    return { ok: true, action: "yamlValidate", path: p, valid: true, type: Array.isArray(value) ? "array" : typeof value };
  } catch (e) {
    return { ok: false, action: "yamlValidate", path: p, valid: false, error: e.message };
  }
}

async function openApiValidate(config, payload = {}) {
  const base = await yamlValidate(config, payload);
  if (!base.ok) return { ...base, action: "openApiValidate" };
  const full = safePath(config, payload.path || payload.p || ".");
  const yaml = require("yaml");
  const doc = yaml.parse(await fs.readFile(full, "utf8"));
  const errors = [];
  if (!doc.openapi) errors.push("missing openapi");
  if (!doc.info?.title) errors.push("missing info.title");
  if (!doc.paths || typeof doc.paths !== "object") errors.push("missing paths");
  return { ok: errors.length === 0, action: "openApiValidate", path: payload.path || payload.p || ".", valid: errors.length === 0, errors, pathCount: Object.keys(doc.paths || {}).length };
}

async function bulkDebugPayload(config, payload = {}) {
  return { ok: true, action: "bulkDebugPayload", keys: Object.keys(payload).sort(), path: payload.path, paths: payload.paths, files: payload.files, maxFiles: payload.maxFiles };
}

async function liveAgentVersionCompare(config) {
  return { ok: true, action: "liveAgentVersionCompare", runningVersion: AGENT_VERSION, root: config.root };
}

module.exports = { syntaxCheck, yamlValidate, openApiValidate, bulkDebugPayload, liveAgentVersionCompare };
