// B"H
// Boruch Hashem
// Blessed is He

const childProcess = require("node:child_process");
const net = require("node:net");
const { promisify } = require("node:util");

const execFile = promisify(childProcess.execFile);
const LAUNCHES = new Map();

function register(info = {}) {
	const port = Number(info.port);
	const pid = Number(info.pid);
	if (!Number.isInteger(port) || !Number.isInteger(pid)) return null;
	const record = {
		port,
		pid,
		userDataDir: String(info.userDataDir || ""),
		registeredAt: new Date().toISOString()
	};
	LAUNCHES.set(port, record);
	return record;
}

function snapshot() {
	return [...LAUNCHES.values()].map(record => ({ ...record }));
}

async function freeTcpPort() {
	const server = net.createServer();
	await new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(0, "127.0.0.1", resolve);
	});
	const port = server.address().port;
	await new Promise(resolve => server.close(resolve));
	return port;
}

async function stopOwned(payload = {}) {
	const port = Number(payload.port || 0);
	const requestedPid = Number(payload.pid || payload.launchPid || 0);
	const record = Number.isInteger(port) && LAUNCHES.get(port)
		|| [...LAUNCHES.values()].find(item => item.pid === requestedPid);
	if (!record) {
		return {
			ok: true,
			action: "chromeStop",
			owned: false,
			alreadyStopped: true,
			port: Number.isInteger(port) ? port : null
		};
	}
	const pids = [...new Set([
		record.pid,
		...await relatedProcessIds(record)
	])].filter(pid => Number.isInteger(pid) && pid > 1 && pid !== process.pid);
	await terminate(pids, false);
	let stopped = await waitForClosed(record.port, bounded(payload.timeoutMs, 4000));
	let forced = false;
	if (!stopped && payload.force !== false) {
		forced = true;
		await terminate(pids, true);
		stopped = await waitForClosed(record.port, bounded(payload.forceTimeoutMs, 3000));
	}
	if (stopped) LAUNCHES.delete(record.port);
	return {
		ok: stopped,
		action: "chromeStop",
		owned: true,
		port: record.port,
		pid: record.pid,
		pids,
		stopped,
		forced,
		error: stopped ? undefined : "chrome_port_still_listening"
	};
}

async function relatedProcessIds(record) {
	if (process.platform === "win32" || !record.userDataDir) return [];
	try {
		const { stdout } = await execFile("ps", ["-axo", "pid=,command="], {
			encoding: "utf8",
			maxBuffer: 4 * 1024 * 1024
		});
		return String(stdout).split(/\r?\n/).map(line => {
			const match = line.match(/^\s*(\d+)\s+(.+)$/);
			return match && match[2].includes(record.userDataDir)
				? Number(match[1])
				: null;
		}).filter(Number.isInteger);
	} catch {
		return [];
	}
}

async function terminate(pids, force) {
	if (process.platform === "win32") {
		await Promise.all(pids.map(pid => execFile(
			"taskkill",
			["/PID", String(pid), "/T", ...(force ? ["/F"] : [])]
		).catch(() => null)));
		return;
	}
	for (const pid of pids) {
		try { process.kill(pid, force ? "SIGKILL" : "SIGTERM"); } catch {}
	}
}

async function waitForClosed(port, timeoutMs) {
	const startedAt = Date.now();
	while (Date.now() - startedAt < timeoutMs) {
		if (!await canConnect(port)) return true;
		await new Promise(resolve => setTimeout(resolve, 100));
	}
	return !await canConnect(port);
}

function canConnect(port) {
	return new Promise(resolve => {
		const socket = net.createConnection({ host: "127.0.0.1", port });
		const finish = value => {
			socket.removeAllListeners();
			socket.destroy();
			resolve(value);
		};
		socket.setTimeout(400, () => finish(false));
		socket.once("connect", () => finish(true));
		socket.once("error", () => finish(false));
	});
}

function bounded(value, fallback) {
	const number = Number(value ?? fallback);
	return Number.isFinite(number)
		? Math.max(250, Math.min(15000, Math.floor(number)))
		: fallback;
}

module.exports = {
	freeTcpPort,
	register,
	snapshot,
	stopOwned,
	waitForClosed
};
