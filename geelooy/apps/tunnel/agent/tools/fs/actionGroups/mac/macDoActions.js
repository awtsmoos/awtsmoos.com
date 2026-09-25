// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFile, spawn } = require("node:child_process");

const ConfirmTokens = require("./confirmTokens.js");
const StateDir = require("./stateDir.js");
const CommandJobStore = require("../../commandJobStore.js");

/**
 * @file "DO THINGS ON THE MAC" companion actions (feature group A).
 * @description
 * The Awtsmoos lets the companion do real work on the Mac: durable background
 * jobs, Spotlight search, opening targets, process vitals and guarded kills,
 * and caffeinate wake assertions. Every handler never throws: failures return
 * `{ ok: false, error: "..." }`. Every child_process call is bounded with a
 * timeout (15-60s) and uses execFile arg arrays (never shell interpolation).
 *
 * Testability: `context.testExec` (a fake `(cmd, args, opts) ->
 * { stdout, stderr, status }`) replaces real child_process whenever present;
 * `context.testSpawn` (a fake `(cmd, args) -> { pid }`) replaces real
 * caffeinate spawning; `context.testJobStore` / `context.testConfirmTokens`
 * override the durable job store and the kill-confirmation tokens;
 * `context.testHome` / `context.testTmp` override home/tmp resolution and
 * `context.testStateDir` overrides the private state dir used by the wake
 * assertions. No test may touch real system state or real user files.
 */

const JOB_RUN_TIMEOUT_DEFAULT_MS = 3600000;
const JOB_RUN_TIMEOUT_MAX_MS = 86400000;
const JOB_WAIT_DEFAULT_MS = 60000;
const JOB_WAIT_MAX_MS = 300000;
const JOB_WAIT_CHUNK_MS = 120000;
const JOB_WAIT_MAX_CHUNKS = 50;
const OUTPUT_MAX_DEFAULT = 20000;
const OUTPUT_MAX_CAP = 200000;

const KILL_SIGNALS = new Set(["TERM", "INT", "KILL"]);
const TERMINAL_JOB_STATES = new Set([
	"completed", "failed", "timed_out", "cancelled", "killed",
	"cleanup_failed", "stale_lost_worker", "identity_unverified", "rejected"
]);

const KIND_CLAUSES = {
	pdf: 'kMDItemContentTypeTree == "com.adobe.pdf"',
	image: 'kMDItemContentTypeTree == "public.image"',
	doc: "(" + [
		'kMDItemContentTypeTree == "public.text"',
		'kMDItemContentTypeTree == "public.rtf"',
		'kMDItemContentTypeTree == "com.apple.rtfd"',
		'kMDItemContentTypeTree == "com.microsoft.word.doc"',
		'kMDItemContentTypeTree == "org.openxmlformats.wordprocessingml.document"',
		'kMDItemContentTypeTree == "com.microsoft.excel.xls"',
		'kMDItemContentTypeTree == "org.openxmlformats.spreadsheetml.sheet"',
		'kMDItemContentTypeTree == "com.microsoft.powerpoint.ppt"',
		'kMDItemContentTypeTree == "org.openxmlformats.presentationml.presentation"'
	].join(" || ") + ")"
};
const RECENCY_DAYS = { today: 1, yesterday: 2, week: 7, month: 30, any: 0 };

const AWAKE_FILE = "awake-assertions.json";
const AWAKE_SIDECAR = "mac-do.json";

/**
 * Builds the group-A actions. `context = { config, payload, ...test overrides }`.
 * Each handler is `async () => {...}` and reads `const { config, payload = {} } = context;`.
 */
function buildMacDoActions(context = {}) {
	return {
		macJobRun: async () => macJobRun(context),
		macJobStatus: async () => macJobStatus(context),
		macJobWait: async () => macJobWait(context),
		macJobCancel: async () => macJobCancel(context),
		macJobOutput: async () => macJobOutput(context),
		macJobReceipts: async () => macJobReceipts(context),
		macFind: async () => macFind(context),
		macOpen: async () => macOpen(context),
		macTop: async () => macTop(context),
		macKill: async () => macKill(context),
		macAwakeStart: async () => macAwakeStart(context),
		macAwakeStop: async () => macAwakeStop(context),
		macAwakeList: async () => macAwakeList(context)
	};
}

/* ------------------------------------------------------------------ */
/* shared helpers                                                      */
/* ------------------------------------------------------------------ */

function fail(error, detail) {
	const out = { ok: false, error };
	if (detail !== undefined && detail !== "") out.detail = String(detail).slice(0, 300);
	return out;
}

function clampInt(value, minimum, maximum) {
	const n = Number(value);
	if (!Number.isFinite(n)) return minimum;
	return Math.max(minimum, Math.min(maximum, Math.floor(n)));
}

function storeOf(context) {
	return context.testJobStore || CommandJobStore;
}

function tokensOf(context) {
	return context.testConfirmTokens || ConfirmTokens;
}

function homeDir(context) {
	return context.testHome || os.homedir();
}

function tmpBase(context) {
	return context.testTmp || os.tmpdir();
}

function stateDirOf(context) {
	if (context.testStateDir) {
		fs.mkdirSync(context.testStateDir, { recursive: true });
		return context.testStateDir;
	}
	return StateDir.ensure();
}

/**
 * Runs one bounded command. Uses context.testExec when present, otherwise
 * execFile with a timeout. Never throws: always resolves { stdout, stderr, status }.
 */
async function runExec(context, cmd, args, opts = {}) {
	if (typeof context.testExec === "function") {
		try {
			const r = await context.testExec(cmd, args, opts);
			return {
				stdout: r && r.stdout != null ? String(r.stdout) : "",
				stderr: r && r.stderr != null ? String(r.stderr) : "",
				status: r && Number.isInteger(r.status) ? r.status : 0
			};
		} catch (error) {
			return { stdout: "", stderr: error && error.message ? error.message : String(error), status: 1 };
		}
	}
	return new Promise(resolve => {
		execFile(
			cmd,
			args,
			{ timeout: opts.timeoutMs || 15000, maxBuffer: 16 * 1024 * 1024, cwd: opts.cwd, encoding: "utf8" },
			(error, stdout, stderr) => {
				if (error) {
					const status = typeof error.code === "number" ? error.code : 1;
					resolve({
						stdout: stdout || "",
						stderr: (error.killed ? "timeout: " : "") + (stderr || error.message || ""),
						status
					});
					return;
				}
				resolve({ stdout: stdout || "", stderr: stderr || "", status: 0 });
			}
		);
	});
}

/**
 * Spawns a detached, unrefed child. Uses context.testSpawn when present so
 * tests never birth a real process. Never throws: returns { pid } or throws
 * only when the real spawn call itself throws synchronously.
 */
function spawnDetached(context, cmd, args) {
	if (typeof context.testSpawn === "function") {
		const r = context.testSpawn(cmd, args) || {};
		return { pid: Number(r.pid) || 0 };
	}
	const child = spawn(cmd, args, { detached: true, stdio: "ignore" });
	child.on("error", () => {});
	child.unref();
	return child;
}

/* ------------------------------------------------------------------ */
/* durable jobs (macJob*)                                               */
/* ------------------------------------------------------------------ */

function saveJobSidecar(context, config, store, jobId, sidecar) {
	try {
		const dir = store.jobDir(config, jobId);
		fs.mkdirSync(dir, { recursive: true });
		fs.writeFileSync(
			path.join(dir, AWAKE_SIDECAR),
			JSON.stringify(sidecar),
			{ mode: 0o600 }
		);
	} catch {}
}

async function macJobRun(context) {
	const { config, payload = {} } = context;
	const command = String(payload.command || "").trim();
	if (!command) return fail("missing_command");
	const timeoutMs = clampInt(
		payload.timeoutMs == null ? JOB_RUN_TIMEOUT_DEFAULT_MS : payload.timeoutMs,
		100,
		JOB_RUN_TIMEOUT_MAX_MS
	);
	const label = String(payload.label || "").slice(0, 200);
	const notifyNote = String(payload.notifyNote || "").slice(0, 2000);
	const store = storeOf(context);
	let started;
	try {
		started = await store.startCommandJob(config, { ...payload, command, timeoutMs });
	} catch (error) {
		return fail("job_start_failed", error && error.message);
	}
	if (!started || typeof started !== "object" || started.ok === false) {
		return started && typeof started === "object" ? started : fail("job_start_failed");
	}
	const jobId = started.jobId ? String(started.jobId) : "";
	if (jobId) {
		saveJobSidecar(context, config, store, jobId, {
			label,
			notifyNote,
			startedVia: "macJobRun",
			startedAt: new Date().toISOString()
		});
	}
	const out = {
		ok: true,
		jobId,
		status: started.status || "unknown",
		next: { action: "macJobStatus", jobId }
	};
	if (label) out.label = label;
	if (notifyNote) out.notifyNote = notifyNote;
	return out;
}

async function macJobStatus(context) {
	const { config, payload = {} } = context;
	const jobId = String(payload.jobId || "").trim();
	if (!jobId) return fail("missing_jobId");
	try {
		return await storeOf(context).commandStatus(config, { jobId });
	} catch (error) {
		return fail("job_status_failed", error && error.message);
	}
}

async function macJobWait(context) {
	const { config, payload = {} } = context;
	const jobId = String(payload.jobId || "").trim();
	if (!jobId) return fail("missing_jobId");
	const totalMs = clampInt(
		payload.timeoutMs == null ? JOB_WAIT_DEFAULT_MS : payload.timeoutMs,
		50,
		JOB_WAIT_MAX_MS
	);
	const store = storeOf(context);
	const startedAt = Date.now();
	let last = null;
	for (let i = 0; i < JOB_WAIT_MAX_CHUNKS; i++) {
		const remaining = totalMs - (Date.now() - startedAt);
		if (remaining <= 0) break;
		const chunk = Math.min(remaining, JOB_WAIT_CHUNK_MS);
		let res;
		try {
			res = await store.commandWait(config, { jobId, timeoutMs: chunk, inlineOutput: true });
		} catch (error) {
			return fail("job_wait_failed", error && error.message);
		}
		last = res;
		if (!res || res.ok === false || res.done === true) {
			return { ...(res || {}), waitedMs: Date.now() - startedAt };
		}
	}
	return {
		...(last || {}),
		ok: true,
		done: false,
		waitTimedOut: true,
		waitedMs: Date.now() - startedAt,
		statusPayload: { action: "macJobStatus", jobId },
		nextWaitPayload: { action: "macJobWait", jobId, timeoutMs: totalMs, inlineOutput: true }
	};
}

async function macJobCancel(context) {
	const { config, payload = {} } = context;
	const jobId = String(payload.jobId || "").trim();
	if (!jobId) return fail("missing_jobId");
	try {
		return await storeOf(context).cancelCommandJob(config, { jobId });
	} catch (error) {
		return fail("job_cancel_failed", error && error.message);
	}
}

async function macJobOutput(context) {
	const { config, payload = {} } = context;
	const jobId = String(payload.jobId || "").trim();
	if (!jobId) return fail("missing_jobId");
	const stream = String(payload.stream || "stdout").toLowerCase() === "stderr" ? "stderr" : "stdout";
	const maxChars = clampInt(
		payload.maxChars == null ? OUTPUT_MAX_DEFAULT : payload.maxChars,
		1,
		OUTPUT_MAX_CAP
	);
	try {
		return await storeOf(context).commandJobOutputPage(config, { jobId, stream, maxChars });
	} catch (error) {
		return fail("job_output_failed", error && error.message);
	}
}

/**
 * Scans the durable job store for terminal jobs finished since `sinceMs`.
 * Never crashes on unreadable entries: they are skipped.
 */
async function macJobReceipts(context) {
	const { config, payload = {} } = context;
	const sinceMs = payload.sinceMs == null
		? Date.now() - 24 * 60 * 60 * 1000
		: Number(payload.sinceMs);
	const store = storeOf(context);
	let names;
	try {
		names = await fs.promises.readdir(store.storeRoot(config));
	} catch (error) {
		return fail("job_store_unreadable", error && error.message);
	}
	const root = store.storeRoot(config);
	const receipts = [];
	for (const name of names) {
		try {
			const dir = path.join(root, name);
			const st = await fs.promises.stat(dir);
			if (!st.isDirectory()) continue;
			const meta = JSON.parse(await fs.promises.readFile(path.join(dir, "meta.json"), "utf8"));
			if (!meta || !TERMINAL_JOB_STATES.has(String(meta.status))) continue;
			const finishedAt = Date.parse(meta.finishedAt || meta.updatedAt || "") || 0;
			if (!(finishedAt >= sinceMs)) continue;
			let label = "";
			try {
				const sidecar = JSON.parse(
					await fs.promises.readFile(path.join(dir, AWAKE_SIDECAR), "utf8")
				);
				label = String((sidecar && sidecar.label) || "");
			} catch {}
			receipts.push({
				jobId: String(meta.jobId || name),
				label,
				status: String(meta.status),
				exitCode: meta.exitCode == null ? null : Number(meta.exitCode),
				finishedAt
			});
		} catch {
			/* skip unreadable or malformed entries */
		}
	}
	receipts.sort((a, b) => b.finishedAt - a.finishedAt);
	return { ok: true, sinceMs, count: receipts.length, receipts };
}

/* ------------------------------------------------------------------ */
/* spotlight search (macFind)                                          */
/* ------------------------------------------------------------------ */

function escapeMdfindQuery(query) {
	return query.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

async function macFind(context) {
	const { payload = {} } = context;
	const query = String(payload.query || "").trim();
	if (!query) return fail("missing_query");
	const kind = KIND_CLAUSES[payload.kind] ? payload.kind : "any";
	const recency = Object.prototype.hasOwnProperty.call(RECENCY_DAYS, payload.recency)
		? payload.recency
		: "any";
	const limit = clampInt(payload.limit == null ? 20 : payload.limit, 1, 100);
	const q = escapeMdfindQuery(query);
	const clauses = [`(kMDItemDisplayName == "*${q}*" || kMDItemTextContent == "*${q}*")`];
	if (kind !== "any") clauses.push(`(${KIND_CLAUSES[kind]})`);
	const days = RECENCY_DAYS[recency];
	if (days > 0) clauses.push(`(kMDItemFSContentChangeDate >= $time.today(-${days}))`);
	const compound = clauses.join(" && ");
	const r = await runExec(context, "mdfind", [compound], { timeoutMs: 20000 });
	if (r.status !== 0) {
		return fail("mdfind_failed", (r.stderr || r.stdout || "").slice(0, 300));
	}
	const paths = r.stdout.split(/\r?\n/).map(line => line.trim()).filter(Boolean).slice(0, limit);
	const results = [];
	for (const p of paths) {
		try {
			const st = await fs.promises.stat(p);
			if (!st.isFile() && !st.isDirectory()) continue;
			results.push({
				path: p,
				name: path.basename(p),
				bytes: st.size,
				modified: st.mtime.toISOString()
			});
		} catch {
			/* unreadable file: skip */
		}
	}
	return { ok: true, query, kind, recency, count: results.length, results };
}

/* ------------------------------------------------------------------ */
/* open targets (macOpen)                                              */
/* ------------------------------------------------------------------ */

function expandTilde(target, home) {
	if (target === "~") return home;
	if (target.startsWith("~/")) return path.join(home, target.slice(2));
	return target;
}

/** Resolves a filesystem target and pins it inside HOME, /Applications, or tmp. */
function resolveOpenPath(context, target) {
	const home = path.normalize(homeDir(context));
	const tmp = path.normalize(tmpBase(context));
	let resolved;
	if (path.isAbsolute(expandTilde(target, home))) {
		resolved = path.normalize(expandTilde(target, home));
	} else {
		resolved = path.normalize(path.join(home, expandTilde(target, home)));
	}
	const roots = [home, "/Applications", tmp];
	const inside = roots.some(
		root => resolved === root || resolved.startsWith(root + path.sep)
	);
	return inside ? resolved : null;
}

async function macOpen(context) {
	const { payload = {} } = context;
	const target = String(payload.target || "").trim();
	if (!target) return fail("missing_target");
	if (/^https?:\/\//i.test(target)) {
		const r = await runExec(context, "open", [target], { timeoutMs: 20000 });
		return r.status === 0
			? { ok: true, opened: target }
			: fail("open_failed", (r.stderr || r.stdout || "").slice(0, 300));
	}
	const looksLikeApp = /\.app\/?$/i.test(target);
	if (looksLikeApp || (!target.includes("/") && !target.includes(path.sep) && !target.startsWith("/"))) {
		const r = await runExec(context, "open", ["-a", target], { timeoutMs: 20000 });
		return r.status === 0
			? { ok: true, opened: target }
			: fail("open_failed", (r.stderr || r.stdout || "").slice(0, 300));
	}
	const resolved = resolveOpenPath(context, target);
	if (!resolved) return fail("path_outside_allowed_roots");
	try {
		const st = fs.statSync(resolved);
		if (!st) return fail("target_not_found");
	} catch {
		return fail("target_not_found");
	}
	const r = await runExec(context, "open", [resolved], { timeoutMs: 20000 });
	return r.status === 0
		? { ok: true, opened: target }
		: fail("open_failed", (r.stderr || r.stdout || "").slice(0, 300));
}

/* ------------------------------------------------------------------ */
/* process vitals (macTop)                                             */
/* ------------------------------------------------------------------ */

async function macTop(context) {
	const { payload = {} } = context;
	const by = payload.by === "mem" ? "mem" : "cpu";
	const limit = clampInt(payload.limit == null ? 10 : payload.limit, 1, 50);
	const r = await runExec(context, "ps", ["-arcwwwxo", "pid,pcpu,pmem,comm"], { timeoutMs: 20000 });
	if (r.status !== 0) {
		return fail("ps_failed", (r.stderr || r.stdout || "").slice(0, 300));
	}
	const rows = [];
	for (const line of r.stdout.split(/\r?\n/)) {
		const m = line.match(/^\s*(\d+)\s+([\d.]+)\s+([\d.]+)\s+(.*\S)\s*$/);
		if (!m) continue;
		rows.push({
			pid: Number(m[1]),
			cpu: Number(m[2]),
			mem: Number(m[3]),
			command: m[4].trim()
		});
	}
	rows.sort((a, b) => (by === "mem" ? b.mem - a.mem : b.cpu - a.cpu) || a.pid - b.pid);
	return { ok: true, by, limit, entries: rows.slice(0, limit) };
}

/* ------------------------------------------------------------------ */
/* guarded kill (macKill)                                              */
/* ------------------------------------------------------------------ */

/** Lists pid + full command line via ps. Returns null on ps failure. */
async function psList(context) {
	const r = await runExec(context, "ps", ["-axww", "-o", "pid=,command="], { timeoutMs: 20000 });
	if (r.status !== 0) return null;
	const rows = [];
	for (const line of r.stdout.split(/\r?\n/)) {
		const m = line.match(/^\s*(\d+)\s+(.*\S)\s*$/);
		if (m) rows.push({ pid: Number(m[1]), command: m[2] });
	}
	return rows;
}

function killRefusalReason(pid, commandLine) {
	if (pid <= 1) return "system_process";
	if (pid === process.pid) return "own_process";
	const cl = String(commandLine || "");
	if (/node/i.test(cl) && cl.toLowerCase().includes("awtsmoos")) return "tunnel_agent_self_protection";
	return null;
}

async function macKill(context) {
	const { payload = {} } = context;
	const signal = String(payload.signal || "TERM").toUpperCase();
	if (!KILL_SIGNALS.has(signal)) return fail("signal_not_allowed");
	const tokens = tokensOf(context);

	if (payload.confirmToken) {
		const bound = tokens.consume(payload.confirmToken);
		if (!bound || !Array.isArray(bound.pids)) return fail("bad_or_expired_token");
		const raw = String(bound.signal || signal).toUpperCase();
		const sig = KILL_SIGNALS.has(raw) ? raw : "TERM";
		const results = [];
		for (const pid of bound.pids) {
			const r = await runExec(context, "kill", [`-${sig}`, String(pid)], { timeoutMs: 15000 });
			results.push(r.status === 0
				? { pid, ok: true }
				: { pid, ok: false, error: (r.stderr || r.stdout || "kill_failed").slice(0, 200) });
		}
		return { ok: true, signal: sig, results };
	}

	let candidates;
	if (payload.pid != null && String(payload.pid).trim() !== "") {
		const pid = Number(payload.pid);
		if (!Number.isInteger(pid) || pid < 0) return fail("invalid_pid");
		const rows = await psList(context);
		if (rows === null) return fail("ps_failed");
		const row = rows.find(entry => entry.pid === pid);
		if (!row) return fail("no_such_process");
		candidates = [{ pid: row.pid, command: row.command }];
	} else if (payload.name != null && String(payload.name).trim() !== "") {
		const needle = String(payload.name).toLowerCase();
		const rows = await psList(context);
		if (rows === null) return fail("ps_failed");
		candidates = rows
			.filter(entry => entry.command.toLowerCase().includes(needle))
			.slice(0, 20)
			.map(entry => ({ pid: entry.pid, command: entry.command }));
		if (candidates.length === 0) return fail("no_matching_process");
	} else {
		return fail("missing_pid_or_name");
	}

	const refused = [];
	const allowed = [];
	for (const candidate of candidates) {
		const reason = killRefusalReason(candidate.pid, candidate.command);
		if (reason) refused.push({ pid: candidate.pid, command: candidate.command, reason });
		else allowed.push(candidate);
	}
	if (allowed.length === 0) return { ok: false, error: "all_candidates_refused", refused };
	const confirmToken = tokens.create({ pids: allowed.map(c => c.pid), signal, issuedAt: Date.now() });
	const out = {
		ok: false,
		needsConfirmation: true,
		confirmToken,
		signal,
		preview: allowed.map(c => ({ pid: c.pid, command: c.command }))
	};
	if (refused.length > 0) out.refused = refused;
	return out;
}

/* ------------------------------------------------------------------ */
/* wake assertions (macAwake*)                                         */
/* ------------------------------------------------------------------ */

function awakeFile(context) {
	return path.join(stateDirOf(context), AWAKE_FILE);
}

function readAwakeRecords(context) {
	try {
		const raw = fs.readFileSync(awakeFile(context), "utf8");
		const data = JSON.parse(raw);
		if (data && typeof data === "object") return data;
	} catch {}
	return {};
}

function writeAwakeRecords(context, data) {
	try {
		fs.writeFileSync(awakeFile(context), JSON.stringify(data, null, 2), { mode: 0o600 });
		return true;
	} catch {
		return false;
	}
}

async function caffeinateAlive(context, pid) {
	if (!(pid > 0)) return false;
	const r = await runExec(context, "kill", ["-0", String(pid)], { timeoutMs: 15000 });
	return r.status === 0;
}

async function macAwakeStart(context) {
	const { payload = {} } = context;
	const minutes = clampInt(payload.minutes == null ? 120 : payload.minutes, 1, 1440);
	const seconds = minutes * 60;
	let child;
	try {
		child = spawnDetached(context, "caffeinate", ["-dimsu", "-t", String(seconds)]);
	} catch (error) {
		return fail("caffeinate_spawn_failed", error && error.message);
	}
	const caffeinatePid = Number(child && child.pid) || 0;
	if (!(caffeinatePid > 0)) return fail("caffeinate_spawn_failed");
	const assertionId = crypto.randomBytes(8).toString("hex");
	const now = Date.now();
	const record = {
		assertionId,
		caffeinatePid,
		expiresAt: now + minutes * 60000,
		jobId: payload.jobId != null ? String(payload.jobId) : null,
		label: String(payload.label || "").slice(0, 200),
		createdAt: new Date(now).toISOString()
	};
	const all = readAwakeRecords(context);
	all[assertionId] = record;
	if (!writeAwakeRecords(context, all)) return fail("assertion_record_failed");
	return { ok: true, assertionId, caffeinatePid, expiresAt: record.expiresAt, minutes };
}

async function macAwakeStop(context) {
	const { payload = {} } = context;
	const assertionId = String(payload.assertionId || "").trim();
	if (!assertionId) return fail("missing_assertionId");
	const all = readAwakeRecords(context);
	const record = all[assertionId];
	if (!record) return fail("unknown_assertion");
	const pid = Number(record.caffeinatePid) || 0;
	let killWarning;
	if (pid > 0) {
		const r = await runExec(context, "kill", ["-TERM", String(pid)], { timeoutMs: 15000 });
		if (r.status !== 0) killWarning = (r.stderr || r.stdout || "kill_failed").slice(0, 200);
	}
	delete all[assertionId];
	writeAwakeRecords(context, all);
	const out = { ok: true, stopped: assertionId, caffeinatePid: pid };
	if (killWarning) out.killWarning = killWarning;
	return out;
}

async function macAwakeList(context) {
	const all = readAwakeRecords(context);
	const now = Date.now();
	const live = [];
	let dirty = false;
	for (const [id, record] of Object.entries(all)) {
		const pid = Number(record && record.caffeinatePid) || 0;
		const expired = record && record.expiresAt ? now > Number(record.expiresAt) : false;
		const alive = !expired && await caffeinateAlive(context, pid);
		if (!alive) {
			if (pid > 0) {
				try {
					await runExec(context, "kill", ["-KILL", String(pid)], { timeoutMs: 15000 });
				} catch {}
			}
			delete all[id];
			dirty = true;
			continue;
		}
		live.push({
			assertionId: id,
			caffeinatePid: pid,
			expiresAt: Number(record.expiresAt),
			label: String(record.label || ""),
			jobId: record.jobId != null ? String(record.jobId) : null,
			createdAt: String(record.createdAt || "")
		});
	}
	if (dirty) writeAwakeRecords(context, all);
	live.sort((a, b) => a.expiresAt - b.expiresAt);
	return { ok: true, count: live.length, assertions: live };
}

module.exports = { buildMacDoActions };
