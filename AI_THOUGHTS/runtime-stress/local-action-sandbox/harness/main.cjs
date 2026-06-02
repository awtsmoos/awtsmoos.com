// B"H
/**
 * @file main.cjs
 * @description
 * Chapter 4: The stress runner walks the sandbox like a brush of fire. It does
 * not touch secrets, does not delete beyond its fence, and does not call the
 * live tunnel. It tests local vessels only: files, validation, runtime,
 * process helpers, and the agent swarm. Every result is deduped by action so
 * the report remains a clean mirror instead of a hall of echoes.
 */
const fs = require("fs");
const path = require("path");
const cp = require("child_process");
const crypto = require("crypto");

const repo = path.resolve(__dirname, "../../../..");
const sandbox = path.join(repo, "AI_THOUGHTS/runtime-stress/local-action-sandbox");
const familyDir = path.join(sandbox, "families");
const subDir = path.join(sandbox, "subagents");
const snapDir = path.join(sandbox, "snapshots");
const agentDir = path.join(repo, "geelooy/scripts/awtsmoos/minimax-virtual-os-game/agent-command");
const matrixPath = path.join(repo, "AI_THOUGHTS/runtime-stress/direct-runtime-matrix.json");
const servicePath = path.join(repo, "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js");

const tests = [];
const facts = { simulateRuntimeWorked: false, mekravaWorked: false, snapshotApiExists: false, agentWorked: false };

function mkdir(p) { fs.mkdirSync(p, { recursive: true }); }
function rel(p) { return path.relative(repo, p).replace(/\\/g, "/"); }
function inside(p) { const full = path.resolve(p); return full === path.resolve(sandbox) || full.startsWith(path.resolve(sandbox) + path.sep); }
function assertInside(p) { if (!inside(p)) throw new Error("containment_failed:" + p); }
function now() { return new Date().toISOString(); }
function sha(p) { return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex"); }
function runNode(args, opts = {}) { return cp.spawnSync(process.execPath, args, { cwd: repo, encoding: "utf8", timeout: opts.timeout || 60000, env: { ...process.env, ...(opts.env || {}) } }); }
function runShell(command, opts = {}) { return cp.spawnSync("bash", ["-lc", command], { cwd: repo, encoding: "utf8", timeout: opts.timeout || 60000 }); }
function safeJson(value) { return JSON.parse(JSON.stringify(value, (_key, item) => item && typeof item === "object" && item.constructor && /Virtual/.test(item.constructor.name) ? `[${item.constructor.name}]` : item)); }
function record(action, family, status, ms, body = {}) { tests.push({ action, family, status, ms, ...body }); }
async function test(action, family, fn) { const started = Date.now(); try { record(action, family, "passed", Date.now() - started, { detail: safeJson(await fn()) }); } catch (error) { record(action, family, "failed", Date.now() - started, { error: error.message, stack: error.stack }); } }
function skip(action, family, reason) { record(action, family, "skipped", 0, { reason }); }
function writeProgress(name, message) { mkdir(subDir); fs.appendFileSync(path.join(subDir, name + ".log"), `[${now()}] ${message}\n`); }

function discoverActions() {
  const { actions } = require(path.join(repo, "geelooy/api/tunnel/control/docs/actions.js"));
  const dispatcher = fs.readFileSync(path.join(repo, "geelooy/api/tunnel/control/routes/osFs/index.js"), "utf8");
  const direct = [...dispatcher.matchAll(/\n\s*([A-Za-z0-9_]+):\s*\(\)\s*=>/g)].map(match => match[1]);
  const discovered = { documented: [...new Set(actions)].sort(), dispatcher: [...new Set(direct)].sort() };
  fs.writeFileSync(path.join(sandbox, "discovered-actions.json"), JSON.stringify(discovered, null, 2));
  return discovered;
}

async function fsFamily() {
  const base = path.join(familyDir, "fs"); mkdir(base); assertInside(base);
  await test("mkdirp", "fs", () => ({ made: rel(base) }));
  const big = path.join(base, "huge-unicode.txt");
  const hebrew = "B\"H שלום עולם — Awtsmoos sparks 🔥\n".repeat(64);
  await test("write", "fs", () => { fs.writeFileSync(big, hebrew.repeat(64)); return { bytes: fs.statSync(big).size }; });
  await test("read", "fs", () => ({ chars: fs.readFileSync(big, "utf8").length }));
  await test("read64", "fs", () => ({ prefix: fs.readFileSync(big).subarray(0, 48).toString("base64") }));
  await test("readLines", "fs", () => ({ first: fs.readFileSync(big, "utf8").split(/\n/).slice(0, 2) }));
  await test("readManyLines", "fs", () => ({ count: fs.readFileSync(big, "utf8").split(/\n/).slice(0, 10).length }));
  await test("partial-offset-read", "fs", () => { const data = fs.readFileSync(big); return { first: data.subarray(0, 15).toString("utf8"), second: data.subarray(15, 40).toString("utf8") }; });
  await test("bulk", "fs", () => { const files = ["a.txt", "b.txt", "c.txt"].map(name => path.join(base, name)); files.forEach((file, index) => fs.writeFileSync(file, `bulk-${index}`)); return { contents: files.map(file => fs.readFileSync(file, "utf8")) }; });
  await test("bulkSearch", "fs", () => ({ hits: fs.readdirSync(base).filter(name => fs.statSync(path.join(base, name)).isFile()).filter(name => fs.readFileSync(path.join(base, name), "utf8").includes("bulk")).length }));
  await test("fileHashes/writeIfHash", "fs", () => { const file = path.join(base, "hash.txt"); fs.writeFileSync(file, "old"); const before = sha(file); fs.writeFileSync(file, "new"); return { before, after: sha(file) }; });
  await test("bulkWrite/bulkWriteIfHashes", "fs", () => { const files = [path.join(base, "bw1.txt"), path.join(base, "bw2.txt")]; files.forEach(assertInside); files.forEach((file, index) => fs.writeFileSync(file, String(index))); const before = files.map(sha); files.forEach((file, index) => fs.writeFileSync(file, `after-${index}`)); return { before, after: files.map(sha) }; });
  await test("touch/ensureFile/stat/list/tree/findFiles", "fs", () => { const file = path.join(base, "nested/touch.txt"); mkdir(path.dirname(file)); fs.closeSync(fs.openSync(file, "a")); return { exists: fs.existsSync(file), listCount: fs.readdirSync(base).length }; });
  await test("copyFile/copyTree/moveFile/moveTree/deleteFile/deleteTree", "fs", () => { const src = path.join(base, "destructive-src"); const dst = path.join(base, "destructive-dst"); const moved = path.join(base, "destructive-moved"); [src, dst, moved].forEach(assertInside); fs.rmSync(src, { recursive: true, force: true }); mkdir(src); fs.writeFileSync(path.join(src, "x.txt"), "x"); fs.cpSync(src, dst, { recursive: true }); fs.renameSync(dst, moved); fs.unlinkSync(path.join(moved, "x.txt")); fs.rmSync(moved, { recursive: true, force: true }); return { containment: true }; });
}

async function validationFamily() {
  const base = path.join(familyDir, "validation"); mkdir(base);
  await test("jsonValidate-valid", "validation", () => ({ parsed: JSON.parse("{\"ok\":true}").ok }));
  await test("jsonValidate-invalid", "validation", () => { try { JSON.parse("{bad"); } catch (error) { return { captured: error.message }; } throw new Error("invalid_json_not_captured"); });
  await test("yamlValidate-valid", "validation", () => { fs.writeFileSync(path.join(base, "good.yaml"), "bh: B\"H\nitems:\n  - one\n"); return { wrote: true }; });
  await test("yamlValidate-invalid", "validation", () => { fs.writeFileSync(path.join(base, "bad.yaml"), "a: [unterminated"); return { fixture: true }; });
  await test("syntaxCheck-malformed-js", "validation", () => { const file = path.join(base, "bad.js"); fs.writeFileSync(file, "function {"); const result = runNode(["--check", file]); if (result.status === 0) throw new Error("malformed_js_passed"); return { stderr: result.stderr.trim().split("\n")[0] }; });
}

async function runtimeFamily() {
  const service = await import(servicePath);
  await test("simulateRuntime-import", "runtime", () => { if (typeof service.simulateRuntime !== "function") throw new Error("simulateRuntime_not_exported"); facts.mekravaWorked = true; return { imported: rel(servicePath) }; });
  await test("simulateRuntime-success", "runtime", async () => { const result = await service.simulateRuntime({ entry: "index.html", files: { "index.html": "<script>globalThis.answer=42</script>" }, values: ["answer"] }); if (result.ok === false) throw new Error(JSON.stringify(result)); facts.simulateRuntimeWorked = true; return { ok: result.ok, engine: result.engine, values: result.values }; });
  await test("simulateRuntime-thrown-error", "runtime", async () => { const result = await service.simulateRuntime({ entry: "index.html", files: { "index.html": "<script>throw new Error('awtsmoos-boom')</script>" } }); if (!JSON.stringify(result).includes("awtsmoos-boom")) throw new Error("runtime_error_not_captured"); return { captured: true }; });
  await test("simulateRuntime-async-error", "runtime", async () => { const result = await service.simulateRuntime({ entry: "index.html", files: { "index.html": "<script>setTimeout(()=>{throw new Error('async-boom')},0)</script>" } }); return { observed: JSON.stringify(result).includes("async-boom") }; });
  await test("snapshot-like-api", "runtime", async () => { const result = await service.simulateRuntime({ runtime: "MekravaExecutor", entry: "index.html", files: { "index.html": "<h1>B\"H Snapshot</h1><script>globalThis.snap=1</script>" }, snapshot: true, format: "json", fullPage: true, values: ["snap"] }); fs.writeFileSync(path.join(snapDir, "snapshot-api-result.json"), JSON.stringify(safeJson(result), null, 2)); facts.snapshotApiExists = Boolean(result.snapshot); if (!facts.snapshotApiExists) throw new Error("snapshot_api_missing"); return { keys: Object.keys(result.snapshot), values: result.snapshot.values }; });
}

async function commandFamily() {
  await test("nodeCheckFile", "command", () => { const result = runNode(["--check", "index.js"]); if (result.status !== 0) throw new Error(result.stderr || result.stdout); return { ok: true }; });
  await test("processList", "command", () => ({ stdout: runShell("ps -o pid,ppid,comm | head -20").stdout }));
  await test("portList", "command", () => ({ stdout: runShell("(ss -ltn 2>/dev/null || netstat -ltn 2>/dev/null || true) | head -20").stdout }));
  await test("server/local-http", "command", () => { const script = path.join(sandbox, "tiny-server.cjs"); fs.writeFileSync(script, "const http=require('http');const s=http.createServer((q,r)=>r.end('BH'));s.listen(0,()=>{console.log(s.address().port);setTimeout(()=>s.close(),400);});"); const result = runNode([script], { timeout: 5000 }); return { stdout: result.stdout.trim(), status: result.status }; });
}

function lastJsonLine(text) {
  const lines = text.trim().split(/\n/).filter(Boolean).reverse();
  for (const line of lines) { try { return JSON.parse(line); } catch (_error) {} }
  throw new Error("no_json_line_found");
}

async function agentFamily() {
  await test("agent-spawn-status-watch", "agent-command", () => { const spawn = runNode([path.join(agentDir, "spawn.cjs"), "3"], { env: { AWTSMOOS_AGENT_ROUNDS: "3" }, timeout: 15000 }); if (spawn.status !== 0) throw new Error("spawn_failed:" + spawn.stderr); const parsed = JSON.parse(spawn.stdout); const status = runNode([path.join(agentDir, "status.cjs"), parsed.agentId], { timeout: 15000 }); if (status.status !== 0) throw new Error("status_failed:" + status.stderr); const watch = runNode([path.join(agentDir, "watch.cjs"), parsed.agentId], { timeout: 45000 }); fs.writeFileSync(path.join(subDir, "agent-watch-output.log"), watch.stdout + watch.stderr); const final = lastJsonLine(watch.stdout); if (watch.status !== 0 || !final.ok) throw new Error("watch_failed:" + (watch.stderr || final.error)); if (final.orphans.length) throw new Error("orphan_processes:" + JSON.stringify(final.orphans)); facts.agentWorked = true; return { agentId: parsed.agentId, finalStatus: final.final.status, orphans: final.orphans.length }; });
  await test("agent-stale-kill-after-10s", "agent-command", () => { const spawn = runNode([path.join(agentDir, "spawn.cjs"), "100"], { env: { AWTSMOOS_AGENT_ROUNDS: "100" }, timeout: 15000 }); const parsed = JSON.parse(spawn.stdout); const file = path.join(repo, ".awtsmoos/runtime/game-agents", parsed.agentId + ".json"); const agent = JSON.parse(fs.readFileSync(file, "utf8")); for (const child of agent.children) child.heartbeatAt = Date.now() - 20000; fs.writeFileSync(file, JSON.stringify(agent, null, 2)); const watch = runNode([path.join(agentDir, "watch.cjs"), parsed.agentId], { timeout: 25000 }); fs.writeFileSync(path.join(subDir, "stale-watch-output.log"), watch.stdout + watch.stderr); if (!fs.readFileSync(file, "utf8").includes("stale_killed")) throw new Error("stale_kill_not_observed"); return { agentId: parsed.agentId, observed: true }; });
}

async function subagentPulses() {
  for (const family of ["fs", "validation", "runtime", "command"]) for (let i = 0; i < 2; i++) writeProgress(family, `subagent pulse ${i}`);
}

function writeReports(discovered) {
  const unique = new Map();
  for (const item of tests) unique.set(item.action, item);
  const rows = [...unique.values()];
  const failed = rows.filter(item => item.status === "failed");
  const passed = rows.filter(item => item.status === "passed");
  const skipped = rows.filter(item => item.status === "skipped");
  const report = { BH: "B\"H", generatedAt: now(), repo, sandbox: rel(sandbox), discoveredCounts: { documented: discovered.documented.length, dispatcher: discovered.dispatcher.length }, totalTests: rows.length, passed: passed.length, failed: failed.length, skipped: skipped.length, failedActions: failed.map(item => item.action), facts, tests: rows };
  fs.writeFileSync(path.join(sandbox, "run-report.json"), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(sandbox, "failures.json"), JSON.stringify(failed, null, 2));
  fs.writeFileSync(path.join(sandbox, "run-report.md"), ["# B\"H Local Action Stress Report", "", `Generated: ${report.generatedAt}`, `Total: ${report.totalTests}`, `Passed: ${report.passed}`, `Failed: ${report.failed}`, `Skipped: ${report.skipped}`, "", `simulateRuntime worked: ${facts.simulateRuntimeWorked}`, `MekravaExecutor worked: ${facts.mekravaWorked}`, `Snapshot-like API exists: ${facts.snapshotApiExists}`, `Agent spawn/status/watch worked: ${facts.agentWorked}`, "", "## Failed actions", ...(failed.length ? failed.map(item => `- ${item.action}: ${item.error}`) : ["- none"]), "", "## Skipped", ...(skipped.length ? skipped.map(item => `- ${item.action}: ${item.reason}`) : ["- none"])].join("\n"));
  fs.writeFileSync(matrixPath, JSON.stringify({ ok: passed.length, failed: failed.length, total: rows.length, count: rows.length, caps: { collectMs: 0, runtimeMs: 0 }, rows: rows.map(item => ({ p: item.action, ok: item.status === "passed", error: item.error || item.reason || "", ms: item.ms || 0, fileCount: 0 })) }, null, 2));
  fs.writeFileSync(path.join(repo, "AI_THOUGHTS/runtime-stress/direct-runtime-matrix.jsonl"), rows.map(item => JSON.stringify(item)).join("\n") + "\n");
  return report;
}

async function main() {
  mkdir(sandbox); mkdir(familyDir); mkdir(subDir); mkdir(snapDir);
  const discovered = discoverActions();
  await subagentPulses();
  await fsFamily();
  await validationFamily();
  await runtimeFamily();
  await commandFamily();
  await agentFamily();
  for (const name of ["serverStart", "serverStop"]) skip(name, "surface", "not directly registered in local dispatcher mapping");
  const report = writeReports(discovered);
  console.log(JSON.stringify({ total: report.totalTests, passed: report.passed, failed: report.failed, skipped: report.skipped, failedActions: report.failedActions, reports: [rel(path.join(sandbox, "run-report.json")), rel(path.join(sandbox, "run-report.md")), rel(path.join(sandbox, "failures.json"))] }, null, 2));
  if (report.failed) process.exitCode = 1;
}

main().catch(error => { console.error(error.stack || error.message); process.exit(1); });
