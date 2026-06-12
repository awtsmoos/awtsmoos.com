// B"H
const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");
const { safePath } = require("../pathGuard.js");

function runExe(file, args = [], timeoutMs = 5000) {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const cwd = path.dirname(file);
    const child = execFile(file, args, { cwd, timeout: timeoutMs, windowsHide: true, maxBuffer: 1024 * 1024 * 2 }, (error, stdout, stderr) => {
      const timedOut = error && (error.killed || error.signal === "SIGTERM") && Date.now() - startedAt >= timeoutMs - 50;
      resolve({
        ok: !error,
        exitCode: error && Number.isFinite(error.code) ? error.code : 0,
        signal: error && error.signal ? error.signal : null,
        timedOut: !!timedOut,
        durationMs: Date.now() - startedAt,
        stdout: String(stdout || ""),
        stderr: String(stderr || ""),
        error: error ? error.message : null
      });
    });
    child.on("error", error => resolve({ ok: false, exitCode: null, signal: null, timedOut: false, durationMs: Date.now() - startedAt, stdout: "", stderr: "", error: error.message }));
  });
}

function runExe(file, args = [], timeoutMs = 5000) {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const cwd = path.dirname(file);
    const child = execFile(file, args, { cwd, timeout: timeoutMs, windowsHide: true, maxBuffer: 1024 * 1024 * 2 }, (error, stdout, stderr) => {
      const timedOut = error && (error.killed || error.signal === "SIGTERM") && Date.now() - startedAt >= timeoutMs - 50;
      resolve({
        ok: !error,
        exitCode: error && Number.isFinite(error.code) ? error.code : 0,
        signal: error && error.signal ? error.signal : null,
        timedOut: !!timedOut,
        durationMs: Date.now() - startedAt,
        stdout: String(stdout || ""),
        stderr: String(stderr || ""),
        error: error ? error.message : null
      });
    });
    child.on("error", error => resolve({ ok: false, exitCode: null, signal: null, timedOut: false, durationMs: Date.now() - startedAt, stdout: "", stderr: "", error: error.message }));
  });
}

function psJson(script, timeoutMs = 15000) {
  return new Promise((resolve) => {
    execFile(
      "powershell.exe",
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script],
      { timeout: timeoutMs, windowsHide: true, maxBuffer: 1024 * 1024 * 5 },
      (error, stdout, stderr) => {
        if (error) {
          resolve({ ok: false, error: error.message, stderr: String(stderr || ""), stdout: String(stdout || "") });
          return;
        }
        const text = String(stdout || "").trim();
        if (!text) return resolve({ ok: true, value: [] });
        try { resolve({ ok: true, value: JSON.parse(text) }); }
        catch (parseError) { resolve({ ok: false, error: parseError.message, stdout: text, stderr: String(stderr || "") }); }
      }
    );
  });
}

function queryOf(payload = {}) {
  return String(payload.query || payload.find || payload.name || payload.target || "").trim();
}

function processWhere(query) {
  const escaped = query.replace(/'/g, "''");
  if (!escaped) return "$_";
  return `($_.ProcessName -like '*${escaped}*' -or $_.Path -like '*${escaped}*' -or [string]$_.Id -eq '${escaped}')`;
}

function normalizeList(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function safeNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function buildProcessActions(ctx) {
  const { payload } = ctx;

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
      const args = Array.isArray(payload.args) ? payload.args.map(String) : [];
      const timeoutMs = Math.max(250, Math.min(safeNumber(payload.timeoutMs, 5000), 30000));
      const result = await runExe(exe, args, timeoutMs);
      return { ok: result.ok, action: "windowsExeSmokeTest", path: rel, bytes: stat.size, mz: head === "MZ", timeoutMs, ...result };
    },

    async windowsExeSmokeTest() {
      const rel = payload.path || payload.p || payload.file || payload.target;
      if (!rel) return { ok: false, action: "windowsExeSmokeTest", error: "path_required" };
      const exe = safePath(ctx.config, rel);
      if (!exe.toLowerCase().endsWith(".exe")) return { ok: false, action: "windowsExeSmokeTest", error: "not_an_exe", path: rel };
      if (!fs.existsSync(exe)) return { ok: false, action: "windowsExeSmokeTest", error: "not_found", path: rel };
      const stat = fs.statSync(exe);
      const head = fs.readFileSync(exe).slice(0, 2).toString("ascii");
      const args = Array.isArray(payload.args) ? payload.args.map(String) : [];
      const timeoutMs = Math.max(250, Math.min(safeNumber(payload.timeoutMs, 5000), 30000));
      const result = await runExe(exe, args, timeoutMs);
      return { ok: result.ok, action: "windowsExeSmokeTest", path: rel, bytes: stat.size, mz: head === "MZ", timeoutMs, ...result };
    },

    async processKillSafe() {
      const ids = [];
      if (payload.pid || payload.id) ids.push(Number(payload.pid || payload.id));
      if (Array.isArray(payload.pids)) ids.push(...payload.pids.map(Number));
      const query = queryOf(payload);
      const dryRun = payload.dryRun !== false;
      const confirm = payload.confirm === true || String(payload.confirm).toLowerCase() === "true";

      let processes = [];
      if (ids.length) {
        const idList = ids.filter(Number.isFinite).join(",");
        const script = `Get-Process -Id ${idList} -ErrorAction SilentlyContinue | Select-Object Id,ProcessName,Path,StartTime,CPU,WorkingSet64 | ConvertTo-Json -Depth 4`;
        const out = await psJson(script, safeNumber(payload.timeoutMs, 15000));
        if (!out.ok) return { ok: false, action: "processKillSafe", ...out };
        processes = normalizeList(out.value);
      } else if (query) {
        const where = processWhere(query);
        const script = `Get-Process | Where-Object { ${where} } | Select-Object Id,ProcessName,Path,StartTime,CPU,WorkingSet64 | ConvertTo-Json -Depth 4`;
        const out = await psJson(script, safeNumber(payload.timeoutMs, 15000));
        if (!out.ok) return { ok: false, action: "processKillSafe", query, ...out };
        processes = normalizeList(out.value);
      }

      const safe = processes.filter(proc => {
        const p = String(proc.Path || "");
        const n = String(proc.ProcessName || "").toLowerCase();
        if (!p && !query) return false;
        if (["system", "idle", "wininit", "csrss", "lsass", "services", "svchost"].includes(n)) return false;
        return true;
      });

      if (dryRun || !confirm) {
        return { ok: true, action: "processKillSafe", dryRun: true, confirmRequired: true, matched: processes.length, killable: safe };
      }

      const killed = [];
      for (const proc of safe) {
        const id = Number(proc.Id);
        if (!Number.isFinite(id)) continue;
        const script = `Stop-Process -Id ${id} -Force -ErrorAction Stop; [pscustomobject]@{Id=${id};Killed=$true} | ConvertTo-Json`;
        const out = await psJson(script, safeNumber(payload.timeoutMs, 15000));
        killed.push({ id, ok: !!out.ok, error: out.error || null });
      }
      return { ok: killed.every(x => x.ok), action: "processKillSafe", dryRun: false, matched: processes.length, killed };
    }
  };
}

module.exports = { buildProcessActions };
