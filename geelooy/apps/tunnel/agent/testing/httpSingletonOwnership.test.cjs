// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");

/**
 * @file Proves the recovery HTTP lane holds single ownership of its port.
 * @description
 * Spawns real httpServer.js processes against a temp recovery root: a second
 * instance with a live owner must exit 0 (never EADDRINUSE), a stale lockfile
 * must be taken over cleanly, and rapid restarts must elect exactly one owner
 * with no crash loop.
 */

const SERVER = path.join(__dirname, "..", "recovery", "lanes", "httpServer.js");
const PORT_CANDIDATES = [48741, 48742, 48743, 48744, 48745];

const children = new Set();

function lockPath(root, port) {
	return path.join(root, `http-lane-${port}.lock`);
}

function pickPort() {
	return new Promise((resolve, reject) => {
		let pending = PORT_CANDIDATES.length;
		for (const port of PORT_CANDIDATES) {
			const socket = net.connect({ host: "127.0.0.1", port });
			socket.once("connect", () => {
				socket.destroy();
				if (--pending === 0) reject(new Error("no free test port"));
			});
			socket.once("error", () => {
				socket.destroy();
				resolve(port);
			});
		}
	});
}

function spawnServer(root, port) {
	const child = spawn(process.execPath, [SERVER], {
		env: {
			...process.env,
			AWTSMOOS_RECOVERY_ROOT: root,
			AWTSMOOS_RECOVERY_HTTP_PORT: String(port)
		},
		stdio: ["ignore", "pipe", "pipe"]
	});
	child.output = "";
	child.stdout.on("data", d => {
		child.output += d;
	});
	child.stderr.on("data", d => {
		child.output += d;
	});
	children.add(child);
	child.once("exit", () => children.delete(child));
	return child;
}

function waitPort(port, timeoutMs = 15000) {
	const deadline = Date.now() + timeoutMs;
	return new Promise((resolve, reject) => {
		const probe = () => {
			const socket = net.connect({ host: "127.0.0.1", port });
			socket.once("connect", () => {
				socket.destroy();
				resolve();
			});
			socket.once("error", () => {
				socket.destroy();
				if (Date.now() > deadline) return reject(new Error(`port ${port} never became ready`));
				setTimeout(probe, 100);
			});
		};
		probe();
	});
}

function waitExit(child, timeoutMs = 15000) {
	if (child.exitCode !== null) return Promise.resolve(child.exitCode);
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => reject(new Error("child never exited")), timeoutMs);
		child.once("exit", code => {
			clearTimeout(timer);
			resolve(code);
		});
	});
}

function getStatus(port) {
	return new Promise((resolve, reject) => {
		const request = http.get({ host: "127.0.0.1", port, path: "/status", timeout: 3000 }, response => {
			response.resume();
			response.once("end", () => resolve(response.statusCode));
		});
		request.once("error", reject);
		request.once("timeout", () => {
			request.destroy(new Error("status request timed out"));
		});
	});
}

function killAll() {
	for (const child of [...children]) {
		try {
			child.kill("SIGKILL");
		} catch {}
	}
	children.clear();
}

function deadPid() {
	for (const pid of [99999, 199999, 299999]) {
		try {
			process.kill(pid, 0);
		} catch {
			return pid;
		}
	}
	throw new Error("could not find a dead pid");
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-http-single-"));
	const port = await pickPort();
	console.log(`B"H httpSingletonOwnership: root=${root} port=${port}`);
	try {
		// (a) A second instance with a live owner exits 0 without EADDRINUSE.
		const owner = spawnServer(root, port);
		await waitPort(port);
		const lock = JSON.parse(fs.readFileSync(lockPath(root, port), "utf8"));
		assert.equal(lock.pid, owner.pid, "lockfile names the owner pid");
		const second = spawnServer(root, port);
		const secondCode = await waitExit(second);
		assert.equal(secondCode, 0, "second instance exits 0 with a live owner");
		assert.doesNotMatch(second.output, /EADDRINUSE/, "no EADDRINUSE in second instance output");
		assert.match(second.output, /standby/, "second instance reports standby");
		assert.equal(owner.exitCode, null, "owner keeps running");
		await getStatus(port).then(code => assert.equal(code, 401, "owner still serves"));
		owner.kill("SIGKILL");
		await waitExit(owner);
		console.log('B"H case (a) green: live owner -> newcomer exits 0, no EADDRINUSE');

		// (a2) A responsive unknown owner without any lock becomes safe standby.
		fs.rmSync(lockPath(root, port), { force: true });
		const unknownOwner = http.createServer((request, response) => {
			response.writeHead(204);
			response.end();
		});
		await new Promise((resolve, reject) => {
			unknownOwner.once("error", reject);
			unknownOwner.listen(port, "127.0.0.1", resolve);
		});
		const unknownContender = spawnServer(root, port);
		const unknownCode = await waitExit(unknownContender);
		assert.equal(unknownCode, 0, "unknown responsive owner makes contender exit 0");
		assert.doesNotMatch(unknownContender.output, /EADDRINUSE/, "unknown-owner race never emits EADDRINUSE");
		assert.match(unknownContender.output, /standby/, "unknown-owner contender reports standby");
		await new Promise(resolve => unknownOwner.close(resolve));
		console.log('B"H case (a2) green: responsive owner without lock -> standby, no crash loop');

		// (b) A stale lockfile is taken over cleanly and the lane serves.
		fs.rmSync(lockPath(root, port), { force: true });
		const staleAt = Date.now() - 60000;
		fs.writeFileSync(lockPath(root, port), JSON.stringify({
			pid: deadPid(),
			startedAt: staleAt,
			heartbeatAt: staleAt,
			host: "127.0.0.1",
			port
		}) + "\n");
		const taker = spawnServer(root, port);
		await waitPort(port);
		const taken = JSON.parse(fs.readFileSync(lockPath(root, port), "utf8"));
		assert.equal(taken.pid, taker.pid, "stale lock taken over by the newcomer");
		assert.equal(await getStatus(port), 401, "taken-over lane serves");
		taker.kill("SIGKILL");
		await waitExit(taker);
		console.log('B"H case (b) green: stale lock -> clean takeover, lane serves');

		// (c) Rapid restarts elect exactly one owner; nobody crash-loops.
		fs.rmSync(lockPath(root, port), { force: true });
		const racers = [];
		for (let i = 0; i < 5; i++) racers.push(spawnServer(root, port));
		await sleep(3000);
		const survivors = racers.filter(c => c.exitCode === null);
		assert.equal(survivors.length, 1, "exactly one owner survives the race");
		for (const racer of racers) {
			if (racer.exitCode !== null) {
				assert.equal(racer.exitCode, 0, "loser exits 0");
				assert.doesNotMatch(racer.output, /EADDRINUSE/, "no EADDRINUSE in loser output");
			}
		}
		await getStatus(port).then(code => assert.equal(code, 401, "race winner serves"));
		// Rapid kill-and-respawn cycles with zero delay between them.
		for (let i = 0; i < 3; i++) {
			survivors[0].kill("SIGKILL");
			await waitExit(survivors[0]);
			const next = spawnServer(root, port);
			await waitPort(port);
			const current = JSON.parse(fs.readFileSync(lockPath(root, port), "utf8"));
			assert.equal(current.pid, next.pid, `respawn ${i} owns the lock`);
			survivors[0] = next;
		}
		assert.equal(await getStatus(port), 401, "respawned lane serves");
		console.log('B"H case (c) green: rapid restarts elect one owner, zero crash-loops');
	} finally {
		killAll();
		fs.rmSync(root, { recursive: true, force: true });
	}
	console.log('B"H httpSingletonOwnership: ALL GREEN');
})().catch(error => {
	killAll();
	console.error(`httpSingletonOwnership FAILED: ${error && error.stack || error}`);
	process.exit(1);
});
