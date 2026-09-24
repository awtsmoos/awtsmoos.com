// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { buildMacSeeActions } = require("../tools/fs/actionGroups/mac/macSeeActions.js");

/**
 * @file Tests for group B ("SEE THE MAC + CAPTURE") companion actions.
 * @description
 * Plain node script: node:assert/strict, async IIFE, JSON summary on success.
 * Everything runs against fake exec (context.testExec), a temp home
 * (context.testHome), a temp tmp dir (context.testTmp), fake confirm tokens
 * and a fake command job store. No test touches real system state or real
 * user files.
 */

const passed = [];
async function t(name, fn) {
	await fn();
	passed.push(name);
}

function makeCtx(overrides = {}) {
	const ctx = {
		config: { root: overrides.root || "" },
		payload: {},
		testHome: overrides.testHome,
		testTmp: overrides.testTmp,
		testExec: overrides.testExec,
		testScreenshotBytes: overrides.testScreenshotBytes,
		testConfirmTokens: overrides.testConfirmTokens,
		testJobStore: overrides.testJobStore
	};
	if (overrides.payload !== undefined) ctx.payload = overrides.payload;
	if (overrides.testScreenshotBytes === undefined) delete ctx.testScreenshotBytes;
	return ctx;
}

function execFrom(table) {
	return async (cmd, args) => {
		const key = cmd + " " + args.join(" ");
		for (const [re, out] of table) {
			if (re.test(key)) return typeof out === "function" ? out(cmd, args) : out;
		}
		return { stdout: "", stderr: "unexpected command: " + key, status: 1 };
	};
}

function fakeTokens() {
	const m = new Map();
	let n = 0;
	return {
		create(payload) {
			n += 1;
			const token = "tok-" + n + "-" + Date.now();
			m.set(token, payload);
			return token;
		},
		consume(token) {
			const p = m.get(String(token)) || null;
			m.delete(String(token));
			return p;
		}
	};
}

const PMSET_OUT = "Now drawing from 'Battery Power'\n -InternalBattery-0 (id=6094945)\t82%; discharging; 3:12 remaining present: true\n";
const DF_OUT = "Filesystem   1024-blocks      Used Available Capacity iused      ifree %iused  Mounted on\n/dev/disk3s1s1   488354584 419241716  62548068    88% 1466672 4883545840    0%   /\n";
const SYSCTL_OUT = "17179869184\n";
const VMSTAT_OUT = [
	"Mach Virtual Memory Statistics: (page size of 16384 bytes)",
	"Pages free:                              100000.",
	"Pages active:                            234567.",
	"Pages inactive:                          200000.",
	"Pages speculative:                        50000.",
	"Pages wired down:                        567890.",
	""
].join("\n");
const UPTIME_OUT = " 9:41PM  up 2 days,  5:13, 1 user, load averages: 2.10 1.95 1.80\n";

function vitalsExec(overrides = {}) {
	return execFrom([
		[/^pmset /, overrides.pmset !== undefined ? overrides.pmset : { stdout: PMSET_OUT, stderr: "", status: 0 }],
		[/^df /, overrides.df !== undefined ? overrides.df : { stdout: DF_OUT, stderr: "", status: 0 }],
		[/^sysctl /, overrides.sysctl !== undefined ? overrides.sysctl : { stdout: SYSCTL_OUT, stderr: "", status: 0 }],
		[/^vm_stat /, overrides.vmstat !== undefined ? overrides.vmstat : { stdout: VMSTAT_OUT, stderr: "", status: 0 }],
		[/^uptime /, overrides.uptime !== undefined ? overrides.uptime : { stdout: UPTIME_OUT, stderr: "", status: 0 }]
	]);
}

(async () => {
	const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "macsee-test-"));
	const testHome = path.join(tmpRoot, "home");
	const testTmp = path.join(tmpRoot, "tmp");
	fs.mkdirSync(testHome, { recursive: true });
	fs.mkdirSync(testTmp, { recursive: true });
	const base = extra => ({ testHome, testTmp, ...(extra || {}) });

	// 1. builder exposes all seven action names
	await t("exposes seven actions", async () => {
		const actions = buildMacSeeActions(makeCtx(base()));
		assert.deepEqual(Object.keys(actions).sort(), [
			"macFilePhoto",
			"macNoteAdd",
			"macNoteSearch",
			"macScreenshot",
			"macToday",
			"macVitals",
			"macVoiceFile"
		]);
	});

	// 2. macScreenshot: base64 + temp cleanup
	await t("screenshot returns base64 and cleans temp", async () => {
		const bytes = Buffer.from("FAKE-JPEG-BYTES-0123456789");
		const actions = buildMacSeeActions(makeCtx(base({
			testExec: async () => ({ stdout: "", stderr: "", status: 0 }),
			testScreenshotBytes: bytes
		})));
		const before = fs.readdirSync(testTmp);
		const r = await actions.macScreenshot();
		assert.equal(r.ok, true);
		assert.equal(r.mimeType, "image/jpeg");
		assert.equal(r.bytes, bytes.length);
		assert.deepEqual(Buffer.from(r.base64, "base64"), bytes);
		const after = fs.readdirSync(testTmp).filter(n => n.startsWith("awtsmoos-shot-"));
		assert.deepEqual(after, [], "temp screenshot dir must be removed");
		assert.deepEqual(fs.readdirSync(testTmp).sort(), before.sort());
	});

	await t("screenshot png mime + too-large guard cleans temp", async () => {
		const big = Buffer.alloc(6 * 1024 * 1024 + 1, 7);
		const actions = buildMacSeeActions(makeCtx(base({
			testExec: async () => ({ stdout: "", stderr: "", status: 0 }),
			testScreenshotBytes: big,
			payload: { format: "png" }
		})));
		const r = await actions.macScreenshot();
		assert.equal(r.ok, false);
		assert.equal(r.error, "screenshot_too_large");
		assert.equal(r.bytes, big.length);
		assert.deepEqual(fs.readdirSync(testTmp).filter(n => n.startsWith("awtsmoos-shot-")), []);
	});

	await t("screenshot rejects bad format/width", async () => {
		const mk = payload => buildMacSeeActions(makeCtx(base({ payload })));
		assert.equal((await mk({ format: "gif" }).macScreenshot()).error, "unsupported_format");
		assert.equal((await mk({ maxWidth: 50 }).macScreenshot()).error, "bad_max_width");
	});

	// 3. macVitals parsing incl. degraded path
	await t("vitals parses all probes", async () => {
		const actions = buildMacSeeActions(makeCtx(base({ testExec: vitalsExec() })));
		const r = await actions.macVitals();
		assert.equal(r.ok, true);
		assert.deepEqual(r.battery, { percent: 82, state: "discharging" });
		assert.equal(r.disk.totalGb, 465.73);
		assert.equal(r.disk.freeGb, 59.65);
		assert.equal(r.disk.usedPercent, 86);
		assert.equal(r.memory.totalGb, 16);
		// totalPages = 17179869184/16384 = 1048576; used = 1048576-100000-200000-50000 = 698576 pages
		assert.equal(r.memory.usedGb, 10.66);
		assert.deepEqual(r.cpu, { load1: 2.1, load5: 1.95, load15: 1.8 });
		assert.equal(r.uptime.seconds, 2 * 86400 + 5 * 3600 + 13 * 60);
		assert.equal(r.uptime.pretty, "up 2 days, 5:13");
		assert.equal(r.degraded, undefined);
	});

	await t("vitals degrades gracefully when one probe fails", async () => {
		const actions = buildMacSeeActions(makeCtx(base({
			testExec: vitalsExec({ vmstat: { stdout: "", stderr: "boom", status: 1 } })
		})));
		const r = await actions.macVitals();
		assert.equal(r.ok, true);
		assert.deepEqual(r.degraded, ["vm_stat"]);
		assert.equal(r.memory.totalGb, 16);
		assert.equal(r.memory.usedGb, null);
		assert.equal(r.battery.percent, 82);
	});

	await t("vitals tolerates garbage probe output", async () => {
		const actions = buildMacSeeActions(makeCtx(base({
			testExec: vitalsExec({
				pmset: { stdout: "weird output\n", stderr: "", status: 0 },
				df: { stdout: "nope\n", stderr: "", status: 0 }
			})
		})));
		const r = await actions.macVitals();
		assert.equal(r.ok, true);
		assert.deepEqual(r.battery, { percent: null, state: "unknown" });
		assert.deepEqual(r.disk, { totalGb: null, freeGb: null, usedPercent: null });
		assert.deepEqual(r.degraded.sort(), ["battery", "disk"]);
	});

	// 4. macToday summary building + not_a_git_repo
	await t("today builds summary from fake git", async () => {
		const repoRoot = path.join(tmpRoot, "repo");
		fs.mkdirSync(path.join(repoRoot, ".git"), { recursive: true });
		const gitExec = execFrom([
			[/rev-parse --abbrev-ref/, { stdout: "main\n", stderr: "", status: 0 }],
			[/rev-parse --short/, { stdout: "abc1234\n", stderr: "", status: 0 }],
			[/status --short/, { stdout: " M foo.js\n?? bar.js\n", stderr: "", status: 0 }],
			[/^git log /, { stdout: "abc1234\talice\tfirst thing\ndef5678\tbob\tsecond thing\n", stderr: "", status: 0 }],
			[/diff --stat/, { stdout: " foo.js | 2 +-\n 1 file changed, 1 insertion(+), 1 deletion(-)\n", stderr: "", status: 0 }]
		]);
		const actions = buildMacSeeActions(makeCtx(base({ root: repoRoot, testExec: gitExec })));
		const r = await actions.macToday();
		assert.equal(r.ok, true);
		assert.equal(r.branch, "main");
		assert.equal(r.head, "abc1234");
		assert.equal(r.statusLines.length, 2);
		assert.equal(r.commitsToday.length, 2);
		assert.deepEqual(r.commitsToday[0], { sha: "abc1234", author: "alice", subject: "first thing" });
		assert.ok(r.diffStat.includes("1 file changed"));
		assert.ok(r.summary.includes("2 files changed"));
		assert.ok(r.summary.includes("2 commits today"));
		assert.ok(r.summary.includes("alice, bob"));
		assert.ok(r.summary.includes("main @ abc1234"));
	});

	await t("today rejects non-git root", async () => {
		const actions = buildMacSeeActions(makeCtx(base({ root: path.join(tmpRoot, "nogit") })));
		const r = await actions.macToday();
		assert.equal(r.ok, false);
		assert.equal(r.error, "not_a_git_repo");
	});

	// 5. macFilePhoto naming/sanitization/collision/mime rejection
	await t("file photo writes sanitized name with 0600", async () => {
		const data = Buffer.from("imagedata-0123456789").toString("base64");
		const actions = buildMacSeeActions(makeCtx(base({
			payload: { base64: data, mimeType: "image/png", name: "My Photo! 2024" }
		})));
		const r = await actions.macFilePhoto();
		assert.equal(r.ok, true);
		assert.equal(r.bytes, Buffer.from("imagedata-0123456789").length);
		const today = new Date();
		const day = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
		const wantDir = path.join(testHome, "Pictures", "Awtsmoos-Inbox", day);
		assert.ok(r.path.startsWith(wantDir + path.sep));
		assert.ok(r.path.endsWith("-my-photo-2024.png"));
		assert.equal(fs.statSync(r.path).mode & 0o777, 0o600);
		assert.deepEqual(fs.readFileSync(r.path), Buffer.from("imagedata-0123456789"));
	});

	await t("file photo collides with -2 suffix", async () => {
		const data = Buffer.from("x").toString("base64");
		const mk = () => buildMacSeeActions(makeCtx(base({ payload: { base64: data, name: "dup" } })));
		const r1 = await mk().macFilePhoto();
		const r2 = await mk().macFilePhoto();
		assert.equal(r1.ok, true);
		assert.equal(r2.ok, true);
		assert.notEqual(r1.path, r2.path);
		assert.ok(r2.path.endsWith("-dup-2.jpg"));
	});

	await t("file photo rejects bad mime and bad base64", async () => {
		const good = Buffer.from("img").toString("base64");
		const badMime = buildMacSeeActions(makeCtx(base({ payload: { base64: good, mimeType: "image/bmp" } })));
		assert.equal((await badMime.macFilePhoto()).error, "unsupported_mime_type");
		const badB64 = buildMacSeeActions(makeCtx(base({ payload: { base64: "!!!not-base64!!!" } })));
		assert.equal((await badB64.macFilePhoto()).error, "bad_base64");
		const missing = buildMacSeeActions(makeCtx(base({ payload: {} })));
		assert.equal((await missing.macFilePhoto()).error, "missing_base64");
	});

	// 6. macNoteAdd / macNoteSearch roundtrip
	await t("notes add + search roundtrip", async () => {
		const add = text => buildMacSeeActions(makeCtx(base({ payload: { text } }))).macNoteAdd();
		const r1 = await add("first note about apples");
		assert.equal(r1.ok, true);
		assert.ok(r1.path.endsWith(path.join("Awtsmoos-Notes", "notes.md")));
		assert.ok(r1.appendedChars > 0);
		await add("second note about BANANAS");
		const search = (query, limit) => buildMacSeeActions(makeCtx(base({ payload: { query, limit } }))).macNoteSearch();
		const apples = await search("apples");
		assert.equal(apples.ok, true);
		assert.equal(apples.matches.length, 1);
		assert.ok(apples.matches[0].text.includes("apples"));
		assert.match(apples.matches[0].date, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
		assert.ok(apples.matches[0].line >= 1);
		const ci = await search("BANANAS");
		assert.equal(ci.matches.length, 1);
		const none = await search("zzz-nope");
		assert.deepEqual(none.matches, []);
		assert.equal((await search("")).error, "missing_query");
		assert.equal((await buildMacSeeActions(makeCtx(base({ payload: { text: "   " } }))).macNoteAdd()).error, "missing_text");
		assert.equal((await buildMacSeeActions(makeCtx(base({ payload: { text: "x".repeat(20001) } }))).macNoteAdd()).error, "text_too_long");
	});

	await t("note search on missing file returns empty", async () => {
		const lonelyHome = path.join(tmpRoot, "lonely");
		fs.mkdirSync(lonelyHome, { recursive: true });
		const r = await buildMacSeeActions(makeCtx(base({ testHome: lonelyHome, payload: { query: "hi" } }))).macNoteSearch();
		assert.deepEqual(r, { ok: true, matches: [] });
	});

	// 7. macVoiceFile note path + command two-step
	await t("voice note prefixes mic mark", async () => {
		const actions = buildMacSeeActions(makeCtx(base({ payload: { transcript: "hello world", mode: "note" } })));
		const r = await actions.macVoiceFile();
		assert.equal(r.ok, true);
		const raw = fs.readFileSync(r.path, "utf8");
		assert.ok(raw.includes("\uD83C\uDFA8 hello world"));
	});

	await t("voice command two-step with confirmation token", async () => {
		const tokens = fakeTokens();
		const calls = [];
		const jobStore = { async startCommandJob(config, payload) { calls.push({ config, payload }); return { ok: true, jobId: "job-123" }; } };
		const mk = payload => buildMacSeeActions(makeCtx(base({ payload, testConfirmTokens: tokens, testJobStore: jobStore, root: testHome })));
		// step 1: no token -> needs confirmation
		const step1 = await mk({ transcript: "say hello", mode: "command" }).macVoiceFile();
		assert.equal(step1.ok, false);
		assert.equal(step1.needsConfirmation, true);
		assert.ok(typeof step1.confirmToken === "string" && step1.confirmToken.length > 0);
		assert.equal(step1.preview, "say hello");
		assert.equal(calls.length, 0);
		// bad token rejected
		const bad = await mk({ transcript: "say hello", mode: "command", confirmToken: "bogus" }).macVoiceFile();
		assert.equal(bad.error, "bad_or_expired_token");
		assert.equal(calls.length, 0);
		// token bound to a different command rejected (tamper)
		const other = tokens.create({ command: "other command" });
		const tampered = await mk({ transcript: "say hello", mode: "command", confirmToken: other }).macVoiceFile();
		assert.equal(tampered.error, "bad_or_expired_token");
		assert.equal(calls.length, 0);
		// step 2: good token -> job started, token single-use
		const step2 = await mk({ transcript: "say hello", mode: "command", confirmToken: step1.confirmToken }).macVoiceFile();
		assert.equal(step2.ok, true);
		assert.equal(step2.jobId, "job-123");
		assert.equal(calls.length, 1);
		assert.equal(calls[0].payload.command, "say hello");
		const replay = await mk({ transcript: "say hello", mode: "command", confirmToken: step1.confirmToken }).macVoiceFile();
		assert.equal(replay.error, "bad_or_expired_token");
	});

	await t("voice rejects missing transcript", async () => {
		const r = await buildMacSeeActions(makeCtx(base({ payload: { mode: "note" } }))).macVoiceFile();
		assert.equal(r.error, "missing_transcript");
	});

	console.log(JSON.stringify({ ok: true, tests: passed }));
})().catch(error => {
	console.error(JSON.stringify({ ok: false, failedAt: error && error.stack ? error.stack : String(error), passed }));
	process.exit(1);
});
