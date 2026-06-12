// B"H
const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");
const { safePath } = require("../pathGuard.js");

/**
 * B"H
 * Chapter 427: Process Tools Learned JSON Args Without Losing The Guard.
 *
 * Args and pids may arrive as native arrays, JSON strings, base64 JSON, comma
 * lists, or inside params/content. Killing remains dry-run and confirm-gated.
 */
function runExe(file, args = [], timeoutMs = 5000) {
  return new Promise(resolve => {
    const startedAt = Date.now();
    const cwd = path.dirname(file);
    const child = execFile(file, args, { cwd, timeout: timeoutMs, windowsHide: true, maxBuffer: 1024 * 1024 * 2 }, (error, stdout, stderr) => {
      const timedOut = error && (error.killed || error.signal === "SIGTERM") && Date.now() - startedAt >= timeoutMs - 50;
      resolve({ ok: !error, exitCode: error && Number.isFinite(error.code) ? error.code : 0, signal: error && error.signal ? error.signal : null, timedOut: !!timedOut, durationMs: Date.now() - startedAt, stdout: String(stdout || ""), stderr: String(stderr || ""), error: error ? error.message : null });
    });
    child.on("error", error => resolve({ ok: false, exitCode: null, signal: null, timedOut: false, durationMs: Date.now() - startedAt, stdout: "", stderr: "", error: error.message }));
  });
}

function psJson(script, timeoutMs = 15000) {
  return new Promise(resolve => {
    execFile("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script], { timeout: timeoutMs, windowsHide: true, maxBuffer: 1024 * 1024 * 5 }, (error, stdout, stderr) => {
      if (error) return resolve({ ok: false, error: error.message, stderr: String(stderr || ""), stdout: String(stdout || "") });
      const text = String(stdout || "").trim();
      if (!text) return resolve({ ok: true, value: [] });
      try { resolve({ ok: true, value: JSON.parse(text) }); }
      catch (parseError) { resolve({ ok: false, error: parseError.message, stdout: text, stderr: String(stderr || "") }); }
    });
  });
}

function queryOf(payload = {}) { return String(payload.query || payload.find || payload.name || payload.target || "").trim(); }
function processWhere(query) { const escaped = query.replace(/'/g, "''"); return escaped ? `($_.ProcessName -like '*${escaped}*' -or $_.Path -like '*${escaped}*' -or [string]$_.Id -eq '${escaped}')` : "$_"; }
function normalizeList(value) { return Array.isArray(value) ? value : value ? [value] : []; }
function safeNumber(value, fallback) { const n = Number(value); return Number.isFinite(n) ? n : fallback; }

function buildProcessActions(ctx) {
  const payload = fusePayload(ctx.payload || {});
  return {
    async processList() {
      const limit = Math.max(1, Math.min(safeNumber(payload.limit || payload.maxResults, 100), 1000));
      const script = `Get-Process | Select-Object -First ${limit} Id,ProcessName,Path,StartTime,CPU,WorkingSet64 | ConvertTo-Json -Depth 4`;
      const out = await psJson(script, safeNumber(payload.timeoutMs, 15000));
      if (!out.ok) return { ok: false, action: "processList", ...out };
      const processes = normalizeList(out.value);
      return { ok: true, action: "processList", count: processes.length, processes };
    },
    async processFind() {
      const query = queryOf(payload);
      const limit = Math.max(1, Math.min(safeNumber(payload.limit || payload.maxResults, 50), 500));
      const where = processWhere(query);
      const script = `Get-Process | Where-Object { ${where} } | Select-Object -First ${limit} Id,ProcessName,Path,StartTime,CPU,WorkingSet64 | ConvertTo-Json -Depth 4`;
      const out = await psJson(script, safeNumber(payload.timeoutMs, 15000));
      if (!out.ok) return { ok: false, action: "processFind", query, ...out };
      const processes = normalizeList(out.value);
      return { ok: true, action: "processFind", query, count: processes.length, processes };
    },
    async windowsExeSmokeTest() {
      const rel = payload.path || payload.p || payload.file || payload.target;
      if (!rel) return { ok: false, action: "windowsExeSmokeTest", error: "path_required" };
      const exe = safePath(ctx.config, rel);
      if (!exe.toLowerCase().endsWith(".exe")) return { ok: false, action: "windowsExeSmokeTest", error: "not_an_exe", path: rel };
      if (!fs.existsSync(exe)) return { ok: false, action: "windowsExeSmokeTest", error: "not_found", path: rel };
      const stat = fs.statSync(exe);
      const head = fs.readFileSync(exe).slice(0, 2).toString("ascii");
      const args = normalizeArgs(payload.args);
      const timeoutMs = Math.max(250, Math.min(safeNumber(payload.timeoutMs, 5000), 30000));
      const result = await runExe(exe, args, timeoutMs);
      return { ok: result.ok, action: "windowsExeSmokeTest", path: rel, bytes: stat.size, mz: head === "MZ", timeoutMs, argsCount: args.length, ...result };
    },
    async processKillSafe() {
      const ids = normalizePids(payload);
      const query = queryOf(payload);
      const dryRun = payload.dryRun !== false;
      const confirm = payload.confirm === true || String(payload.confirm).toLowerCase() === "true";
      let processes = [];
      if (ids.length) {
        const idList = ids.filter(Number.isFinite).join(",");
        if (idList) {
          const out = await psJson(`Get-Process -Id ${idList} -ErrorAction SilentlyContinue | Select-Object Id,ProcessName,Path,StartTime,CPU,WorkingSet64 | ConvertTo-Json -Depth 4`, safeNumber(payload.timeoutMs, 15000));
          if (!out.ok) return { ok: false, action: "processKillSafe", ...out };
          processes = normalizeList(out.value);
        }
      } else if (query) {
        const out = await psJson(`Get-Process | Where-Object { ${processWhere(query)} } | Select-Object Id,ProcessName,Path,StartTime,CPU,WorkingSet64 | ConvertTo-Json -Depth 4`, safeNumber(payload.timeoutMs, 15000));
        if (!out.ok) return { ok: false, action: "processKillSafe", query, ...out };
        processes = normalizeList(out.value);
      }
      const safe = processes.filter(proc => {
        const p = String(proc.Path || "");
        const n = String(proc.ProcessName || "").toLowerCase();
        if (!p && !query) return false;
        return !["system", "idle", "wininit", "csrss", "lsass", "services", "svchost"].includes(n);
      });
      if (dryRun || !confirm) return { ok: true, action: "processKillSafe", dryRun: true, confirmRequired: true, matched: processes.length, killable: safe, ids };
      const killed = [];
      for (const proc of safe) {
        const id = Number(proc.Id);
        if (!Number.isFinite(id)) continue;
        const out = await psJson(`Stop-Process -Id ${id} -Force -ErrorAction Stop; [pscustomobject]@{Id=${id};Killed=$true} | ConvertTo-Json`, safeNumber(payload.timeoutMs, 15000));
        killed.push({ id, ok: !!out.ok, error: out.error || null });
      }
      return { ok: killed.every(x => x.ok), action: "processKillSafe", dryRun: false, matched: processes.length, killed };
    }
  };
}

function fusePayload(payload = {}) {
  const out = { ...payload, ...objectish(parse64(payload.params64, {})) };
  for (const key of ["params", "content", "body", "query", "goal"]) {
    const parsed = parseJson(out[key], null);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) Object.assign(out, parsed);
  }
  return out;
}
function normalizeArgs(value) { const parsed = parseJson(value, value); if (Array.isArray(parsed)) return parsed.map(String); return splitList(parsed).map(String); }
function normalizePids(payload) { const all = []; if (payload.pid || payload.id) all.push(payload.pid || payload.id); const parsed = parseJson(payload.pids, payload.pids); if (Array.isArray(parsed)) all.push(...parsed); else all.push(...splitList(parsed)); return all.map(Number).filter(Number.isFinite); }
function parseJson(value, fallback) { if (value && typeof value === "object") return value; if (typeof value !== "string") return fallback; const text = value.trim(); if (!text || !/^[\[{]/.test(text)) return fallback; try { return JSON.parse(text); } catch { return fallback; } }
function parse64(value, fallback) { if (!value) return fallback; try { return parseJson(Buffer.from(String(value), "base64").toString("utf8"), fallback); } catch { return fallback; } }
function objectish(value) { return value && typeof value === "object" && !Array.isArray(value) ? value : {}; }
function splitList(value) { return String(value || "").split(/[\r\n,]+/).map(x => x.trim()).filter(Boolean); }

module.exports = { buildProcessActions, fusePayload, normalizeArgs, normalizePids };
