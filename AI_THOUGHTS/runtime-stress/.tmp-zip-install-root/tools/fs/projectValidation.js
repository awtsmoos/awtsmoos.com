// B"H
const childProcess = require("child_process");
const fs = require("fs/promises");
const path = require("path");
const { safePath } = require("./pathGuard.js");

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
    return { ok: true, action: "yamlValidate", path: p, valid: true, parser: "yaml", type: Array.isArray(value) ? "array" : typeof value };
  } catch (e) {
    const fallback = basicYamlSmoke(text);
    return { ok: fallback.valid, action: "yamlValidate", path: p, valid: fallback.valid, parser: "fallback", warnings: [e.message], ...fallback };
  }
}

function basicYamlSmoke(text) {
  const errors = [];
  const lines = String(text || "").split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\t+/.test(line)) errors.push(`line ${i + 1}: tabs used for indentation`);
    if (/^\s*:\s*/.test(line)) errors.push(`line ${i + 1}: missing key before colon`);
  }
  const hasMapping = lines.some(line => /^\s*[A-Za-z0-9_\/-]+:\s*/.test(line));
  if (!hasMapping) errors.push("no mapping-like YAML keys found");
  return { valid: errors.length === 0, errors, type: "object" };
}

async function openApiValidate(config, payload = {}) {
  const base = await yamlValidate(config, payload);
  if (!base.ok) return { ...base, action: "openApiValidate" };
  const p = payload.path || payload.p || ".";
  const full = safePath(config, p);
  const text = await fs.readFile(full, "utf8");
  try {
    const yaml = require("yaml");
    const doc = yaml.parse(text);
    const errors = [];
    if (!doc.openapi) errors.push("missing openapi");
    if (!doc.info?.title) errors.push("missing info.title");
    if (!doc.paths || typeof doc.paths !== "object") errors.push("missing paths");
    return { ok: errors.length === 0, action: "openApiValidate", path: p, valid: errors.length === 0, parser: "yaml", errors, pathCount: Object.keys(doc.paths || {}).length };
  } catch (e) {
    const errors = [];
    if (!/^openapi:\s*3\./m.test(text)) errors.push("missing openapi 3.x");
    if (!/^\s*title:\s*.+/m.test(text)) errors.push("missing info.title");
    if (!/^paths:\s*$/m.test(text)) errors.push("missing paths");
    const pathCount = (text.match(/^\s{2}\/[A-Za-z0-9_/{}/.-]+:\s*$/gm) || []).length;
    return { ok: errors.length === 0, action: "openApiValidate", path: p, valid: errors.length === 0, parser: "fallback", warnings: [e.message], errors, pathCount };
  }
}

async function bulkDebugPayload(config, payload = {}) {
  return { ok: true, action: "bulkDebugPayload", keys: Object.keys(payload).sort(), path: payload.path, paths: payload.paths, files: payload.files, maxFiles: payload.maxFiles };
}

async function liveAgentVersionCompare(config) {
  const { AGENT_VERSION } = require("./actions.js");
  return { ok: true, action: "liveAgentVersionCompare", runningVersion: AGENT_VERSION, root: config.root };
}

module.exports = { syntaxCheck, yamlValidate, openApiValidate, bulkDebugPayload, liveAgentVersionCompare };
