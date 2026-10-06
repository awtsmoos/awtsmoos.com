// B"H
// Boruch Hashem
// Blessed is He
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const zlib = require("node:zlib");

/**
 * B"H
 * Bounded-log rotation for the tunnel process-lifecycle log.
 *
 * The old lifecycle writer grew without bound (109MB process-lifecycle.jsonl
 * observed on the Mac) because every routine record dumped full per-lane,
 * per-limit, per-queue telemetry. These tests prove:
 *   1. writing past the size cap fires rotation and generations stay bounded
 *      (<= N files, <= M bytes total),
 *   2. a crash mid-rotation loses no records,
 *   3. routine telemetry (process_start / heartbeat) is a short summary and
 *      full diagnostic snapshots are emitted only for failure/debug events.
 */

const Lifecycle = require("../lib/runtime/process-lifecycle-log.js");

function tmpDir() {
	const d = fs.mkdtempSync(path.join(os.tmpdir(), "logrot-"));
	return d;
}

test("rotation fires past the cap and generations stay bounded", () => {
	const d = tmpDir();
	const log = path.join(d, "proc.jsonl");
	// Monkey-seed: drive the real rotateLog through the real record() path by
	// pointing rotation overrides at a tiny cap (production default is 10MB).
	const cap = 32 * 1024;
	const gens = 3;
	for (let round = 0; round < 12; round++) {
		// 12 rounds x 16KB guarantees several rotations under a 32KB cap.
		const chunk = JSON.stringify({ event: "heartbeat", round, pad: "x".repeat(16 * 1024 - 80) }) + "\n";
		fs.appendFileSync(log, chunk.repeat(1));
		Lifecycle.rotateLog(log, { maxBytes: cap, generations: gens });
	}
	const files = fs.readdirSync(d).filter(f => f.startsWith("proc.jsonl"));
	assert.ok(files.length <= 1 + gens, `too many generations: ${files.join(",")}`);
	let total = 0;
	for (const f of files) total += fs.statSync(path.join(d, f)).size;
	const bound = cap + gens * (cap + 1024); // compressed generations must be << raw cap each
	assert.ok(total <= bound, `total ${total} exceeds bound ${bound}`);
	const gz = files.filter(f => f.endsWith(".gz"));
	assert.ok(gz.length >= 1, "expected at least one compressed generation after 12 rounds");
	// every generation must be a valid gzip that decompresses to JSONL
	for (const f of gz) {
		const raw = zlib.gunzipSync(fs.readFileSync(path.join(d, f))).toString("utf8");
		assert.ok(raw.includes('"event":"heartbeat"'), `${f} does not hold lifecycle JSONL`);
	}
	fs.rmSync(d, { recursive: true, force: true });
});

test("rotation is idempotent and never grows past cap+one record", () => {
	const d = tmpDir();
	const log = path.join(d, "proc.jsonl");
	const cap = 4096;
	fs.writeFileSync(log, "x".repeat(cap + 1));
	assert.equal(Lifecycle.rotateLog(log, { maxBytes: cap, generations: 3 }), true);
	assert.ok(fs.statSync(log).size <= cap + 1, "active file must be truncated after rotation");
	assert.equal(Lifecycle.rotateLog(log, { maxBytes: cap, generations: 3 }), false, "no rotation when within cap");
	fs.rmSync(d, { recursive: true, force: true });
});

test("crash mid-rotation loses no records", () => {
	const d = tmpDir();
	const log = path.join(d, "proc.jsonl");
	const cap = 1024; // 50 records (~1.4KB) exceed this, so rotation must run
	const records = [];
	for (let i = 0; i < 50; i++) records.push(JSON.stringify({ event: "heartbeat", seq: i }) + "\n");
	fs.writeFileSync(log, records.join(""));

	// Simulate a crash between "compressed copy written" and "rename to .1.gz":
	// make renameSync throw exactly when promoting the temp generation.
	const realRename = fs.renameSync;
	let crashed = false;
	fs.renameSync = (src, dst) => {
		if (String(dst).endsWith(".1.gz") && String(src).endsWith(`.tmp.${process.pid}`)) {
			crashed = true;
			throw new Error("simulated crash mid-rotation");
		}
		return realRename(src, dst);
	};
	try {
		const ran = Lifecycle.rotateLog(log, { maxBytes: cap, generations: 3 });
		assert.equal(ran, false, "rotation must report failure when the crash hits");
	} finally {
		fs.renameSync = realRename;
	}
	assert.ok(crashed, "the crash hook never fired");
	// Active file is byte-identical: nothing was truncated before the copy existed.
	assert.equal(fs.readFileSync(log, "utf8"), records.join(""), "active record bytes lost during crash");
	// And a subsequent clean rotation still recovers everything.
	assert.equal(Lifecycle.rotateLog(log, { maxBytes: cap, generations: 3 }), true);
	const gen1 = zlib.gunzipSync(fs.readFileSync(`${log}.1.gz`)).toString("utf8");
	assert.equal(gen1, records.join(""), "generation .1.gz lost bytes after recovery");
	fs.rmSync(d, { recursive: true, force: true });
});

test("process_start and heartbeat records are short summaries", () => {
	const big = {
		lanes: {
			p0_control: { health: "ok", inflight: 3, queued: 0, limits: { maxInflight: 8, maxQueue: 64 }, drift: { telemetryDrift: false } },
			p1_data: { health: "degraded", inflight: 8, queued: 41, limits: { maxInflight: 8, maxQueue: 64 } },
		},
		eventLoopLag: 12.5,
		circuit: { state: "half-open", failures: 2, policy: { threshold: 5, windowMs: 60000 } },
		connection: {
			connected: true,
			queues: { outbox: { depth: 7, max: 100, counters: { enq: 999, deq: 992 } }, inbox: { depth: 0 } },
			mailbox: { health: "ok", lastSync: "2026-10-05T00:00:00Z" },
		},
	};
	const options = { snapshot: () => big, localApiState: () => "ready" };
	const start = Lifecycle.details("process_start", options);
	const hb = Lifecycle.details("heartbeat", options);

	for (const [name, rec] of [["process_start", start], ["heartbeat", hb]]) {
		assert.deepEqual(rec.laneHealth, { p0_control: "ok", p1_data: "degraded" }, `${name}: lane flags`);
		assert.deepEqual(rec.queueDepths, { outbox: 7, inbox: 0 }, `${name}: queue depths as numbers`);
		assert.equal(rec.mailboxHealth, "ok", `${name}: mailbox flag`);
		assert.equal(rec.websocket, "connected", `${name}: websocket flag`);
		assert.equal(rec.eventLoopLagMs, 12.5, `${name}: lag as number`);
		const raw = JSON.stringify(rec);
		assert.ok(raw.length < 600, `${name} summary too long: ${raw.length} bytes`);
		assert.ok(!raw.includes("telemetryDrift") && !raw.includes("maxInflight"),
			`${name} leaks full per-lane telemetry`);
	}
});

test("full diagnostic snapshot only on failure/debug events", () => {
	const snap = {
		lanes: { p0: { health: "ok", inflight: 1 } },
		circuit: { state: "open" },
		eventLoopLag: 3,
		connection: { connected: false },
	};
	const options = { snapshot: () => snap };
	const fail = Lifecycle.details("uncaught_exception", options, { error: "boom" });
	assert.deepEqual(fail.lanes, snap.lanes, "failure keeps full lanes object");
	assert.deepEqual(fail.circuit, snap.circuit, "failure keeps full circuit object");
	assert.equal(fail.error, "boom", "failure keeps the error summary");

	const dbg = Lifecycle.details("debug_routes", options);
	assert.deepEqual(dbg.lanes, snap.lanes, "debug keeps full lanes object");

	const sig = Lifecycle.details("signal", options, { signal: "SIGTERM" });
	assert.deepEqual(sig.laneHealth, { p0: "ok" }, "signal uses compact flags");
	assert.equal(sig.signal, "SIGTERM", "signal keeps its extra field");
});

test("record() rotates before appending and honors rotation overrides", () => {
	const d = tmpDir();
	// Redirect the writer at a temp log by monkey-patching LOG_FILE via env is
	// fixed at require time; instead exercise rotateLog+append through a thin
	// harness using the module's own LOG_FILE only when AWTSMOOS_RECOVERY_ROOT
	// points at tmp. Re-require with env override for isolation.
	process.env.AWTSMOOS_RECOVERY_ROOT = d;
	delete require.cache[require.resolve("../lib/runtime/process-lifecycle-log.js")];
	const Fresh = require("../lib/runtime/process-lifecycle-log.js");
	try {
		const small = { maxBytes: 2048, generations: 2 };
		for (let i = 0; i < 40; i++) {
			assert.equal(Fresh.record("heartbeat", { seq: i, pad: "y".repeat(200) }, small), true);
		}
		const files = fs.readdirSync(path.join(d, "logs")).filter(f => f.startsWith("process-lifecycle.jsonl"));
		assert.ok(files.length <= 1 + 2, `unbounded generations: ${files.join(",")}`);
		const active = fs.readFileSync(Fresh.LOG_FILE, "utf8").trim().split("\n");
		assert.ok(active.length >= 1, "active log must hold recent records");
		assert.ok(active[active.length - 1].includes('"seq":39'), "newest record must survive rotation");
	} finally {
		delete process.env.AWTSMOOS_RECOVERY_ROOT;
		delete require.cache[require.resolve("../lib/runtime/process-lifecycle-log.js")];
		fs.rmSync(d, { recursive: true, force: true });
	}
});
