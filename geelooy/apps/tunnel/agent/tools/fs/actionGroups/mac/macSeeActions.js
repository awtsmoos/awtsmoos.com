// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFile } = require("node:child_process");

/**
 * Lazily loads the shared single-use confirmation token helper.
 * Lazy (not top-level) because the helper's own stateDir currently resolves a
 * bad relative path; a top-level require would break the whole action group at
 * load. Returns null when unloadable so the caller can fail gracefully.
 */
function realConfirmTokens() {
	try {
		return require("./confirmTokens.js");
	} catch {
		return null;
	}
}

/**
 * @file "SEE THE MAC + CAPTURE" companion actions (feature group B).
 * @description
 * The Awtsmoos opens the Mac's eyes for the companion: screenshots, vitals,
 * the day's work in the repository, and a capture inbox for photos, notes,
 * and voice. Transcription happens in the chat layer; the tunnel only ever
 * receives a transcript and executes a voice *command* with explicit
 * confirmation through a single-use token.
 *
 * Every handler never throws: failures return `{ ok: false, error: "..." }`.
 * Every child_process call is bounded with a timeout (15-60s).
 * Testability: `context.testExec` (a fake `(cmd, args, opts) -> { stdout, stderr, status }`)
 * replaces real child_process whenever present; `context.testHome` /
 * `context.testTmp` override the home and tmp dir resolution;
 * `context.testScreenshotBytes` short-circuits screencapture in tests;
 * `context.testConfirmTokens` / `context.testJobStore` override the voice-command
 * two-step dependencies. No test may touch real system state or real user files.
 */

const GIB = 1024 * 1024 * 1024;
const SCREENSHOT_MAX_BYTES = 6 * 1024 * 1024;
const PHOTO_MAX_BYTES = 25 * 1024 * 1024;
const NOTE_MAX_CHARS = 20000;

const PHOTO_EXT_BY_MIME = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/heic": "heic",
	"image/gif": "gif",
	"image/webp": "webp"
};

/**
 * Builds the seven group-B actions. `context = { config, payload, ...test overrides }`.
 * Each handler is `async () => {...}` and reads `const { config, payload = {} } = context;`.
 */
function buildMacSeeActions(context = {}) {
	return {
		macScreenshot: async () => macScreenshot(context),
		macVitals: async () => macVitals(context),
		macToday: async () => macToday(context),
		macFilePhoto: async () => macFilePhoto(context),
		macNoteAdd: async () => macNoteAdd(context),
		macNoteSearch: async () => macNoteSearch(context),
		macVoiceFile: async () => macVoiceFile(context)
	};
}

/* ------------------------------------------------------------------ */
/* shared helpers                                                      */
/* ------------------------------------------------------------------ */

function homeDir(context) {
	return context.testHome || os.homedir();
}

function tmpBase(context) {
	return context.testTmp || os.tmpdir();
}

function fail(error, detail) {
	const out = { ok: false, error };
	if (detail !== undefined && detail !== "") out.detail = String(detail).slice(0, 300);
	return out;
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

function round2(n) {
	return Math.round(n * 100) / 100;
}

function firstInt(text, re) {
	const m = String(text).match(re);
	if (!m) return null;
	const n = parseInt(m[1], 10);
	return Number.isFinite(n) ? n : null;
}

function pad2(n) {
	return String(n).padStart(2, "0");
}

function fmtDay(d) {
	return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
}

function fmtStamp(d) {
	return pad2(d.getHours()) + pad2(d.getMinutes()) + pad2(d.getSeconds());
}

function fmtDayTime(d) {
	return fmtDay(d) + " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes());
}

function notesFilePath(context) {
	return path.join(homeDir(context), "Awtsmoos-Notes", "notes.md");
}

/* ------------------------------------------------------------------ */
/* 1. macScreenshot                                                    */
/* ------------------------------------------------------------------ */

async function macScreenshot(context) {
	const { payload = {} } = context;
	const format = payload.format === undefined || payload.format === "jpg" ? "jpg"
		: payload.format === "png" ? "png"
		: null;
	if (!format) return fail("unsupported_format", "format must be png or jpg");
	const maxWidth = payload.maxWidth === undefined ? 1600 : Number(payload.maxWidth);
	if (!Number.isFinite(maxWidth) || maxWidth < 200 || maxWidth > 8000) return fail("bad_max_width");
	const mimeType = format === "png" ? "image/png" : "image/jpeg";

	let dir = null;
	try {
		dir = await fs.promises.mkdtemp(path.join(tmpBase(context), "awtsmoos-shot-"));
		const tmpfile = path.join(dir, "shot." + format);
		if (context.testScreenshotBytes !== undefined && context.testScreenshotBytes !== null) {
			const buf = Buffer.isBuffer(context.testScreenshotBytes)
				? context.testScreenshotBytes
				: Buffer.from(String(context.testScreenshotBytes), "base64");
			await fs.promises.writeFile(tmpfile, buf);
		} else {
			const shot = await runExec(context, "screencapture", ["-x", "-t", format, tmpfile], { timeoutMs: 30000 });
			if (shot.status !== 0) return fail("screenshot_failed", shot.stderr);
		}
		// sips -Z only shrinks; it never enlarges.
		const resized = await runExec(context, "sips", ["-Z", String(Math.round(maxWidth)), tmpfile], { timeoutMs: 30000 });
		if (resized.status !== 0) return fail("resize_failed", resized.stderr);
		const bytes = (await fs.promises.stat(tmpfile)).size;
		if (bytes > SCREENSHOT_MAX_BYTES) return { ok: false, error: "screenshot_too_large", bytes };
		const data = await fs.promises.readFile(tmpfile);
		return { ok: true, mimeType, base64: data.toString("base64"), bytes };
	} catch (error) {
		return fail("screenshot_failed", error && error.message ? error.message : error);
	} finally {
		if (dir) await fs.promises.rm(dir, { recursive: true, force: true }).catch(() => {});
	}
}

/* ------------------------------------------------------------------ */
/* 2. macVitals                                                        */
/* ------------------------------------------------------------------ */

function parseBattery(text) {
	const percent = firstInt(text, /(\d+)%/);
	if (percent === null) return null; // no parseable reading: treat as a failed probe
	const m = String(text).match(/discharging|charging|charged/i);
	return { percent, state: m ? m[0].toLowerCase() : "unknown" };
}

function parseDisk(text) {
	const lines = String(text).trim().split("\n");
	if (lines.length < 2) return null;
	const f = lines[1].trim().split(/\s+/);
	const total = parseInt(f[1], 10);
	const used = parseInt(f[2], 10);
	const avail = parseInt(f[3], 10);
	if (![total, used, avail].every(Number.isFinite) || total <= 0) return null;
	return {
		totalGb: round2(total / 1048576),
		freeGb: round2(avail / 1048576),
		usedPercent: Math.round((used / total) * 100)
	};
}

function parseUpSeconds(seg) {
	let seconds = 0;
	let ok = false;
	const days = String(seg).match(/(\d+)\s+days?/);
	if (days) {
		seconds += parseInt(days[1], 10) * 86400;
		ok = true;
	}
	const hm = String(seg).match(/(\d+):(\d+)/);
	if (hm) {
		seconds += parseInt(hm[1], 10) * 3600 + parseInt(hm[2], 10) * 60;
		ok = true;
	} else {
		const hrs = String(seg).match(/(\d+)\s+hrs?/);
		if (hrs) {
			seconds += parseInt(hrs[1], 10) * 3600;
			ok = true;
		}
	}
	const mins = String(seg).match(/(\d+)\s+mins?/);
	if (mins) {
		seconds += parseInt(mins[1], 10) * 60;
		ok = true;
	}
	return ok ? seconds : null;
}

function parseUptime(text) {
	const loads = String(text).match(/load averages?:\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
	if (!loads) return null;
	const upm = String(text).match(/\bup\s+(.+?),\s+\d+\s+user/i);
	const pretty = upm ? "up " + upm[1].trim().replace(/\s+/g, " ") : "";
	return {
		seconds: upm ? parseUpSeconds(upm[1]) : null,
		pretty,
		load1: parseFloat(loads[1]),
		load5: parseFloat(loads[2]),
		load15: parseFloat(loads[3])
	};
}

function buildMemory(totalBytes, vmstatText) {
	const totalGb = totalBytes ? round2(totalBytes / GIB) : null;
	if (!totalBytes || !vmstatText) return { totalGb, usedGb: null };
	const pageSize = firstInt(vmstatText, /page size of (\d+) bytes/i) || 16384;
	const free = firstInt(vmstatText, /Pages free:\s*(\d+)/i) || 0;
	const inactive = firstInt(vmstatText, /Pages inactive:\s*(\d+)/i) || 0;
	const speculative = firstInt(vmstatText, /Pages speculative:\s*(\d+)/i) || 0;
	const totalPages = Math.floor(totalBytes / pageSize);
	const usedPages = Math.max(0, totalPages - free - inactive - speculative);
	return { totalGb, usedGb: round2((usedPages * pageSize) / GIB) };
}

async function macVitals(context) {
	const degraded = [];
	async function probe(name, cmd, args, parse) {
		const r = await runExec(context, cmd, args, { timeoutMs: 15000 });
		if (r.status !== 0 || !r.stdout.trim()) {
			degraded.push(name);
			return null;
		}
		try {
			const v = parse(r.stdout);
			if (v === null || v === undefined) degraded.push(name);
			return v;
		} catch {
			degraded.push(name);
			return null;
		}
	}
	const [battery, disk, memTotalBytes, vmstatText, up] = await Promise.all([
		probe("battery", "pmset", ["-g", "batt"], parseBattery),
		probe("disk", "df", ["-k", "/"], parseDisk),
		probe("memory_total", "sysctl", ["-n", "hw.memsize"], text => {
			const n = parseInt(String(text).trim(), 10);
			return Number.isFinite(n) && n > 0 ? n : null;
		}),
		probe("vm_stat", "vm_stat", [], text => text),
		probe("uptime", "uptime", [], parseUptime)
	]);
	const out = {
		ok: true,
		battery: battery || { percent: null, state: "unknown" },
		disk: disk || { totalGb: null, freeGb: null, usedPercent: null },
		memory: buildMemory(memTotalBytes, vmstatText),
		cpu: up ? { load1: up.load1, load5: up.load5, load15: up.load15 } : { load1: null, load5: null, load15: null },
		uptime: up ? { seconds: up.seconds, pretty: up.pretty } : { seconds: null, pretty: "" }
	};
	if (degraded.length) out.degraded = degraded;
	return out;
}

/* ------------------------------------------------------------------ */
/* 3. macToday                                                         */
/* ------------------------------------------------------------------ */

async function macToday(context) {
	const { config } = context;
	const root = (config && config.root) || "";
	if (!root || !fs.existsSync(path.join(root, ".git"))) return fail("not_a_git_repo");
	async function git(args) {
		const r = await runExec(context, "git", args, { timeoutMs: 20000, cwd: root });
		return r.status === 0 ? r.stdout : "";
	}
	const branch = (await git(["rev-parse", "--abbrev-ref", "HEAD"])).trim() || "unknown";
	const head = (await git(["rev-parse", "--short", "HEAD"])).trim() || "unknown";
	const statusLines = (await git(["status", "--short"]))
		.split("\n")
		.map(line => line.trimEnd())
		.filter(Boolean)
		.slice(0, 100);
	const commitsToday = (await git(["log", "--since=midnight", "--format=%h%x09%an%x09%s", "-n", "30"]))
		.split("\n")
		.filter(Boolean)
		.slice(0, 30)
		.map(line => {
			const parts = line.split("\t");
			return { sha: parts[0] || "", author: parts[1] || "", subject: parts.slice(2).join("\t") };
		});
	const diffStat = (await git(["diff", "--stat", "HEAD"]))
		.split("\n")
		.slice(0, 50)
		.join("\n")
		.trimEnd();
	const authors = [...new Set(commitsToday.map(c => c.author).filter(Boolean))];
	const fileWord = statusLines.length === 1 ? "file" : "files";
	const commitWord = commitsToday.length === 1 ? "commit" : "commits";
	const byline = authors.length ? " by " + authors.join(", ") : "";
	const summary = "On " + branch + " @ " + head + ": " +
		statusLines.length + " " + fileWord + " changed, " +
		commitsToday.length + " " + commitWord + " today" + byline + ".";
	return { ok: true, branch, head, statusLines, commitsToday, diffStat, summary };
}

/* ------------------------------------------------------------------ */
/* 4. macFilePhoto                                                     */
/* ------------------------------------------------------------------ */

function sanitizePhotoName(name) {
	if (name === undefined || name === null) return "";
	const clean = String(name)
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9-_]/g, "")
		.replace(/-+/g, "-")
		.replace(/^[-_]+|[-_]+$/g, "")
		.slice(0, 60);
	return clean;
}

async function macFilePhoto(context) {
	const { payload = {} } = context;
	const raw = payload.base64;
	if (typeof raw !== "string" || !raw.trim()) return fail("missing_base64");
	let compact = raw.trim().replace(/^data:[^;]+;base64,/, "").replace(/\s+/g, "");
	if (!/^[A-Za-z0-9+/]*={0,2}$/.test(compact) || compact.length % 4 !== 0) return fail("bad_base64");
	let buf;
	try {
		buf = Buffer.from(compact, "base64");
	} catch {
		return fail("bad_base64");
	}
	if (!buf.length) return fail("bad_base64");
	if (buf.length > PHOTO_MAX_BYTES) return { ok: false, error: "photo_too_large", bytes: buf.length };
	const mimeType = payload.mimeType || "image/jpeg";
	const ext = PHOTO_EXT_BY_MIME[mimeType];
	if (!ext) return fail("unsupported_mime_type", "mimeType must be one of " + Object.keys(PHOTO_EXT_BY_MIME).join(", "));
	const now = new Date();
	const dir = path.join(homeDir(context), "Pictures", "Awtsmoos-Inbox", fmtDay(now));
	try {
		await fs.promises.mkdir(dir, { recursive: true, mode: 0o700 });
	} catch (error) {
		return fail("mkdir_failed", error && error.message ? error.message : error);
	}
	const stamp = fmtStamp(now);
	const nice = sanitizePhotoName(payload.name);
	const base = nice ? stamp + "-" + nice : stamp;
	let file = path.join(dir, base + "." + ext);
	let n = 2;
	while (fs.existsSync(file)) {
		file = path.join(dir, base + "-" + n + "." + ext);
		n += 1;
		if (n > 1000) return fail("too_many_collisions");
	}
	try {
		await fs.promises.writeFile(file, buf, { mode: 0o600 });
	} catch (error) {
		return fail("photo_write_failed", error && error.message ? error.message : error);
	}
	return { ok: true, path: file, bytes: buf.length };
}

/* ------------------------------------------------------------------ */
/* 5 + 6. macNoteAdd / macNoteSearch                                    */
/* ------------------------------------------------------------------ */

async function appendNote(context, text) {
	if (typeof text !== "string" || !text.trim()) return fail("missing_text");
	if (text.length > NOTE_MAX_CHARS) return fail("text_too_long", "cap is " + NOTE_MAX_CHARS + " chars");
	try {
		await fs.promises.mkdir(path.dirname(notesFilePath(context)), { recursive: true, mode: 0o700 });
		const entry = "\n## " + fmtDayTime(new Date()) + "\n" + text.trimEnd() + "\n";
		await fs.promises.appendFile(notesFilePath(context), entry, { mode: 0o600 });
		return { ok: true, path: notesFilePath(context), appendedChars: entry.length };
	} catch (error) {
		return fail("note_write_failed", error && error.message ? error.message : error);
	}
}

async function macNoteAdd(context) {
	const { payload = {} } = context;
	return appendNote(context, payload.text);
}

async function macNoteSearch(context) {
	const { payload = {} } = context;
	const query = String(payload.query || "").trim();
	if (!query) return fail("missing_query");
	const wanted = Number(payload.limit);
	const limit = Math.min(Math.max(Number.isFinite(wanted) ? Math.floor(wanted) : 20, 1), 100);
	let raw;
	try {
		raw = await fs.promises.readFile(notesFilePath(context), "utf8");
	} catch {
		return { ok: true, matches: [] };
	}
	const q = query.toLowerCase();
	const matches = [];
	let current = "";
	raw.split("\n").forEach((line, idx) => {
		const hm = line.match(/^##\s+(.+?)\s*$/);
		if (hm) {
			current = hm[1];
		} else if (line.toLowerCase().includes(q)) {
			matches.push({ date: current, line: idx + 1, text: line.slice(0, 500) });
		}
	});
	return { ok: true, matches: matches.slice(0, limit) };
}

/* ------------------------------------------------------------------ */
/* 7. macVoiceFile                                                     */
/* ------------------------------------------------------------------ */

async function macVoiceFile(context) {
	const { config, payload = {} } = context;
	const transcript = String(payload.transcript || "").trim();
	if (!transcript) return fail("missing_transcript");
	const mode = payload.mode === "command" ? "command" : "note";
	if (mode === "note") {
		// Voice notes land in the same notes.md as typed notes, prefixed with a mic mark.
		return appendNote(context, "\uD83C\uDFA8 " + transcript);
	}
	// Command mode: two-step. Transcription happens in the chat layer; the
	// tunnel only executes with an explicit, single-use confirmation token.
	const tokens = context.testConfirmTokens || realConfirmTokens();
	if (!tokens) return fail("confirm_tokens_unavailable", "confirmTokens helper could not be loaded");
	if (!payload.confirmToken) {
		return {
			ok: false,
			needsConfirmation: true,
			confirmToken: tokens.create({ command: transcript }),
			preview: transcript.slice(0, 500)
		};
	}
	const bound = tokens.consume(payload.confirmToken);
	if (!bound || bound.command !== transcript) return fail("bad_or_expired_token");
	const store = context.testJobStore || require("../../commandJobStore.js");
	try {
		const started = await store.startCommandJob(config, { command: transcript });
		if (started && started.ok === false) return started;
		return { ok: true, jobId: started && started.jobId, result: started };
	} catch (error) {
		return fail("command_start_failed", error && error.message ? error.message : error);
	}
}

module.exports = { buildMacSeeActions };
