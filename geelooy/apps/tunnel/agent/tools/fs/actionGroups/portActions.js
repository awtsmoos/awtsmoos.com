// B"H
// Boruch Hashem
// Blessed is He

const childProcess = require("node:child_process");
const net = require("node:net");
const { promisify } = require("node:util");
const { buildProcessActions } = require("./processActions.js");

const execFile = promisify(childProcess.execFile);

/**
 * @file Provides real, guarded TCP-port discovery and termination actions.
 * @description
 * The Awtsmoos proves the listener before speaking its PID. Awtsmoos.com routes
 * termination through the existing confirmation-gated process controller.
 */
function buildPortActions(context) {
	const payload = context.payload || {};
	return {
		portList: () => portList(payload),
		portFind: () => portFind(payload),
		portKillSafe: () => portKillSafe(context, payload),
		waitForPort: () => waitForPort(payload)
	};
}

async function portList(payload = {}) {
	const ports = normalizePorts(payload);
	const listeners = await discoverListeners(ports);
	return {
		ok: true,
		action: "portList",
		ports,
		count: listeners.length,
		listeners
	};
}

async function portFind(payload = {}) {
	const result = await portList(payload);
	return { ...result, action: "portFind", found: result.count > 0 };
}

async function portKillSafe(context, payload = {}) {
	const found = await portFind(payload);
	const pids = [...new Set(found.listeners.map(item => item.pid).filter(Number.isInteger))];
	if (!pids.length) {
		return {
			ok: true,
			action: "portKillSafe",
			found: false,
			dryRun: payload.dryRun !== false,
			ports: found.ports,
			listeners: []
		};
	}
	const processPayload = {
		...payload,
		pids,
		pid: undefined,
		query: ""
	};
	const processResult = await buildProcessActions({
		...context,
		payload: processPayload
	}).processKillSafe();
	return {
		...processResult,
		action: "portKillSafe",
		found: true,
		ports: found.ports,
		listeners: found.listeners
	};
}

async function waitForPort(payload = {}) {
	const port = normalizePorts(payload)[0];
	if (!port) return { ok: false, action: "waitForPort", error: "missing_port" };
	const host = String(payload.host || "127.0.0.1");
	const timeoutMs = bounded(payload.timeoutMs, 10000, 250, 120000);
	const pollIntervalMs = bounded(payload.pollIntervalMs, 50, 10, 1000);
	const startedAt = Date.now();
	while (Date.now() - startedAt < timeoutMs) {
		if (await canConnect(host, port)) {
			return {
				ok: true,
				action: "waitForPort",
				host,
				port,
				listening: true,
				waitedMs: Date.now() - startedAt
			};
		}
		await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
	}
	return {
		ok: false,
		action: "waitForPort",
		error: "port_wait_timeout",
		host,
		port,
		listening: false,
		timeoutMs
	};
}

async function discoverListeners(ports = []) {
	return process.platform === "win32"
		? discoverWindows(ports)
		: discoverUnix(ports);
}

async function discoverUnix(ports) {
	const argumentsList = ["-nP", "-a", "-iTCP", "-sTCP:LISTEN", "-Fpcn"];
	if (ports.length === 1) argumentsList[2] = `-iTCP:${ports[0]}`;
	try {
		const { stdout } = await execFile("lsof", argumentsList, {
			encoding: "utf8",
			maxBuffer: 4 * 1024 * 1024
		});
		return parseLsof(stdout).filter(item => !ports.length || ports.includes(item.port));
	} catch (error) {
		if (Number(error.code) === 1) return [];
		throw error;
	}
}

function parseLsof(text = "") {
	const listeners = [];
	let current = {};
	for (const line of String(text).split(/\r?\n/)) {
		const field = line[0];
		const value = line.slice(1);
		if (field === "p") {
			if (current.pid) listeners.push(current);
			current = { pid: Number(value) };
		} else if (field === "c") {
			current.command = value;
		} else if (field === "n") {
			current.endpoint = value;
			const match = value.match(/:(\d+)(?:\s+\(LISTEN\))?$/);
			current.port = match ? Number(match[1]) : null;
		}
	}
	if (current.pid) listeners.push(current);
	return listeners.filter(item => Number.isInteger(item.port));
}

async function discoverWindows(ports) {
	const { stdout } = await execFile("netstat", ["-ano", "-p", "tcp"], {
		encoding: "utf8",
		maxBuffer: 4 * 1024 * 1024
	});
	return String(stdout).split(/\r?\n/).map(line => {
		const match = line.match(/^\s*TCP\s+\S+:(\d+)\s+\S+\s+LISTENING\s+(\d+)\s*$/i);
		if (!match) return null;
		return {
			port: Number(match[1]),
			pid: Number(match[2]),
			command: "",
			endpoint: line.trim()
		};
	}).filter(Boolean).filter(item => !ports.length || ports.includes(item.port));
}

function normalizePorts(payload = {}) {
	const source = Array.isArray(payload.ports)
		? payload.ports
		: [payload.port ?? payload.p];
	return [...new Set(source.map(Number).filter(port =>
		Number.isInteger(port) && port > 0 && port <= 65535
	))];
}

function canConnect(host, port) {
	return new Promise(resolve => {
		const socket = net.createConnection({ host, port });
		const finish = value => {
			socket.removeAllListeners();
			socket.destroy();
			resolve(value);
		};
		socket.setTimeout(500, () => finish(false));
		socket.once("connect", () => finish(true));
		socket.once("error", () => finish(false));
	});
}

function bounded(value, fallback, minimum, maximum) {
	const number = Number(value ?? fallback);
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, Math.floor(number)))
		: fallback;
}

module.exports = {
	buildPortActions,
	discoverListeners,
	normalizePorts,
	parseLsof,
	portFind,
	portList,
	portKillSafe,
	waitForPort
};
