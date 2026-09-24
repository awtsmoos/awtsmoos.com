// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { buildMacDoActions } = require("../tools/fs/actionGroups/mac/macDoActions.js");

/**
 * @file Tests for group-A "DO THINGS ON THE MAC" companion actions.
 * @description
 * Every external touch is faked: testExec captures commands, testSpawn fakes
 * caffeinate, testJobStore is in-memory, testConfirmTokens is in-memory, and
 * home/tmp/state dirs are os.tmpdir() sandboxes. No real kill, no real
 * caffeinate, no real Spotlight, no real `open`.
 */

const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "macdo-test-"));
const tmpHome = path.join(sandbox, "home");
const tmpTmp = path.join(sandbox, "tmp");
const tmpState = path.join(sandbox, "state");
const tmpStore = path.join(sandbox, "store");
for (const dir of [tmpHome, tmpTmp, tmpState, tmpStore]) fs.mkdirSync(dir, { recursive: true });

/* ---------------- fake exec ---------------- */

const execCalls = [];
let psStdout = "";
let psStatus = 0;
let mdfindStdout = "";
let mdfindStatus = 0;
let killImpl = null;

function baseExec(cmd, args) {
	execCalls.push({ cmd, args: [...args] });
	if (cmd === "ps") return { stdout: psStdout, stderr: psStatus === 0 ? "" : "ps boom", status: psStatus };
	if (cmd === "mdfind") return { stdout: mdfindStdout, stderr: mdfindStatus === 0 ? "" : "mdfind boom", status: mdfindStatus };
	if (cmd === "kill") {
		if (typeof killImpl === "function") return killImpl(args);
		return { stdout: "", stderr: "", status: 0 };
	}
	if (cmd === "open") return { stdout: "", stderr: "", status: 0 };
	return { stdout: "", stderr: "", status: 0 };
}

function resetExec() {
	execCalls.length = 0;
	psStdout = "";
	psStatus = 0;
	mdfindStdout = "";
	mdfindStatus = 0;
	killImpl = null;
}

/* ---------------- fake store ---------------- */

function makeFakeStore(overrides = {}) {
	const calls = [];
	const store = {
		calls,
		async startCommandJob(config, payload) {
			calls.push(["startCommandJob", payload]);
			return { ok: true, jobId: "job-1", status: "queued" };
		},
		async commandStatus(config, p) {
			calls.push(["commandStatus", p]);
			return { ok: true, jobId: p.jobId, status: "running" };
		},
		async commandWait(config, p) {
			calls.push(["commandWait", p]);
			return { ok: true, jobId: p.jobId, status: "completed", done: true, waitedMs: 3 };
		},
		async cancelCommandJob(config, p) {
			calls.push(["cancelCommandJob", p]);
			return { ok: true, jobId: p.jobId, status: "cancelled" };
		},
		async commandJobOutputPage(config, p) {
			calls.push(["commandJobOutputPage", p]);
			return { ok: true, jobId: p.jobId, stream: p.stream, content: "0123456789", maxChars: p.maxChars };
		},
		jobDir(config, jobId) { return path.join(tmpStore, String(jobId)); },
		storeRoot(config) { return tmpStore; },
		...overrides
	};
	return store;
}

/* ---------------- fake tokens ---------------- */

function makeFakeTokens() {
	const map = new Map();
	let n = 0;
	return {
		create(payload) {
			const t = "tok-" + (++n) + "-" + Date.now();
			map.set(t, payload);
			return t;
		},
		consume(token) {
			const p = map.has(token) ? map.get(token) : null;
			map.delete(token);
			return p;
		}
	};
}

/* ---------------- fake spawn ---------------- */

const spawnCalls = [];
function fakeSpawn(cmd, args) {
	spawnCalls.push({ cmd, args: [...args] });
	return { pid: 42424 };
}

/* ---------------- context factory ---------------- */

function makeContext(payload = {}, overrides = {}) {
	const store = overrides.testJobStore || makeFakeStore();
	const tokens = overrides.testConfirmTokens || makeFakeTokens();
	const context = {
		config: { root: "/tmp/fake-root", allowCommands: true },
		payload,
		testExec: baseExec,
		testSpawn: overrides.testSpawn === undefined ? fakeSpawn : overrides.testSpawn,
		testJobStore: store,
		testConfirmTokens: tokens,
		testHome: tmpHome,
		testTmp: tmpTmp,
		testStateDir: tmpState
	};
	return { context, actions: buildMacDoActions(context), store, tokens };
}

/* ---------------- runner ---------------- */

let passed = 0;
async function test(name, fn) {
	resetExec();
	spawnCalls.length = 0;
	await fn();
	passed++;
	console.log("ok - " + name);
}

(async () => {
	/* ---- builder ---- */
	await test("builder returns all 13 action names", async () => {
		const { actions } = makeContext();
		const names = Object.keys(actions).sort();
		assert.deepEqual(names, [
			"macAwakeList", "macAwakeStart", "macAwakeStop",
			"macFind", "macJobCancel", "macJobOutput", "macJobReceipts",
			"macJobRun", "macJobStatus", "macJobWait", "macKill",
			"macOpen", "macTop"
		]);
		for (const name of names) assert.equal(typeof actions[name], "function");
	});

	/* ---- macJobRun ---- */
	await test("macJobRun rejects missing command", async () => {
		const { actions } = makeContext({ label: "x" });
		const r = await actions.macJobRun();
		assert.equal(r.ok, false);
		assert.equal(r.error, "missing_command");
	});

	await test("macJobRun delegates, caps timeout, stores sidecar, returns next", async () => {
		const { context, actions, store } = makeContext({
			command: "echo hi",
			label: "nightly",
			notifyNote: "tell Yaakov it finished",
			timeoutMs: 999999999
		});
		const r = await actions.macJobRun();
		assert.equal(r.ok, true);
		assert.equal(r.jobId, "job-1");
		assert.equal(r.status, "queued");
		assert.equal(r.label, "nightly");
		assert.equal(r.notifyNote, "tell Yaakov it finished");
		assert.deepEqual(r.next, { action: "macJobStatus", jobId: "job-1" });
		assert.equal(store.calls[0][0], "startCommandJob");
		assert.equal(store.calls[0][1].timeoutMs, 86400000);
		assert.equal(store.calls[0][1].command, "echo hi");
		const sidecar = JSON.parse(fs.readFileSync(path.join(tmpStore, "job-1", "mac-do.json"), "utf8"));
		assert.equal(sidecar.label, "nightly");
		assert.equal(sidecar.notifyNote, "tell Yaakov it finished");
	});

	await test("macJobRun default timeout is 3600000", async () => {
		const { actions, store } = makeContext({ command: "true" });
		await actions.macJobRun();
		assert.equal(store.calls[0][1].timeoutMs, 3600000);
	});

	await test("macJobRun passes store failure through", async () => {
		const failing = makeFakeStore({
			async startCommandJob() { return { ok: false, error: "commands_disabled" }; }
		});
		const { actions } = makeContext({ command: "true" }, { testJobStore: failing });
		const r = await actions.macJobRun();
		assert.equal(r.ok, false);
		assert.equal(r.error, "commands_disabled");
	});

	/* ---- macJobStatus ---- */
	await test("macJobStatus rejects missing jobId and passes through", async () => {
		const { context, actions, store } = makeContext({});
		const bad = await actions.macJobStatus();
		assert.equal(bad.ok, false);
		assert.equal(bad.error, "missing_jobId");
		context.payload = { jobId: "job-9" };
		const r = await actions.macJobStatus();
		assert.equal(r.ok, true);
		assert.equal(r.jobId, "job-9");
		assert.deepEqual(store.calls[0], ["commandStatus", { jobId: "job-9" }]);
	});

	/* ---- macJobWait ---- */
	await test("macJobWait delegates with inlineOutput and clamps", async () => {
		const { context, actions, store } = makeContext({ jobId: "job-1", timeoutMs: 999999 });
		const r = await actions.macJobWait();
		assert.equal(r.ok, true);
		assert.equal(r.done, true);
		const call = store.calls.find(c => c[0] === "commandWait");
		assert.ok(call);
		assert.equal(call[1].inlineOutput, true);
		assert.equal(call[1].timeoutMs, 120000); // clamped 300000, chunked 120000
		context.payload = { jobId: "job-1" };
		await actions.macJobWait();
		const call2 = store.calls.filter(c => c[0] === "commandWait").pop();
		assert.equal(call2[1].timeoutMs, 60000); // default
	});

	await test("macJobWait returns waitTimedOut when never done", async () => {
		const looping = makeFakeStore({
			async commandWait(config, p) { return { ok: true, jobId: p.jobId, status: "running", done: false }; }
		});
		const { actions } = makeContext({ jobId: "job-1", timeoutMs: 150 }, { testJobStore: looping });
		const r = await actions.macJobWait();
		assert.equal(r.ok, true);
		assert.equal(r.done, false);
		assert.equal(r.waitTimedOut, true);
		assert.deepEqual(r.statusPayload, { action: "macJobStatus", jobId: "job-1" });
	});

	await test("macJobWait rejects missing jobId", async () => {
		const { actions } = makeContext({});
		const r = await actions.macJobWait();
		assert.equal(r.ok, false);
		assert.equal(r.error, "missing_jobId");
	});

	/* ---- macJobCancel ---- */
	await test("macJobCancel passes through and rejects missing jobId", async () => {
		const { context, actions, store } = makeContext({ jobId: "job-7" });
		const r = await actions.macJobCancel();
		assert.equal(r.ok, true);
		assert.equal(r.status, "cancelled");
		assert.deepEqual(store.calls[0], ["cancelCommandJob", { jobId: "job-7" }]);
		context.payload = {};
		const bad = await actions.macJobCancel();
		assert.equal(bad.error, "missing_jobId");
	});

	/* ---- macJobOutput ---- */
	await test("macJobOutput normalizes stream and clamps maxChars", async () => {
		const { context, actions, store } = makeContext({ jobId: "job-1", stream: "STDERR", maxChars: 999999 });
		const r = await actions.macJobOutput();
		assert.equal(r.ok, true);
		assert.equal(r.stream, "stderr");
		assert.equal(r.maxChars, 200000);
		context.payload = { jobId: "job-1", stream: "bogus" };
		const r2 = await actions.macJobOutput();
		assert.equal(r2.stream, "stdout");
		assert.equal(r2.maxChars, 20000);
		context.payload = {};
		assert.equal((await actions.macJobOutput()).error, "missing_jobId");
	});

	/* ---- macJobReceipts ---- */
	await test("macJobReceipts scans terminal jobs, skips bad entries", async () => {
		const now = Date.now();
		const mk = (id, meta, sidecar) => {
			const dir = path.join(tmpStore, id);
			fs.mkdirSync(dir, { recursive: true });
			fs.writeFileSync(path.join(dir, "meta.json"), typeof meta === "string" ? meta : JSON.stringify(meta));
			if (sidecar) fs.writeFileSync(path.join(dir, "mac-do.json"), JSON.stringify(sidecar));
		};
		mk("job-a", { jobId: "job-a", status: "completed", exitCode: 0, finishedAt: new Date(now - 1000).toISOString() }, { label: "nightly backup" });
		mk("job-b", { jobId: "job-b", status: "running", finishedAt: new Date(now - 1000).toISOString() });
		mk("job-c", { jobId: "job-c", status: "failed", exitCode: 2, finishedAt: new Date(now - 3 * 86400000).toISOString() });
		mk("job-d", "this is not json {{{");
		mk("job-e", { jobId: "job-e", status: "cancelled", updatedAt: new Date(now - 2000).toISOString() });
		fs.writeFileSync(path.join(tmpStore, "stray.txt"), "not a dir");
		const { context, actions } = makeContext({});
		const r = await actions.macJobReceipts();
		assert.equal(r.ok, true);
		const ids = r.receipts.map(x => x.jobId);
		assert.ok(ids.includes("job-a"), "includes completed job-a");
		assert.ok(ids.includes("job-e"), "includes cancelled job-e via updatedAt fallback");
		assert.ok(!ids.includes("job-b"), "excludes running job-b");
		assert.ok(!ids.includes("job-c"), "excludes job-c older than 24h");
		assert.ok(!ids.includes("job-d"), "excludes malformed job-d");
		const a = r.receipts.find(x => x.jobId === "job-a");
		assert.equal(a.label, "nightly backup");
		assert.equal(a.exitCode, 0);
		assert.equal(a.status, "completed");
		assert.ok(a.finishedAt >= r.sinceMs);
		// sinceMs override pulls job-c back in
		context.payload = { sinceMs: 0 };
		const r2 = await actions.macJobReceipts();
		assert.ok(r2.receipts.map(x => x.jobId).includes("job-c"));
		// unreadable store root fails gracefully
		const badStore = makeFakeStore({});
		badStore.storeRoot = () => path.join(sandbox, "no-such-dir");
		const { actions: badActions } = makeContext({}, { testJobStore: badStore });
		const bad = await badActions.macJobReceipts();
		assert.equal(bad.ok, false);
		assert.equal(bad.error, "job_store_unreadable");
	});

	/* ---- macFind ---- */
	await test("macFind builds kind/recency compound queries", async () => {
		const { context, actions } = makeContext({ query: "quarterly report", kind: "pdf", recency: "week" });
		mdfindStdout = "";
		const r = await actions.macFind();
		assert.equal(r.ok, true);
		assert.equal(execCalls[0].cmd, "mdfind");
		const compound = execCalls[0].args[0];
		assert.ok(compound.includes('kMDItemContentTypeTree == "com.adobe.pdf"'), "pdf clause: " + compound);
		assert.ok(compound.includes("$time.today(-7)"), "week clause: " + compound);
		assert.ok(compound.includes('kMDItemDisplayName == "*quarterly report*"'), "name clause");
		assert.ok(compound.includes('kMDItemTextContent == "*quarterly report*"'), "content clause");

		context.payload = { query: "x", kind: "image" };
		await actions.macFind();
		assert.ok(execCalls[1].args[0].includes('kMDItemContentTypeTree == "public.image"'));

		context.payload = { query: "x", kind: "doc" };
		await actions.macFind();
		assert.ok(execCalls[2].args[0].includes('kMDItemContentTypeTree == "public.text"'));

		context.payload = { query: "x" };
		await actions.macFind();
		const anyCompound = execCalls[3].args[0];
		assert.ok(!anyCompound.includes("kMDItemContentTypeTree"), "kind any has no type clause");
		assert.ok(!anyCompound.includes("$time"), "recency any has no time clause");

		context.payload = { query: "x", recency: "today" };
		await actions.macFind();
		assert.ok(execCalls[4].args[0].includes("$time.today(-1)"));
	});

	await test("macFind escapes quotes/backslashes in the query", async () => {
		const { actions } = makeContext({ query: 'say "hi" \\ bye' });
		mdfindStdout = "";
		await actions.macFind();
		const compound = execCalls[0].args[0];
		assert.ok(compound.includes('\\"hi\\"'), "escaped quotes: " + compound);
		assert.ok(compound.includes("\\\\"), "escaped backslash: " + compound);
		assert.ok(!compound.includes('"hi"') || compound.includes('\\"hi\\"'));
	});

	await test("macFind stats results and skips unreadable paths", async () => {
		const f1 = path.join(tmpTmp, "report-a.pdf");
		const f2 = path.join(tmpTmp, "report-b.pdf");
		fs.writeFileSync(f1, "12345");
		fs.writeFileSync(f2, "1234567890");
		mdfindStdout = [f1, "", path.join(tmpTmp, "nope.pdf"), f2].join("\n");
		const { context, actions } = makeContext({ query: "report" });
		const r = await actions.macFind();
		assert.equal(r.ok, true);
		assert.equal(r.count, 2);
		assert.equal(r.results[0].path, f1);
		assert.equal(r.results[0].name, "report-a.pdf");
		assert.equal(r.results[0].bytes, 5);
		assert.ok(typeof r.results[0].modified === "string" && r.results[0].modified.length > 0);
		assert.equal(r.results[1].bytes, 10);
		// limit respected
		context.payload = { query: "report", limit: 1 };
		const r2 = await actions.macFind();
		assert.equal(r2.count, 1);
	});

	await test("macFind caps limit at 100", async () => {
		const f1 = path.join(tmpTmp, "cap.pdf");
		fs.writeFileSync(f1, "x");
		mdfindStdout = new Array(120).fill(f1).join("\n");
		const { actions } = makeContext({ query: "cap", limit: 500 });
		const r = await actions.macFind();
		assert.equal(r.count, 100);
	});

	await test("macFind rejects empty query and reports mdfind failure", async () => {
		const { actions } = makeContext({ query: "   " });
		assert.equal((await actions.macFind()).error, "missing_query");
		const { actions: a2 } = makeContext({ query: "x" });
		mdfindStatus = 1;
		const r = await a2.macFind();
		assert.equal(r.ok, false);
		assert.equal(r.error, "mdfind_failed");
	});

	/* ---- macOpen ---- */
	await test("macOpen routes url vs app name vs path", async () => {
		const { context, actions } = makeContext({ target: "https://example.com/x" });
		const u = await actions.macOpen();
		assert.equal(u.ok, true);
		assert.deepEqual(execCalls[0], { cmd: "open", args: ["https://example.com/x"] });

		context.payload = { target: "Safari" };
		await actions.macOpen();
		assert.deepEqual(execCalls[1], { cmd: "open", args: ["-a", "Safari"] });

		context.payload = { target: "Calc.app" };
		await actions.macOpen();
		assert.deepEqual(execCalls[2], { cmd: "open", args: ["-a", "Calc.app"] });

		const note = path.join(tmpHome, "docs", "note.txt");
		fs.mkdirSync(path.dirname(note), { recursive: true });
		fs.writeFileSync(note, "hi");
		context.payload = { target: "docs/note.txt" };
		const p = await actions.macOpen();
		assert.equal(p.ok, true);
		assert.deepEqual(execCalls[3], { cmd: "open", args: [note] });
	});

	await test("macOpen allows /Applications and tmp absolute paths, rejects the rest", async () => {
		const { context, actions } = makeContext({});
		if (fs.existsSync("/Applications")) {
			context.payload = { target: "/Applications" };
			const a = await actions.macOpen();
			assert.equal(a.ok, true);
			assert.deepEqual(execCalls[execCalls.length - 1], { cmd: "open", args: ["/Applications"] });
		}
		const tmpFile = path.join(tmpTmp, "clip.txt");
		fs.writeFileSync(tmpFile, "x");
		context.payload = { target: tmpFile };
		const t = await actions.macOpen();
		assert.equal(t.ok, true);
		assert.deepEqual(execCalls[execCalls.length - 1], { cmd: "open", args: [tmpFile] });

		context.payload = { target: "../../etc/passwd" };
		const trav = await actions.macOpen();
		assert.equal(trav.ok, false);
		assert.equal(trav.error, "path_outside_allowed_roots");

		context.payload = { target: "/etc/passwd" };
		const abs = await actions.macOpen();
		assert.equal(abs.ok, false);
		assert.equal(abs.error, "path_outside_allowed_roots");

		context.payload = { target: "docs/nope.txt" };
		const missing = await actions.macOpen();
		assert.equal(missing.ok, false);
		assert.equal(missing.error, "target_not_found");

		context.payload = { target: "   " };
		assert.equal((await actions.macOpen()).error, "missing_target");
	});

	/* ---- macTop ---- */
	await test("macTop parses and sorts by cpu then mem", async () => {
		psStdout = [
			"  PID %CPU %MEM COMMAND",
			"  123 45.0  2.1 Google Chrome",
			"  456  1.2 10.5 node",
			"   78  0.0  0.1 launchd"
		].join("\n");
		const { context, actions } = makeContext({});
		const r = await actions.macTop();
		assert.equal(r.ok, true);
		assert.deepEqual(execCalls[0].args, ["-arcwwwxo", "pid,pcpu,pmem,comm"]);
		assert.deepEqual(r.entries.map(e => e.pid), [123, 456, 78]);
		assert.deepEqual(r.entries[0], { pid: 123, cpu: 45, mem: 2.1, command: "Google Chrome" });
		context.payload = { by: "mem", limit: 2 };
		const m = await actions.macTop();
		assert.deepEqual(m.entries.map(e => e.pid), [456, 123]);
		assert.equal(m.entries.length, 2);
	});

	await test("macTop caps limit and reports ps failure", async () => {
		psStdout = "  1 0.0 0.1 x\n";
		const { context, actions } = makeContext({ limit: 999 });
		const r = await actions.macTop();
		assert.equal(r.limit, 50);
		context.payload = {};
		psStatus = 1;
		const bad = await actions.macTop();
		assert.equal(bad.ok, false);
		assert.equal(bad.error, "ps_failed");
	});

	/* ---- macKill ---- */
	function killPsTable() {
		return [
			"    1 launchd",
			"   42 /usr/local/bin/node /Users/x/awtsmoos.com/geelooy/apps/tunnel/agent.js",
			"  123 /Applications/TextEdit.app/Contents/MacOS/TextEdit",
			"  456 /usr/bin/python3 /tmp/x/script.py",
			"  " + process.pid + " /usr/local/bin/node " + path.join(sandbox, "runner.js")
		].join("\n");
	}

	await test("macKill validates signal and requires pid or name", async () => {
		const { actions } = makeContext({ name: "x", signal: "HUP" });
		assert.equal((await actions.macKill()).error, "signal_not_allowed");
		const { actions: a2 } = makeContext({});
		assert.equal((await a2.macKill()).error, "missing_pid_or_name");
		const { actions: a3 } = makeContext({ pid: "abc" });
		assert.equal((await a3.macKill()).error, "invalid_pid");
	});

	await test("macKill name flow issues token, bad token rejected, consume kills", async () => {
		psStdout = killPsTable();
		const { context, actions } = makeContext({ name: "text" });
		const first = await actions.macKill();
		assert.equal(first.ok, false);
		assert.equal(first.needsConfirmation, true);
		assert.ok(typeof first.confirmToken === "string" && first.confirmToken.length > 0);
		assert.equal(first.signal, "TERM");
		assert.deepEqual(first.preview.map(p => p.pid), [123]);
		assert.ok(!("refused" in first));

		context.payload = { confirmToken: "nope" };
		const bad = await actions.macKill();
		assert.equal(bad.ok, false);
		assert.equal(bad.error, "bad_or_expired_token");

		context.payload = { confirmToken: first.confirmToken };
		const done = await actions.macKill();
		assert.equal(done.ok, true);
		assert.equal(done.signal, "TERM");
		assert.deepEqual(done.results, [{ pid: 123, ok: true }]);
		assert.deepEqual(execCalls[execCalls.length - 1], { cmd: "kill", args: ["-TERM", "123"] });

		// single-use: the same token is dead now
		context.payload = { confirmToken: first.confirmToken };
		assert.equal((await actions.macKill()).error, "bad_or_expired_token");
	});

	await test("macKill refuses tunnel agent, own pid, and pid 1", async () => {
		psStdout = killPsTable();
		const { context, actions } = makeContext({ name: "awtsmoos" });
		const a = await actions.macKill();
		assert.equal(a.error, "all_candidates_refused");
		assert.equal(a.refused[0].pid, 42);
		assert.equal(a.refused[0].reason, "tunnel_agent_self_protection");

		context.payload = { name: "runner.js" };
		const b = await actions.macKill();
		assert.equal(b.error, "all_candidates_refused");
		assert.equal(b.refused[0].pid, process.pid);
		assert.equal(b.refused[0].reason, "own_process");

		context.payload = { name: "launchd" };
		const c = await actions.macKill();
		assert.equal(c.error, "all_candidates_refused");
		assert.equal(c.refused[0].reason, "system_process");

		context.payload = { pid: process.pid };
		const d = await actions.macKill();
		assert.equal(d.error, "all_candidates_refused");
	});

	await test("macKill pid flow resolves, reports unknown pids and kill failures", async () => {
		psStdout = killPsTable();
		const { context, actions } = makeContext({ pid: 123, signal: "int" });
		const first = await actions.macKill();
		assert.equal(first.needsConfirmation, true);
		assert.equal(first.signal, "INT");
		assert.deepEqual(first.preview.map(p => p.pid), [123]);

		context.payload = { pid: 999999 };
		assert.equal((await actions.macKill()).error, "no_such_process");

		// kill failure surfaces per-pid
		killImpl = () => ({ stdout: "", stderr: "operation not permitted", status: 1 });
		context.payload = { confirmToken: first.confirmToken };
		const done = await actions.macKill();
		assert.equal(done.ok, true);
		assert.equal(done.results[0].ok, false);
		assert.ok(done.results[0].error.includes("operation not permitted"));
	});

	/* ---- macAwake ---- */
	function awakeRecords() {
		const file = path.join(tmpState, "awake-assertions.json");
		if (!fs.existsSync(file)) return {};
		return JSON.parse(fs.readFileSync(file, "utf8"));
	}

	await test("macAwakeStart spawns caffeinate detached with -t and records", async () => {
		const { context, actions } = makeContext({ label: "long render", jobId: "job-1" });
		const before = Date.now();
		const r = await actions.macAwakeStart();
		assert.equal(r.ok, true);
		assert.ok(typeof r.assertionId === "string" && r.assertionId.length >= 8);
		assert.equal(r.caffeinatePid, 42424);
		assert.ok(r.expiresAt > before + 119 * 60000 && r.expiresAt <= Date.now() + 120 * 60000);
		assert.deepEqual(spawnCalls[0], { cmd: "caffeinate", args: ["-dimsu", "-t", "7200"] });
		const records = awakeRecords();
		assert.ok(records[r.assertionId]);
		assert.equal(records[r.assertionId].label, "long render");
		assert.equal(records[r.assertionId].jobId, "job-1");

		context.payload = { minutes: 5000 };
		spawnCalls.length = 0;
		const r2 = await actions.macAwakeStart();
		assert.equal(r2.ok, true);
		assert.deepEqual(spawnCalls[0], { cmd: "caffeinate", args: ["-dimsu", "-t", "86400"] }); // capped at 1440
		context.payload = { assertionId: r.assertionId };
		await actions.macAwakeStop();
		context.payload = { assertionId: r2.assertionId };
		await actions.macAwakeStop();
	});

	await test("macAwakeStart fails gracefully when spawn yields no pid", async () => {
		const { actions } = makeContext({}, { testSpawn: () => ({ pid: 0 }) });
		const r = await actions.macAwakeStart();
		assert.equal(r.ok, false);
		assert.equal(r.error, "caffeinate_spawn_failed");
	});

	await test("macAwakeStop kills and deletes, unknown id rejected", async () => {
		const { context, actions } = makeContext({});
		const started = await actions.macAwakeStart();
		context.payload = { assertionId: started.assertionId };
		const stopped = await actions.macAwakeStop();
		assert.equal(stopped.ok, true);
		assert.equal(stopped.stopped, started.assertionId);
		assert.deepEqual(execCalls[execCalls.length - 1], { cmd: "kill", args: ["-TERM", "42424"] });
		assert.ok(!awakeRecords()[started.assertionId]);
		const again = await actions.macAwakeStop();
		assert.equal(again.error, "unknown_assertion");
		context.payload = {};
		assert.equal((await actions.macAwakeStop()).error, "missing_assertionId");
	});

	await test("macAwakeList keeps live assertions and prunes dead/expired", async () => {
		const now = Date.now();
		fs.writeFileSync(path.join(tmpState, "awake-assertions.json"), JSON.stringify({
			live: { assertionId: "live", caffeinatePid: 42424, expiresAt: now + 600000, label: "keep", jobId: null, createdAt: new Date(now).toISOString() },
			dead: { assertionId: "dead", caffeinatePid: 99999, expiresAt: now + 600000, label: "gone", jobId: null, createdAt: new Date(now).toISOString() },
			old: { assertionId: "old", caffeinatePid: 42424, expiresAt: now - 1000, label: "stale", jobId: null, createdAt: new Date(now - 700000).toISOString() }
		}));
		killImpl = args => {
			if (args.includes("-0") && args.includes("99999")) return { stdout: "", stderr: "no such process", status: 1 };
			return { stdout: "", stderr: "", status: 0 };
		};
		const { actions } = makeContext({});
		const r = await actions.macAwakeList();
		assert.equal(r.ok, true);
		assert.equal(r.count, 1);
		assert.equal(r.assertions[0].assertionId, "live");
		const killCalls = execCalls.filter(c => c.cmd === "kill");
		assert.ok(killCalls.some(c => c.args[0] === "-KILL" && c.args[1] === "99999"), "stray caffeinate killed");
		const records = awakeRecords();
		assert.deepEqual(Object.keys(records), ["live"]);
	});

	console.log(JSON.stringify({ ok: true, suite: "macCompanionDo", passed }));
})().catch(error => {
	console.error("FAIL:", error && error.stack || error);
	process.exit(1);
});
