//B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");

const BootResumePolicy = require("../lib/runtime/boot-resume-policy.js");
const RouteElector = require("../lib/runtime/routeElector.js");
const MailboxIO = require("../lib/connection-vessel/mailbox-io.js");
const Singleton = require("../lib/runtime/process-singleton.js");
const Watchdog = require("../lib/runtime/watchdog.js");

/**
 * @file Deterministic restart/reinstall torture rig for the tunnel reliability work.
 * @description
 * Drives repeated agent restart and reinstall cycles through the REAL modules the
 * reliability workers hardened: boot-resume policy (BootResumePolicy), supervisor
 * promotion/handoff classification (classifySupervisors / supervisorHealthVerdict /
 * assertExpectedSingleOwner), mailbox write/verify/remove (MailboxIO), the HTTP
 * singleton lease (Singleton.acquire/release), and the watchdog reconnect decision
 * (Watchdog.inspect). Each cycle interleaves admitted commands, filesystem
 * activity, and idle periods, then asserts the full invariant set: exactly one
 * owner, identity preserved, zero uncaught mailbox ENOENTs, zero EADDRINUSE
 * crashes, zero lost commands, bounded logs, and recovery inside a time budget.
 */

const PRIMARY_TUNNEL = "awt-awtsmoos-2184";
const RESCUE_TUNNEL = "awt-rescue-7572-v2";
const HTTP_PORT = 45931;
const CYCLE_BUDGET_MS = 15000;
const TOTAL_BUDGET_MS = 120000;
const LOG_BYTE_BOUND = 1000000;
const LOG_LINE_BOUND = 50000;
const DEAD_PID = 2147483647;

/**
 * Deterministic PRNG (mulberry32) so every torture run is reproducible.
 * @param {number} seed Unsigned 32-bit seed.
 * @returns {() => number} Function yielding [0, 1).
 */
function mulberry32(seed) {
	let state = seed >>> 0;
	return () => {
		state = (state + 0x6d2b79f5) >>> 0;
		let word = Math.imul(state ^ (state >>> 15), 1 | state);
		word = (word + Math.imul(word ^ (word >>> 7), 61 | word)) ^ word;
		return ((word ^ (word >>> 14)) >>> 0) / 4294967296;
	};
}

/**
 * Sleeps a bounded number of milliseconds.
 * @param {number} ms Milliseconds to sleep.
 * @returns {Promise<void>}
 */
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Binds a localhost TCP server on the fixed torture port.
 * @param {number} port Port to bind.
 * @returns {Promise<import("node:net").Server>} The listening server.
 */
function listenOnce(port) {
	return new Promise((resolve, reject) => {
		const server = net.createServer();
		server.once("error", reject);
		server.listen(port, "127.0.0.1", () => {
			server.removeListener("error", reject);
			resolve(server);
		});
	});
}

/**
 * Closes a server, resolving when fully closed.
 * @param {import("node:net").Server} server Server to close.
 * @returns {Promise<void>}
 */
function closeServer(server) {
	return new Promise((resolve) => server.close(() => resolve()));
}

/**
 * Creates a restart-torture rig. The rig owns a temp base directory and all
 * counters; every cycle runs through the real hardened modules.
 * @param {{seed?: number}} [options] Rig options.
 * @returns {object} The rig with cycle/controls/finish methods.
 */
function createRig(options = {}) {
	process.setMaxListeners(0);
	const seed = (options.seed >>> 0) || 1;
	const rng = mulberry32(seed);
	const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), "restart-torture-"));
	const logLines = [];
	/** @param {string} level Log level. @param {string} message Log message. */
	const log = (level, message) => {
		logLines.push({ level, message: String(message) });
	};
	const state = {
		seed,
		rng,
		baseDir,
		log,
		logLines,
		roots: [],
		activeRoot: null,
		handle: null,
		pending: [],
		lastRouteName: "primary",
		routes: [
			{ name: "primary", tunnelName: PRIMARY_TUNNEL, wsUrl: "wss://primary.invalid" },
			{ name: "rescue", tunnelName: RESCUE_TUNNEL, wsUrl: "wss://rescue.invalid" }
		],
		cycleMs: [],
		counters: {
			cycles: 0,
			admitted: 0,
			receipts: 0,
			enoent: 0,
			eaddrinuse: 0,
			uncaught: 0,
			reconnects: 0,
			promotions: 0,
			quarantines: 0
		}
	};
	state.activeRoot = newRoot(state);
	const onUncaught = () => {
		state.counters.uncaught += 1;
	};
	process.on("uncaughtException", onUncaught);
	state.onUncaught = onUncaught;

	return {
		state,
		controls: () => runControls(state),
		cycle: (index) => runCycle(state, index),
		finish: () => finishRig(state)
	};
}

/**
 * Allocates a fresh install root inside the rig base directory.
 * @param {object} state Rig state.
 * @returns {string} The new root path.
 */
function newRoot(state) {
	const root = path.join(state.baseDir, `install-${state.roots.length}`);
	fs.mkdirSync(root, { recursive: true, mode: 0o700 });
	state.roots.push(root);
	return root;
}

/**
 * Releases the currently held singleton handle, if any.
 * @param {object} state Rig state.
 */
function releaseHandle(state) {
	if (state.handle) {
		state.handle.release();
		state.handle = null;
	}
}

/**
 * Plants a dead-owner lock directory to simulate a crashed predecessor.
 * The next acquire must quarantine it and succeed with a fresh owner.
 * @param {object} state Rig state.
 * @returns {string} The dead token that was planted.
 */
function plantStaleLock(state) {
	const lockDir = path.join(state.activeRoot, Singleton.LOCK_DIRECTORY);
	fs.mkdirSync(lockDir, { recursive: true, mode: 0o700 });
	const deadToken = crypto.randomUUID();
	const stamp = new Date().toISOString();
	fs.writeFileSync(
		path.join(lockDir, "owner.json"),
		JSON.stringify({
			token: deadToken,
			pid: DEAD_PID,
			startedAt: stamp,
			updatedAt: stamp,
			signature: "dead-vessel",
			argv: []
		})
	);
	return deadToken;
}

/**
 * Negative controls proving the torture assertions are not vacuous:
 * the EADDRINUSE detector fires, the supervisor classifier flags a duplicate,
 * and the single-owner assertion rejects a violated owner set.
 * @param {object} state Rig state.
 */
async function runControls(state) {
	const assert = require("node:assert/strict");
	// 1. EADDRINUSE detection really fires when a port is held.
	const holder = await listenOnce(HTTP_PORT);
	let caught = null;
	try {
		await listenOnce(HTTP_PORT);
	} catch (error) {
		caught = error;
	}
	assert(caught && caught.code === "EADDRINUSE", "EADDRINUSE control did not fire");
	await closeServer(holder);
	// 2. The supervisor classifier flags a duplicate owner as unhealthy.
	const table = [
		{ pid: process.pid, command: "node agent" },
		{ pid: 99991, command: "node agent" }
	];
	const classified = BootResumePolicy.classifySupervisors(table, {
		expectedOwnerPid: process.pid,
		journal: []
	});
	const verdict = BootResumePolicy.supervisorHealthVerdict(classified);
	assert.equal(verdict.healthy, false, "classifier missed a duplicate supervisor");
	assert.equal(
		verdict.counts[BootResumePolicy.SUPERVISOR_ROLES.STALE_DUPLICATE],
		1,
		"duplicate not classified STALE_DUPLICATE"
	);
	// 3. assertExpectedSingleOwner rejects a violated owner set.
	const bad = BootResumePolicy.assertExpectedSingleOwner(
		{},
		{ ownerPids: [process.pid, 99991], expectedOwnerPid: process.pid, reason: "torture-control" }
	);
	assert.equal(bad.ok, false, "single-owner assertion missed a violation");
	const good = BootResumePolicy.assertExpectedSingleOwner(
		{},
		{ ownerPids: [process.pid], expectedOwnerPid: process.pid, reason: "torture-control" }
	);
	assert.equal(good.ok, true, "single-owner assertion rejected a clean owner set");
	state.log("info", "negative controls green: EADDRINUSE, duplicate-supervisor, owner-violation");
}

/**
 * Runs one restart/reinstall cycle through the real hardened modules.
 * @param {object} state Rig state.
 * @param {number} index Zero-based cycle index.
 */
async function runCycle(state, index) {
	const assert = require("node:assert/strict");
	const startedAt = Date.now();
	const kind =
		index > 0 && index % 8 === 7 ? "reinstall" : index % 5 === 4 ? "crash" : "restart";
	let deadToken = null;
	try {
		if (kind === "reinstall") {
			releaseHandle(state);
			state.activeRoot = newRoot(state);
			state.log("info", `cycle ${index}: reinstall onto ${state.activeRoot}`);
		}
		if (kind === "crash") {
			deadToken = plantStaleLock(state);
			state.log("info", `cycle ${index}: simulating crashed predecessor`);
		}
		// Boot recovery: settle any in-flight mailbox commands BEFORE taking ownership.
		await recoverPending(state);
		// HTTP singleton acquire; a second acquire must dedupe to the same handle.
		const acquired = Singleton.acquire(state.activeRoot, { heartbeatMs: 60 });
		assert(acquired && acquired.ok, `cycle ${index}: singleton acquire failed`);
		const duplicate = Singleton.acquire(state.activeRoot, { heartbeatMs: 60 });
		assert(
			duplicate && duplicate.ok && duplicate.owner.token === acquired.owner.token,
			`cycle ${index}: duplicate supervisor handle created`
		);
		if (kind === "crash") {
			assert.notEqual(acquired.owner.token, deadToken, `cycle ${index}: stale lock not quarantined`);
			state.counters.quarantines += 1;
		}
		state.handle = acquired;
		checkBootResumePolicy(state, index);
		observeRoutes(state, index);
		await bindHttpPort(state, index);
		admitCommands(state, index);
		filesystemActivity(state, index);
		await idlePhase(state);
		assertMidCycleInvariants(state, index);
		releaseHandle(state);
		assertPostReleaseClean(state, index);
	} catch (error) {
		if (error && error.code === "ENOENT") state.counters.enoent += 1;
		throw error;
	} finally {
		const ms = Date.now() - startedAt;
		state.cycleMs.push(ms);
		state.counters.cycles += 1;
		assert(ms < CYCLE_BUDGET_MS, `cycle ${index} exceeded recovery budget: ${ms}ms`);
		assertLogBounded(state);
	}
}

/**
 * Settles in-flight mailbox commands left by earlier cycles (real boot recovery).
 * @param {object} state Rig state.
 */
async function recoverPending(state) {
	const assert = require("node:assert/strict");
	for (const item of state.pending.splice(0)) {
		const full = path.join(item.root, item.rel);
		const observed = MailboxIO.read(full);
		assert(observed, `pending command vanished: ${item.rel}`);
		MailboxIO.verify(full, Buffer.from(item.body, "utf8"));
		const receiptPath = path.join(item.root, `mailbox/rcpt-${item.id}.json`);
		MailboxIO.atomicWrite(receiptPath, JSON.stringify({ id: item.id, receipt: true }));
		MailboxIO.remove(full);
		state.counters.receipts += 1;
		state.log("info", `recovered in-flight command ${item.id}`);
	}
}

/**
 * Exercises the boot-resume policy through a restart boundary.
 * @param {object} state Rig state.
 * @param {number} index Cycle index.
 */
function checkBootResumePolicy(state, index) {
	const assert = require("node:assert/strict");
	const interval = BootResumePolicy.interval({});
	assert(
		interval >= BootResumePolicy.MIN_INTERVAL_MS && interval <= BootResumePolicy.MAX_INTERVAL_MS,
		`cycle ${index}: boot-resume interval out of bounds: ${interval}`
	);
	const binding = BootResumePolicy.usableBinding(
		{ root: state.activeRoot },
		{ projectRoot: state.activeRoot }
	);
	assert(binding && binding.projectRoot, `cycle ${index}: binding lost across restart`);
	// Promotion/handoff classification over the live owner set: exactly one owner.
	const classified = BootResumePolicy.classifySupervisors(
		[{ pid: process.pid, command: "node agent" }],
		{ expectedOwnerPid: process.pid, journal: [] }
	);
	const verdict = BootResumePolicy.supervisorHealthVerdict(classified);
	assert.equal(verdict.healthy, true, `cycle ${index}: supervisor verdict unhealthy`);
	assert.equal(
		verdict.counts[BootResumePolicy.SUPERVISOR_ROLES.CURRENT_OWNER],
		1,
		`cycle ${index}: expected exactly one current owner`
	);
	const ownerCheck = BootResumePolicy.assertExpectedSingleOwner(
		{},
		{ ownerPids: [process.pid], expectedOwnerPid: process.pid, reason: "torture-cycle" }
	);
	assert.equal(ownerCheck.ok, true, `cycle ${index}: single-owner assertion failed`);
}

/**
 * Recreates the route elector from the persisted route config each cycle and
 * feeds it seeded liveness, tracking promotion/handoff changes.
 * @param {object} state Rig state.
 * @param {number} index Cycle index.
 */
function observeRoutes(state, index) {
	const assert = require("node:assert/strict");
	assert.equal(
		state.routes[0].tunnelName,
		PRIMARY_TUNNEL,
		`cycle ${index}: tunnel identity mutated`
	);
	const elector = RouteElector.createRouteElector({
		routes: state.routes,
		log: (level, message) => state.log(level, `[elector] ${message}`)
	});
	const observations = 1 + Math.floor(state.rng() * 3);
	for (let i = 0; i < observations; i += 1) {
		const primaryAlive = state.rng() > 0.35;
		elector.observe({ primary: { alive: primaryAlive }, rescue: { alive: true } });
		const current = elector.current();
		assert(
			current && (current.tunnelName === PRIMARY_TUNNEL || current.tunnelName === RESCUE_TUNNEL),
			`cycle ${index}: elector handed off to an unknown tunnel`
		);
		if (current.name !== state.lastRouteName) {
			state.counters.promotions += 1;
			state.log("info", `cycle ${index}: route ${state.lastRouteName} -> ${current.name}`);
			state.lastRouteName = current.name;
		}
	}
}

/**
 * Binds the fixed HTTP port for one cycle and releases it, proving no
 * EADDRINUSE leaks across restarts.
 * @param {object} state Rig state.
 * @param {number} index Cycle index.
 */
async function bindHttpPort(state, index) {
	const assert = require("node:assert/strict");
	let server;
	try {
		server = await listenOnce(HTTP_PORT);
	} catch (error) {
		if (error && error.code === "EADDRINUSE") state.counters.eaddrinuse += 1;
		throw new Error(`cycle ${index}: HTTP singleton port collision: ${error && error.code}`);
	}
	await closeServer(server);
}

/**
 * Admits seeded commands through mailbox write/verify, then receipt/remove.
 * One command per cycle may stay in-flight to exercise cross-restart recovery.
 * @param {object} state Rig state.
 * @param {number} index Cycle index.
 */
function admitCommands(state, index) {
	const assert = require("node:assert/strict");
	const mailboxDir = path.join(state.activeRoot, "mailbox");
	fs.mkdirSync(mailboxDir, { recursive: true, mode: 0o700 });
	const count = 1 + Math.floor(state.rng() * 4);
	for (let j = 0; j < count; j += 1) {
		const id = `c${index}-${j}`;
		const body = JSON.stringify({
			id,
			cycle: index,
			nonce: Math.floor(state.rng() * 0xffffffff).toString(16)
		});
		const rel = `mailbox/cmd-${id}.json`;
		const full = path.join(state.activeRoot, rel);
		const written = MailboxIO.atomicWrite(full, body);
		assert(written && written.sha256, `cycle ${index}: mailbox write unverified for ${id}`);
		MailboxIO.verify(full, Buffer.from(body, "utf8"));
		state.counters.admitted += 1;
		const holdBack = j === count - 1 && state.rng() > 0.6;
		if (holdBack) {
			state.pending.push({ root: state.activeRoot, rel, body, id });
			state.log("info", `cycle ${index}: command ${id} held in-flight`);
			continue;
		}
		const receiptPath = path.join(mailboxDir, `rcpt-${id}.json`);
		MailboxIO.atomicWrite(receiptPath, JSON.stringify({ id, receipt: true }));
		const removed = MailboxIO.remove(full);
		assert(removed && removed.removed, `cycle ${index}: mailbox remove failed for ${id}`);
		state.counters.receipts += 1;
	}
	// Missing mailbox paths must never throw uncaught ENOENTs.
	const missing = path.join(mailboxDir, "no-such-record.json");
	assert.equal(MailboxIO.read(missing), null, `cycle ${index}: read of missing record threw`);
	const gone = MailboxIO.remove(missing);
	assert(gone && gone.removed === false, `cycle ${index}: remove of missing record threw`);
}

/**
 * Interleaves raw filesystem activity between command batches.
 * @param {object} state Rig state.
 * @param {number} index Cycle index.
 */
function filesystemActivity(state, index) {
	const dir = path.join(state.activeRoot, "scratch");
	fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
	const count = Math.floor(state.rng() * 4);
	for (let j = 0; j < count; j += 1) {
		const file = path.join(dir, `activity-${index}-${j}.bin`);
		fs.writeFileSync(file, crypto.randomBytes(64 + Math.floor(state.rng() * 192)));
	}
	for (let j = 0; j < count; j += 1) {
		fs.unlinkSync(path.join(dir, `activity-${index}-${j}.bin`));
	}
}

/**
 * Idles briefly while the watchdog keeps deciding, proving idle periods are safe.
 * @param {object} state Rig state.
 */
async function idlePhase(state) {
	const assert = require("node:assert/strict");
	await sleep(5 + Math.floor(state.rng() * 20));
	for (let i = 0; i < 2; i += 1) {
		const opened = state.rng() > 0.4;
		const decision = Watchdog.inspect({
			ws: { opened, closed: !opened },
			staleMs: Math.floor(state.rng() * 60000),
			stats: () => ({}),
			identity: { pid: process.pid },
			lastSuccessfulActionAt: opened ? Date.now() - 1000 : null
		});
		assert(decision && typeof decision.shouldReconnect === "boolean", "watchdog decision malformed");
		assert(decision.health && typeof decision.health.state === "string", "watchdog health missing");
		if (decision.shouldReconnect) state.counters.reconnects += 1;
	}
}

/**
 * Mid-cycle invariants, asserted while the singleton lease is held.
 * @param {object} state Rig state.
 * @param {number} index Cycle index.
 */
function assertMidCycleInvariants(state, index) {
	const assert = require("node:assert/strict");
	const registry = Singleton.globalRegistry();
	for (const root of state.roots) {
		const entry = registry.get(path.resolve(root));
		if (path.resolve(root) === path.resolve(state.activeRoot)) {
			assert(
				entry && entry.owner.token === state.handle.owner.token,
				`cycle ${index}: active root has no single owner`
			);
		} else {
			assert.equal(entry, undefined, `cycle ${index}: released root still owns a lease`);
		}
	}
	const ownerFile = path.join(state.activeRoot, Singleton.LOCK_DIRECTORY, "owner.json");
	const owner = JSON.parse(fs.readFileSync(ownerFile, "utf8"));
	assert.equal(owner.pid, process.pid, `cycle ${index}: lock owner pid mismatch`);
	assert.equal(owner.token, state.handle.owner.token, `cycle ${index}: lock owner token mismatch`);
	assert.equal(state.routes[0].tunnelName, PRIMARY_TUNNEL, `cycle ${index}: identity lost`);
	assert.equal(state.counters.enoent, 0, `cycle ${index}: uncaught mailbox ENOENT`);
	assert.equal(state.counters.eaddrinuse, 0, `cycle ${index}: EADDRINUSE crash`);
	assert.equal(state.counters.uncaught, 0, `cycle ${index}: uncaught exception`);
	assert.equal(
		state.counters.receipts + state.pending.length,
		state.counters.admitted,
		`cycle ${index}: lost command (admitted=${state.counters.admitted} receipts=${state.counters.receipts} pending=${state.pending.length})`
	);
	for (const item of state.pending) {
		assert(MailboxIO.read(path.join(item.root, item.rel)), `cycle ${index}: pending command unreadable`);
	}
}

/**
 * Post-release invariants: no lease or lock directory may survive release.
 * @param {object} state Rig state.
 * @param {number} index Cycle index.
 */
function assertPostReleaseClean(state, index) {
	const assert = require("node:assert/strict");
	const registry = Singleton.globalRegistry();
	assert.equal(
		registry.get(path.resolve(state.activeRoot)),
		undefined,
		`cycle ${index}: lease survived release`
	);
	assert.equal(
		fs.existsSync(path.join(state.activeRoot, Singleton.LOCK_DIRECTORY)),
		false,
		`cycle ${index}: lock directory survived release`
	);
}

/**
 * Asserts the collected log output stays bounded.
 * @param {object} state Rig state.
 */
function assertLogBounded(state) {
	const assert = require("node:assert/strict");
	const bytes = Buffer.byteLength(JSON.stringify(state.logLines), "utf8");
	assert(bytes < LOG_BYTE_BOUND, `log output unbounded: ${bytes} bytes`);
	assert(state.logLines.length < LOG_LINE_BOUND, `log lines unbounded: ${state.logLines.length}`);
}

/**
 * Drains in-flight commands, removes the temp tree, and returns the summary.
 * @param {object} state Rig state.
 * @returns {object} Torture summary.
 */
function finishRig(state) {
	const assert = require("node:assert/strict");
	for (const item of state.pending.splice(0)) {
		const full = path.join(item.root, item.rel);
		const observed = MailboxIO.read(full);
		assert(observed, `final drain: pending command vanished: ${item.rel}`);
		MailboxIO.atomicWrite(
			path.join(item.root, `mailbox/rcpt-${item.id}.json`),
			JSON.stringify({ id: item.id, receipt: true })
		);
		MailboxIO.remove(full);
		state.counters.receipts += 1;
	}
	assert.equal(state.counters.receipts, state.counters.admitted, "final: lost commands");
	assert.equal(state.counters.enoent, 0, "final: uncaught mailbox ENOENTs");
	assert.equal(state.counters.eaddrinuse, 0, "final: EADDRINUSE crashes");
	assert.equal(state.counters.uncaught, 0, "final: uncaught exceptions");
	process.removeListener("uncaughtException", state.onUncaught);
	const maxCycleMs = Math.max(...state.cycleMs);
	const logBytes = Buffer.byteLength(JSON.stringify(state.logLines), "utf8");
	fs.rmSync(state.baseDir, { recursive: true, force: true });
	return {
		seed: state.seed,
		cycles: state.counters.cycles,
		admitted: state.counters.admitted,
		receipts: state.counters.receipts,
		pending: state.pending.length,
		quarantines: state.counters.quarantines,
		reconnects: state.counters.reconnects,
		promotions: state.counters.promotions,
		maxCycleMs,
		cycleBudgetMs: CYCLE_BUDGET_MS,
		logLines: state.logLines.length,
		logBytes,
		identity: PRIMARY_TUNNEL
	};
}

module.exports = {
	createRig,
	PRIMARY_TUNNEL,
	RESCUE_TUNNEL,
	HTTP_PORT,
	CYCLE_BUDGET_MS,
	TOTAL_BUDGET_MS,
	LOG_BYTE_BOUND,
	LOG_LINE_BOUND
};
