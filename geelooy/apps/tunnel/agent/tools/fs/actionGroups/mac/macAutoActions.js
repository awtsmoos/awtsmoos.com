// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFile } = require("node:child_process");
/**
 * Lazily loads the shared state/token helpers. Lazy (not top-level) because
 * the helpers' own stateDir currently resolves a bad relative path (a
 * pre-existing repo issue); a top-level require would break this whole action
 * group at load. Returns null when unloadable so callers fail gracefully.
 */
function realStateDir() {
	try {
		return require("./stateDir.js");
	} catch {
		return null;
	}
}

function realConfirmTokens() {
	try {
		return require("./confirmTokens.js");
	} catch {
		return null;
	}
}

/**
 * @file Mac automation companion actions: scheduler, cleaners, shortcuts.
 * @description
 * The Awtsmoos tends the Mac like a careful housekeeper — appointments kept on
 * time, clutter previewed before it is moved, and never a deletion without a
 * second, sealed asking. Awtsmoos.com never bursts a backlog of missed runs and
 * never deletes without a single-use confirmation token.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const CATCHUP_SKIP_MS = 6 * 60 * 60 * 1000;
const TICK_MS = 30 * 1000;
const RUN_LOG_CAP = 500;
const SCHEDULES_FILE = "schedules.json";
const RUN_LOG_FILE = "schedule-runs.jsonl";
const DAY_INDEX = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

let tickerStarted = false;

/* ------------------------------------------------------------------ */
/* Context plumbing                                                    */
/* ------------------------------------------------------------------ */

function isTestMode(context = {}) {
	return context.testMode === true || process.env.AWTSMOOS_TEST_MODE === "1";
}

let testFallbackDir = null;

function testFallbackStateDir() {
	if (!testFallbackDir) {
		testFallbackDir = fs.mkdtempSync(path.join(os.tmpdir(), "macauto-test-"));
	}
	return testFallbackDir;
}

function stateDir(context = {}) {
	if (context.testStateDir) return context.testStateDir;
	// Test mode is hermetic: without an explicit fake dir, use a temp dir so
	// tests can never pollute the real private state (schedules, tokens).
	if (isTestMode(context)) return testFallbackStateDir();
	const helper = realStateDir();
	if (!helper) return null;
	try {
		return helper.ensure();
	} catch {
		return null;
	}
}

function homeDir(context = {}) {
	return context.testHome || os.homedir();
}

function nowMs(context = {}) {
	return typeof context.testNow === "number" ? context.testNow : Date.now();
}

function jobStore(context = {}) {
	if (context.testJobStore) return context.testJobStore;
	return require("../../commandJobStore.js");
}

/* ------------------------------------------------------------------ */
/* Exec plumbing (testExec fake or bounded real execFile)               */
/* ------------------------------------------------------------------ */

function execReal(cmd, args, opts = {}) {
	return new Promise(resolve => {
		execFile(
			cmd,
			args,
			{ timeout: opts.timeout || 30000, maxBuffer: 4 * 1024 * 1024, encoding: "utf8" },
			(error, stdout, stderr) => {
				if (error) {
					resolve({
						stdout: String(stdout || ""),
						stderr: String(stderr || error.message || ""),
						status: typeof error.code === "number" ? error.code : -1,
						error
					});
				} else {
					resolve({ stdout: String(stdout || ""), stderr: String(stderr || ""), status: 0 });
				}
			}
		);
	});
}

async function runCmd(context, cmd, args, opts = {}) {
	const fn = context.testExec;
	if (typeof fn === "function") {
		// A fake may throw (e.g. ENOENT for a missing CLI) or return the record.
		return await Promise.resolve(fn(cmd, args, opts));
	}
	return execReal(cmd, args, opts);
}

/* ------------------------------------------------------------------ */
/* Single-use confirmation tokens (in-memory under test mode)           */
/* ------------------------------------------------------------------ */

const localTokens = new Map();

function issueConfirmToken(context, payload) {
	if (context.testConfirmTokens && typeof context.testConfirmTokens.create === "function") {
		return context.testConfirmTokens.create(payload);
	}
	if (isTestMode(context)) {
		const token = crypto.randomBytes(16).toString("hex");
		localTokens.set(token, { payload, expiresAt: Date.now() + 5 * 60 * 1000 });
		return token;
	}
	const real = realConfirmTokens();
	if (!real) return null;
	return real.create(payload);
}

function redeemConfirmToken(context, token) {
	if (context.testConfirmTokens && typeof context.testConfirmTokens.consume === "function") {
		return context.testConfirmTokens.consume(token);
	}
	if (isTestMode(context)) {
		const key = String(token || "");
		const record = localTokens.get(key);
		localTokens.delete(key);
		if (!record || record.expiresAt < Date.now()) return null;
		return record.payload || {};
	}
	const real = realConfirmTokens();
	if (!real) return null;
	return real.consume(token);
}

/* ------------------------------------------------------------------ */
/* Schedule store                                                      */
/* ------------------------------------------------------------------ */

function schedulesPath(context) {
	const dir = stateDir(context);
	return dir ? path.join(dir, SCHEDULES_FILE) : null;
}

function runLogPath(context) {
	const dir = stateDir(context);
	return dir ? path.join(dir, RUN_LOG_FILE) : null;
}

function loadSchedules(context) {
	try {
		const file = schedulesPath(context);
		if (!file) return [];
		const raw = fs.readFileSync(file, "utf8");
		const data = JSON.parse(raw);
		if (Array.isArray(data)) return data;
	} catch {}
	return [];
}

function saveSchedules(context, list) {
	try {
		const file = schedulesPath(context);
		if (!file) return false;
		fs.mkdirSync(path.dirname(file), { recursive: true });
		fs.writeFileSync(file, JSON.stringify(list, null, 2), { mode: 0o600 });
		return true;
	} catch {
		return false;
	}
}

function appendRunLog(context, entry) {
	try {
		const file = runLogPath(context);
		if (!file) return false;
		let lines = [];
		try {
			const raw = fs.readFileSync(file, "utf8");
			lines = raw.split("\n").filter(line => line.trim() !== "");
		} catch {}
		lines.push(JSON.stringify(entry));
		if (lines.length > RUN_LOG_CAP) lines = lines.slice(lines.length - RUN_LOG_CAP);
		fs.mkdirSync(path.dirname(file), { recursive: true });
		fs.writeFileSync(file, lines.join("\n") + "\n", { mode: 0o600 });
		return true;
	} catch {
		return false;
	}
}

function readRunLog(context) {
	try {
		const file = runLogPath(context);
		if (!file) return [];
		const raw = fs.readFileSync(file, "utf8");
		return raw
			.split("\n")
			.filter(line => line.trim() !== "")
			.map(line => {
				try {
					return JSON.parse(line);
				} catch {
					return null;
				}
			})
			.filter(Boolean);
	} catch {
		return [];
	}
}

/* ------------------------------------------------------------------ */
/* `when` validation and next-run computation                           */
/* ------------------------------------------------------------------ */

function validateWhen(when) {
	if (!when || typeof when !== "object" || Array.isArray(when)) {
		return "when_required";
	}
	switch (when.type) {
		case "daily": {
			if (typeof when.at !== "string" || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(when.at)) {
				return "bad_daily_at";
			}
			if (when.days !== undefined) {
				if (!Array.isArray(when.days) || when.days.length === 0) return "bad_daily_days";
				for (const day of when.days) {
					if (!Object.prototype.hasOwnProperty.call(DAY_INDEX, String(day).toLowerCase())) {
						return "bad_daily_days";
					}
				}
			}
			return null;
		}
		case "hourly": {
			const minute = when.minute === undefined ? 0 : when.minute;
			if (!Number.isInteger(minute) || minute < 0 || minute > 59) return "bad_hourly_minute";
			return null;
		}
		case "intervalMinutes": {
			if (!Number.isInteger(when.n) || when.n < 5 || when.n > 1440) return "bad_interval_n";
			return null;
		}
		case "once": {
			if (typeof when.atISO !== "string" || Number.isNaN(Date.parse(when.atISO))) {
				return "bad_once_atISO";
			}
			return null;
		}
		default:
			return "bad_when_type";
	}
}

function computeNextRunAt(when, fromMs) {
	switch (when.type) {
		case "daily": {
			const [hh, mm] = when.at.split(":").map(Number);
			const days = (when.days || []).map(d => DAY_INDEX[String(d).toLowerCase()]);
			for (let offset = 0; offset < 8; offset++) {
				const candidate = new Date(fromMs + offset * DAY_MS);
				candidate.setHours(hh, mm, 0, 0);
				const candidateMs = candidate.getTime();
				if (candidateMs <= fromMs) continue;
				if (days.length > 0 && !days.includes(candidate.getDay())) continue;
				return candidateMs;
			}
			return fromMs + DAY_MS;
		}
		case "hourly": {
			const minute = when.minute === undefined ? 0 : when.minute;
			const candidate = new Date(fromMs);
			candidate.setSeconds(0, 0);
			candidate.setMinutes(minute);
			if (candidate.getTime() <= fromMs) candidate.setHours(candidate.getHours() + 1);
			return candidate.getTime();
		}
		case "intervalMinutes":
			return fromMs + when.n * 60 * 1000;
		case "once":
			return Date.parse(when.atISO);
		default:
			return null;
	}
}

/* ------------------------------------------------------------------ */
/* Scheduler tick                                                      */
/* ------------------------------------------------------------------ */

async function _tick(context = {}) {
	try {
		const now = nowMs(context);
		const schedules = loadSchedules(context);
		const store = jobStore(context);
		let dirty = false;
		for (const schedule of schedules) {
			try {
				if (!schedule || schedule.enabled === false) continue;
				if (typeof schedule.nextRunAt !== "number") continue;
				if (schedule.nextRunAt > now) continue;

				const overdueBy = now - schedule.nextRunAt;
				if (overdueBy > CATCHUP_SKIP_MS) {
					// Never burst-run a backlog: skip the missed run and move forward.
					const fresh = computeNextRunAt(schedule.when, now);
					schedule.nextRunAt = fresh;
					schedule.lastRunAt = now;
					schedule.lastStatus = "skipped_overdue";
					appendRunLog(context, {
						at: new Date(now).toISOString(),
						scheduleId: schedule.id,
						name: schedule.name,
						jobId: null,
						status: "skipped_overdue",
						exitCode: null
					});
					dirty = true;
					continue;
				}

				const payload = { command: schedule.command, timeoutMs: 30 * 60 * 1000 };
				if (schedule.cwd) payload.cwd = schedule.cwd;
				const started = await store.startCommandJob(context.config || {}, payload);
				const jobId =
					(started && (started.jobId || (started.meta && started.meta.jobId))) || null;
				schedule.lastRunAt = now;
				schedule.lastStatus = started && started.ok === false ? "failed_to_start" : "started";
				if (schedule.when && schedule.when.type === "once") {
					schedule.enabled = false;
					schedule.nextRunAt = null;
				} else {
					schedule.nextRunAt = computeNextRunAt(schedule.when, now);
				}
				appendRunLog(context, {
					at: new Date(now).toISOString(),
					scheduleId: schedule.id,
					name: schedule.name,
					jobId,
					status: schedule.lastStatus,
					exitCode: null
				});
				dirty = true;
			} catch {
				// A failing schedule must never break the others.
			}
		}
		if (dirty) saveSchedules(context, schedules);
	} catch {
		// The tick itself must never throw.
	}
}

function startTicker(context) {
	if (tickerStarted) return;
	tickerStarted = true;
	const timer = setInterval(() => {
		_tick(context).catch(() => {});
	}, TICK_MS);
	if (timer && typeof timer.unref === "function") timer.unref();
}

/* ------------------------------------------------------------------ */
/* Cleaners                                                            */
/* ------------------------------------------------------------------ */

const PARTIAL_EXTENSIONS = [".download", ".part", ".crdownload"];
const SCREENSHOT_PATTERN = /^Screen Shot .*\.png$/;

function olderThanDays(provided) {
	if (provided === undefined || provided === null) return 30;
	const n = Number(provided);
	if (!Number.isFinite(n) || n < 0) return null;
	return n;
}

function isPartialFileName(name) {
	const lower = name.toLowerCase();
	return PARTIAL_EXTENSIONS.some(ext => lower.endsWith(ext));
}

function previewDownloads(context, olderThan) {
	const dir = path.join(homeDir(context), "Downloads");
	const now = nowMs(context);
	const cutoffMs = olderThan * DAY_MS;
	let entries = [];
	try {
		entries = fs.readdirSync(dir, { withFileTypes: true });
	} catch {
		return { ok: true, scope: "downloads", items: [], count: 0, totalBytes: 0 };
	}
	const matched = [];
	for (const entry of entries) {
		try {
			if (!entry.isFile()) continue; // top-level files only, never recurse
			const name = entry.name;
			if (name.startsWith(".")) continue; // never touch dotfiles
			if (isPartialFileName(name)) continue; // never touch partial downloads
			const full = path.join(dir, name);
			const stat = fs.statSync(full);
			if (!stat.isFile()) continue;
			if (now - stat.mtimeMs < cutoffMs) continue;
			matched.push({
				path: full,
				bytes: stat.size,
				modifiedDaysAgo: Math.round(((now - stat.mtimeMs) / DAY_MS) * 10) / 10
			});
		} catch {}
	}
	const totalBytes = matched.reduce((sum, item) => sum + item.bytes, 0);
	return {
		ok: true,
		scope: "downloads",
		items: matched.slice(0, 200),
		count: matched.length,
		totalBytes
	};
}

function pad2(n) {
	return String(n).padStart(2, "0");
}

function previewScreenshots(context) {
	const dir = path.join(homeDir(context), "Desktop");
	let entries = [];
	try {
		entries = fs.readdirSync(dir, { withFileTypes: true });
	} catch {
		return { ok: true, scope: "screenshots", plan: [], count: 0, totalBytes: 0 };
	}
	const used = new Set();
	const plan = [];
	for (const entry of entries) {
		try {
			if (!entry.isFile()) continue;
			if (!SCREENSHOT_PATTERN.test(entry.name)) continue;
			const full = path.join(dir, entry.name);
			const stat = fs.statSync(full);
			if (!stat.isFile()) continue;
			const mtime = new Date(stat.mtimeMs);
			const base = `screenshot-${mtime.getFullYear()}${pad2(mtime.getMonth() + 1)}${pad2(mtime.getDate())}-${pad2(mtime.getHours())}${pad2(mtime.getMinutes())}${pad2(mtime.getSeconds())}`;
			let to = `${base}.png`;
			let suffix = 2;
			while (used.has(to) || fs.existsSync(path.join(dir, to))) {
				to = `${base}-${suffix}.png`;
				suffix++;
			}
			used.add(to);
			plan.push({ from: full, to: path.join(dir, to) });
		} catch {}
	}
	return { ok: true, scope: "screenshots", plan, count: plan.length, totalBytes: 0 };
}

async function previewTrash(context) {
	const dir = path.join(homeDir(context), ".Trash");
	let count = 0;
	try {
		count = fs.readdirSync(dir).length;
	} catch {}
	let totalBytes = 0;
	try {
		const result = await runCmd(context, "du", ["-sk", dir], { timeout: 30000 });
		const first = String(result.stdout || "").trim().split(/\s+/)[0];
		const kilobytes = parseInt(first, 10);
		if (Number.isFinite(kilobytes)) totalBytes = kilobytes * 1024;
	} catch {}
	return { ok: true, scope: "trash", count, totalBytes };
}

async function cleanPreview(context) {
	const { payload = {} } = context;
	const scope = payload.scope;
	if (scope !== "downloads" && scope !== "screenshots" && scope !== "trash") {
		return { ok: false, error: "bad_scope" };
	}
	const olderThan = olderThanDays(payload.olderThanDays);
	if (olderThan === null) return { ok: false, error: "bad_olderThanDays" };
	if (scope === "downloads") return previewDownloads(context, olderThan);
	if (scope === "screenshots") return previewScreenshots(context);
	return previewTrash(context);
}

function uniqueTrashName(trashDir, name) {
	const ext = path.extname(name);
	const base = path.basename(name, ext);
	let candidate = name;
	let n = 2;
	while (fs.existsSync(path.join(trashDir, candidate))) {
		candidate = `${base} ${n}${ext}`;
		n++;
	}
	return candidate;
}

async function applyDownloads(context, olderThan) {
	const home = homeDir(context);
	const trashDir = path.join(home, ".Trash");
	fs.mkdirSync(trashDir, { recursive: true });
	const preview = previewDownloadsAll(context, olderThan);
	let affected = 0;
	let bytesReclaimed = 0;
	const errors = [];
	for (const item of preview) {
		try {
			const target = path.join(trashDir, uniqueTrashName(trashDir, path.basename(item.path)));
			fs.renameSync(item.path, target); // recoverable move, never rm
			affected++;
			bytesReclaimed += item.bytes;
		} catch (error) {
			errors.push({ path: item.path, error: error?.message || String(error) });
		}
	}
	const result = { ok: true, scope: "downloads", affected, bytesReclaimed };
	if (errors.length > 0) result.errors = errors;
	return result;
}

function previewDownloadsAll(context, olderThan) {
	// Uncapped variant of the downloads preview for the confirmed apply pass.
	const dir = path.join(homeDir(context), "Downloads");
	const now = nowMs(context);
	const cutoffMs = olderThan * DAY_MS;
	let entries = [];
	try {
		entries = fs.readdirSync(dir, { withFileTypes: true });
	} catch {
		return [];
	}
	const matched = [];
	for (const entry of entries) {
		try {
			if (!entry.isFile()) continue;
			const name = entry.name;
			if (name.startsWith(".")) continue;
			if (isPartialFileName(name)) continue;
			const full = path.join(dir, name);
			const stat = fs.statSync(full);
			if (!stat.isFile()) continue;
			if (now - stat.mtimeMs < cutoffMs) continue;
			matched.push({ path: full, bytes: stat.size });
		} catch {}
	}
	return matched;
}

async function applyScreenshots(context) {
	const preview = previewScreenshots(context);
	let affected = 0;
	const errors = [];
	for (const step of preview.plan) {
		try {
			fs.renameSync(step.from, step.to);
			affected++;
		} catch (error) {
			errors.push({ from: step.from, error: error?.message || String(error) });
		}
	}
	const result = { ok: true, scope: "screenshots", affected, bytesReclaimed: 0 };
	if (errors.length > 0) result.errors = errors;
	return result;
}

async function applyTrash(context) {
	const home = homeDir(context);
	const trashDir = path.join(home, ".Trash");
	let before = { totalBytes: 0 };
	try {
		before = await previewTrash(context);
	} catch {}
	let affected = 0;
	const errors = [];
	let children = [];
	try {
		children = fs.readdirSync(trashDir);
	} catch {}
	for (const child of children) {
		try {
			// Contents only — the .Trash directory itself is never removed.
			fs.rmSync(path.join(trashDir, child), { recursive: true, force: true, maxRetries: 2 });
			affected++;
		} catch (error) {
			errors.push({ path: child, error: error?.message || String(error) });
		}
	}
	const result = { ok: true, scope: "trash", affected, bytesReclaimed: before.totalBytes || 0 };
	if (errors.length > 0) result.errors = errors;
	return result;
}

async function cleanApply(context) {
	const { payload = {} } = context;
	const scope = payload.scope;
	if (scope !== "downloads" && scope !== "screenshots" && scope !== "trash") {
		return { ok: false, error: "bad_scope" };
	}

	if (!payload.confirmToken) {
		const preview = await cleanPreview(context);
		if (!preview.ok) return preview;
		const olderThan = olderThanDays(payload.olderThanDays);
		const token = issueConfirmToken(context, {
			scope,
			olderThanDays: olderThan === null ? 30 : olderThan
		});
		if (!token) return { ok: false, error: "confirm_unavailable" };
		return {
			ok: false,
			needsConfirmation: true,
			confirmToken: token,
			summary: { count: preview.count || 0, totalBytes: preview.totalBytes || 0 }
		};
	}

	const bound = redeemConfirmToken(context, payload.confirmToken);
	if (!bound) return { ok: false, error: "bad_or_expired_token" };
	if (bound.scope !== scope) return { ok: false, error: "scope_mismatch" };
	const olderThan = olderThanDays(bound.olderThanDays);
	if (olderThan === null) return { ok: false, error: "bad_olderThanDays" };

	if (scope === "downloads") return applyDownloads(context, olderThan);
	if (scope === "screenshots") return applyScreenshots(context);
	return applyTrash(context);
}

/* ------------------------------------------------------------------ */
/* Shortcuts                                                           */
/* ------------------------------------------------------------------ */

async function macShortcut(context) {
	const { payload = {} } = context;
	const name = typeof payload.name === "string" ? payload.name.trim() : "";
	if (!name) return { ok: false, error: "missing_name" };
	const args = ["run", name];
	if (payload.input !== undefined && payload.input !== null) {
		args.splice(1, 0, "-i", String(payload.input));
	}
	let result;
	try {
		result = await runCmd(context, "shortcuts", args, { timeout: 120000 });
	} catch (error) {
		if (error && error.code === "ENOENT") {
			return { ok: false, error: "shortcuts_unavailable" };
		}
		return { ok: false, error: error?.message || String(error) };
	}
	if (result && result.error && result.error.code === "ENOENT") {
		return { ok: false, error: "shortcuts_unavailable" };
	}
	const stdout = String((result && result.stdout) || "").slice(0, 20000);
	return { ok: true, name, stdout, exitCode: result ? result.status : 0 };
}

async function macShortcutList(context) {
	let result;
	try {
		result = await runCmd(context, "shortcuts", ["list"], { timeout: 30000 });
	} catch (error) {
		if (error && error.code === "ENOENT") {
			return { ok: false, error: "shortcuts_unavailable" };
		}
		return { ok: false, error: error?.message || String(error) };
	}
	if (result && result.error && result.error.code === "ENOENT") {
		return { ok: false, error: "shortcuts_unavailable" };
	}
	const names = String((result && result.stdout) || "")
		.split(/\r?\n/)
		.map(line => line.trim())
		.filter(Boolean)
		.map(name => ({ name }));
	return { ok: true, shortcuts: names };
}

/* ------------------------------------------------------------------ */
/* Builder                                                             */
/* ------------------------------------------------------------------ */

function buildMacAutoActions(context = {}) {
	if (!isTestMode(context)) {
		startTicker(context);
	}

	async function macScheduleAdd() {
		const { payload = {} } = context;
		try {
			if (!stateDir(context)) return { ok: false, error: "state_unavailable" };
			const name = typeof payload.name === "string" ? payload.name.trim() : "";
			const command = typeof payload.command === "string" ? payload.command.trim() : "";
			if (!name) return { ok: false, error: "missing_name" };
			if (!command) return { ok: false, error: "missing_command" };
			const invalid = validateWhen(payload.when);
			if (invalid) return { ok: false, error: invalid };
			const enabled = payload.enabled === undefined ? true : Boolean(payload.enabled);
			const nextRunAt = computeNextRunAt(payload.when, nowMs(context));
			const entry = {
				id: crypto.randomUUID(),
				name,
				when: payload.when,
				command,
				cwd: typeof payload.cwd === "string" ? payload.cwd : null,
				enabled,
				nextRunAt,
				lastRunAt: null,
				lastStatus: null,
				createdAt: new Date(nowMs(context)).toISOString()
			};
			const schedules = loadSchedules(context);
			schedules.push(entry);
			if (!saveSchedules(context, schedules)) {
				return { ok: false, error: "save_failed" };
			}
			return { ok: true, id: entry.id, name: entry.name, nextRunAt: entry.nextRunAt };
		} catch (error) {
			return { ok: false, error: error?.message || String(error) };
		}
	}

	async function macScheduleList() {
		try {
			if (!stateDir(context)) return { ok: false, error: "state_unavailable" };
			const schedules = loadSchedules(context);
			return {
				ok: true,
				schedules: schedules.map(s => ({
					id: s.id,
					name: s.name,
					when: s.when,
					command: s.command,
					enabled: s.enabled,
					nextRunAt: s.nextRunAt,
					lastRunAt: s.lastRunAt,
					lastStatus: s.lastStatus
				}))
			};
		} catch (error) {
			return { ok: false, error: error?.message || String(error) };
		}
	}

	async function macScheduleRemove() {
		const { payload = {} } = context;
		try {
			if (!stateDir(context)) return { ok: false, error: "state_unavailable" };
			const id = String(payload.id || "");
			if (!id) return { ok: false, error: "missing_id" };
			const schedules = loadSchedules(context);
			const kept = schedules.filter(s => s.id !== id);
			if (kept.length === schedules.length) return { ok: false, error: "not_found" };
			if (!saveSchedules(context, kept)) return { ok: false, error: "save_failed" };
			return { ok: true, removed: id };
		} catch (error) {
			return { ok: false, error: error?.message || String(error) };
		}
	}

	async function macScheduleLog() {
		const { payload = {} } = context;
		try {
			if (!stateDir(context)) return { ok: false, error: "state_unavailable" };
			let limit = payload.limit === undefined ? 30 : Number(payload.limit);
			if (!Number.isFinite(limit) || limit <= 0) limit = 30;
			limit = Math.min(Math.floor(limit), 200);
			const id = payload.id ? String(payload.id) : null;
			const entries = readRunLog(context)
				.filter(entry => !id || entry.scheduleId === id)
				.slice(-limit)
				.reverse()
				.map(entry => ({
					at: entry.at,
					scheduleId: entry.scheduleId,
					name: entry.name,
					jobId: entry.jobId,
					status: entry.status,
					exitCode: entry.exitCode
				}));
			return { ok: true, entries };
		} catch (error) {
			return { ok: false, error: error?.message || String(error) };
		}
	}

	return {
		macScheduleAdd,
		macScheduleList,
		macScheduleRemove,
		macScheduleLog,
		macCleanPreview: () => cleanPreview(context),
		macCleanApply: () => cleanApply(context),
		macShortcut: () => macShortcut(context),
		macShortcutList: () => macShortcutList(context)
	};
}

module.exports = {
	buildMacAutoActions,
	_tick,
	_computeNextRunAt: computeNextRunAt,
	_validateWhen: validateWhen,
	_stateDir: stateDir,
	_isTestMode: isTestMode
};
