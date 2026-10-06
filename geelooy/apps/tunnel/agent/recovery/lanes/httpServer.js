// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const path = require("node:path");
const Kernel = require("../boundedKernel.js");
const Auth = require("./localAuth.js");
const LocalRequest = require("./localRequest.js");

const MAX_BODY_BYTES = 16384;
/**
 * Single-owner lease for the recovery HTTP lane.
 * @description
 * Many recovery processes once raced for 127.0.0.1:48731 and crash-looped on
 * EADDRINUSE while a stale owner stayed alive. Exactly one process may hold the
 * lane: it claims an exclusive lockfile (PID + heartbeat) in the recovery state
 * dir before binding. A newcomer that finds a healthy owner stands by and exits
 * 0; a newcomer that finds a stale owner takes over after a bounded grace.
 */
const HEARTBEAT_INTERVAL_MS = 1000;
const OWNER_STALE_MS = 5000;
const TAKEOVER_GRACE_MS = 500;
const CLAIM_ATTEMPTS = 5;
const PORT_PROBE_TIMEOUT_MS = 300;
const BIND_RETRY_GRACE_MS = 500;

/**
 * @file Serves one token-authenticated loopback-only bounded recovery lane.
 * @description
 * The Awtsmoos lets localhost carry medicine without carrying arbitrary commands;
 * Awtsmoos.com binds only 127.0.0.1 and checks its own recovery token before healing hands.
 */
function create(options = {}) {
	const kernel = options.kernel || Kernel.create(options);
	const token = options.token || Auth.token(kernel.recoveryRoot);
	const host = "127.0.0.1";
	const port = boundedPort(options.port || process.env.AWTSMOOS_RECOVERY_HTTP_PORT || 48731);
	const lockPath = path.join(kernel.recoveryRoot, `http-lane-${port}.lock`);
	const server = http.createServer((request, response) => {
		void handleRequest(request, response, kernel, token);
	});
	return { host, port, server, lockPath, start: () => start(server, host, port, lockPath) };
}

/**
 * Starts the lane after winning single ownership of the port.
 * @description
 * Resolves `{ host, port }` for the owner, or `{ host, port, standby: true, ownerPid }`
 * when a healthy owner already holds the lane. Never crash-loops on EADDRINUSE:
 * a bind conflict against a live owner becomes a clean standby.
 */
async function start(server, host, port, lockPath) {
	const claim = await claimOwnership({ host, port, lockPath });
	if (claim.standby) {
		console.log(`B"H recovery HTTP standby: healthy owner on ${host}:${port} (pid ${claim.ownerPid})`);
		return { host, port, standby: true, ownerPid: claim.ownerPid };
	}
	const release = beginOwnership(lockPath);
	try {
		return await listen(server, port, host);
	} catch (error) {
		if (error && error.code === "EADDRINUSE") {
			const conflict = await handleBindConflict({ host, port, lockPath });
			if (conflict.standby) {
				release();
				console.log(`B"H recovery HTTP standby: healthy owner on ${host}:${port} (pid ${conflict.ownerPid})`);
				return { host, port, standby: true, ownerPid: conflict.ownerPid };
			}
			await sleep(BIND_RETRY_GRACE_MS);
			try {
				return await listen(server, port, host);
			} catch (retryError) {
				release();
				throw retryError;
			}
		}
		release();
		throw error;
	}
}

/**
 * Claims the exclusive lane lock before binding.
 * @description
 * Uses atomic exclusive file creation so simultaneous newcomers elect exactly
 * one winner. A healthy existing owner (live PID, fresh heartbeat) means the
 * newcomer stands by. A stale owner (dead PID or expired heartbeat) is removed
 * after a bounded grace and the newcomer takes over.
 */
async function claimOwnership({ host, port, lockPath }) {
	for (let attempt = 0; attempt < CLAIM_ATTEMPTS; attempt++) {
		const record = newOwnershipRecord(host, port);
		try {
			writeOwnershipExclusive(lockPath, record);
			return { standby: false };
		} catch (error) {
			if (!error || error.code !== "EEXIST") throw error;
		}
		const existing = readOwnership(lockPath);
		if (existing && ownershipHealthy(existing)) {
			return { standby: true, ownerPid: existing.pid };
		}
		await sleep(TAKEOVER_GRACE_MS);
		try {
			fs.unlinkSync(lockPath);
		} catch {
			// Another contender may have removed or replaced it; re-attempt.
		}
	}
	if (await portResponds(host, port)) {
		const existing = readOwnership(lockPath);
		return { standby: true, ownerPid: existing && existing.pid };
	}
	throw new Error("recovery_http_ownership_contended");
}

/**
 * Decides a bind conflict in favor of the live lock owner.
 * @description
 * Backstop for the case where the port is busy but no lock was claimable:
 * if another live process holds a fresh lease, stand by instead of throwing
 * EADDRINUSE into a crash loop.
 */
async function handleBindConflict({ host, port, lockPath }) {
	const existing = readOwnership(lockPath);
	if (existing && existing.pid !== process.pid && ownershipHealthy(existing)) {
		return { standby: true, ownerPid: existing.pid };
	}
	return { standby: false };
}

/**
 * Reports whether a lock record describes a live, heartbeating owner.
 */
function ownershipHealthy(record) {
	if (!record || !Number.isInteger(record.pid) || record.pid <= 0) return false;
	if (!pidAlive(record.pid)) return false;
	if (!Number.isFinite(record.heartbeatAt)) return false;
	return Date.now() - record.heartbeatAt <= OWNER_STALE_MS;
}

/**
 * Reports whether a PID is alive without signaling it.
 */
function pidAlive(pid) {
	try {
		process.kill(pid, 0);
		return true;
	} catch (error) {
		return Boolean(error) && error.code === "EPERM";
	}
}

/**
 * Probes whether anything currently accepts TCP on the lane port.
 */
function portResponds(host, port) {
	return new Promise(resolve => {
		const socket = net.connect({ host, port });
		const done = ok => {
			socket.destroy();
			resolve(ok);
		};
		socket.once("connect", () => done(true));
		socket.once("error", () => done(false));
		socket.setTimeout(PORT_PROBE_TIMEOUT_MS, () => done(false));
	});
}

/**
 * Begins the owner heartbeat and shutdown cleanup; returns a release function.
 * @description
 * The owner refreshes its heartbeat so contenders see a fresh lease, and removes
 * the lockfile on clean shutdown so the next launcher start takes over at once.
 */
function beginOwnership(lockPath) {
	const timer = setInterval(() => {
		try {
			const record = readOwnership(lockPath);
			if (record && record.pid === process.pid) {
				writeOwnership(lockPath, { ...record, heartbeatAt: Date.now() });
			}
		} catch {
			// A failed heartbeat write must not crash the lane; the lease simply ages.
		}
	}, HEARTBEAT_INTERVAL_MS);
	if (typeof timer.unref === "function") timer.unref();
	let released = false;
	const release = () => {
		if (released) return;
		released = true;
		clearInterval(timer);
		releaseOwnership(lockPath);
	};
	process.once("exit", release);
	process.once("SIGINT", () => {
		release();
		process.exit(0);
	});
	process.once("SIGTERM", () => {
		release();
		process.exit(0);
	});
	return release;
}

function newOwnershipRecord(host, port) {
	const now = Date.now();
	return { pid: process.pid, startedAt: now, heartbeatAt: now, host, port };
}

function readOwnership(lockPath) {
	try {
		const record = JSON.parse(fs.readFileSync(lockPath, "utf8"));
		return record && typeof record === "object" ? record : null;
	} catch {
		return null;
	}
}

function writeOwnership(lockPath, record) {
	fs.mkdirSync(path.dirname(lockPath), { recursive: true });
	fs.writeFileSync(lockPath, `${JSON.stringify(record)}\n`);
}

function writeOwnershipExclusive(lockPath, record) {
	fs.mkdirSync(path.dirname(lockPath), { recursive: true });
	fs.writeFileSync(lockPath, `${JSON.stringify(record)}\n`, { flag: "wx" });
}

/**
 * Removes the lockfile, but only when it still names this process.
 */
function releaseOwnership(lockPath) {
	try {
		const record = readOwnership(lockPath);
		if (record && record.pid === process.pid) fs.unlinkSync(lockPath);
	} catch {
		// Best effort on shutdown; a stale lock is reclaimed by the next contender.
	}
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function handleRequest(request, response, kernel, token) {
	const supplied = String(request.headers["x-awtsmoos-recovery-token"] || "");
	if (!Auth.matches(token, supplied)) return json(response, 401, { ok: false, error: "unauthorized" });
	if (request.method === "GET" && request.url === "/status") {
		return json(response, 200, kernel.execute("status"));
	}
	if (request.method !== "POST" || request.url !== "/replace") {
		return json(response, 404, { ok: false, error: "recovery_route_not_found" });
	}
	const body = await readBody(request);
	if (!body.ok) return json(response, body.status, body);
	const result = LocalRequest.handle(kernel, token, {
		token,
		action: "replace",
		payload: body.value
	});
	return json(response, result.ok === false ? 409 : 200, result);
}

function readBody(request) {
	return new Promise(resolve => {
		let text = "";
		request.setEncoding("utf8");
		request.on("data", chunk => {
			text += chunk;
			if (Buffer.byteLength(text) > MAX_BODY_BYTES) request.destroy();
		});
		request.on("end", () => {
			if (Buffer.byteLength(text) > MAX_BODY_BYTES) {
				return resolve({ ok: false, status: 413, error: "recovery_body_too_large" });
			}
			try {
				resolve({ ok: true, value: text ? JSON.parse(text) : {} });
			} catch {
				resolve({ ok: false, status: 400, error: "invalid_json" });
			}
		});
		request.on("error", () => resolve({ ok: false, status: 400, error: "request_error" }));
	});
}

function json(response, status, value) {
	response.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" });
	response.end(`${JSON.stringify(value)}\n`);
}

function listen(server, port, host) {
	return new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(port, host, () => resolve({ host, port }));
	});
}

function boundedPort(value) {
	const port = Number(value);
	return Number.isInteger(port) && port >= 1024 && port <= 65535 ? port : 48731;
}

if (require.main === module) {
	create().start().then(result => {
		if (result.standby) return process.exit(0);
		console.log(`B"H recovery HTTP ready on ${result.host}:${result.port}`);
	}).catch(error => {
		console.error(`recovery HTTP failed: ${(error && error.message) || error}`);
		process.exit(1);
	});
}

module.exports = {
	MAX_BODY_BYTES,
	HEARTBEAT_INTERVAL_MS,
	OWNER_STALE_MS,
	TAKEOVER_GRACE_MS,
	boundedPort,
	create,
	handleRequest,
	readBody,
	claimOwnership,
	handleBindConflict,
	ownershipHealthy,
	pidAlive,
	portResponds,
	readOwnership,
	writeOwnership,
	writeOwnershipExclusive,
	releaseOwnership
};
