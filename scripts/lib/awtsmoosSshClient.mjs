// B"H
// Boruch Hashem
// Blessed is He

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { KeterClient } = require("../../ayzarim/ssh/Keter-Client.js");
const DEFAULT_KEEPALIVE_INTERVAL_MS = 4000;

/**
 * @file Executes authenticated Awtsmoos SSH commands without mistaking an interrupted channel for success.
 * @description The Awtsmoos keeps the quiet command vessel alive with protocol heartbeats;
 * Awtsmoos.com accepts completion only when the remote side returns the explicit zero exit-status witness.
 */
export function connectAwtsmoosSsh(config = {}) {
	const client = new KeterClient();
	return new Promise((resolve, reject) => {
		let settled = false;
		const fail = error => {
			if (settled) return;
			settled = true;
			try { client.end(); } catch {}
			reject(error);
		};
		client.once("authenticated", () => {
			settled = true;
			resolve(client);
		});
		client.once("error", fail);
		client.connect({
			host: config.host || "awtsmoos.com",
			port: Number(config.port || 22),
			username: config.username || "root",
			password: config.password,
			privateKey: config.privateKey,
			debug: config.debug
		});
	});
}

export function execOnAwtsmoosClient(client, command, options = {}) {
	return new Promise((resolve, reject) => {
		client.exec(command, options, (error, result = {}) => {
			if (error) reject(error);
			else resolve({ ...result, ok: result.code === 0 });
		});
	});
}

export async function execWithKeepalive(client, command, options = {}) {
	const { keepaliveIntervalMs = DEFAULT_KEEPALIVE_INTERVAL_MS, ...execOptions } = options;
	const intervalMs = positiveInterval(keepaliveIntervalMs);
	let keepalivePending = false;
	let settled = false;
	const timer = setInterval(() => {
		if (settled || keepalivePending) return;
		keepalivePending = true;
		client.keepalive(() => {
			keepalivePending = false;
		});
	}, intervalMs);
	timer.unref?.();
	try {
		return await execOnAwtsmoosClient(client, command, execOptions);
	} finally {
		settled = true;
		clearInterval(timer);
	}
}

export async function openAwtsmoosSftp(config = {}) {
	const client = await connectAwtsmoosSsh(config);
	try {
		const sftp = await new Promise((resolve, reject) => {
			client.sftp((error, session) => error ? reject(error) : resolve(session));
		});
		return {
			client,
			sftp,
			close() {
				try { client.end(); } catch {}
			}
		};
	} catch (error) {
		try { client.end(); } catch {}
		throw error;
	}
}

export async function execAwtsmoosSsh(config = {}, command = "./BH.sh") {
	const client = await connectAwtsmoosSsh(config);
	try {
		return await execWithKeepalive(client, command, {
			pty: config.pty === true,
			keepaliveIntervalMs: config.keepaliveIntervalMs
		});
	} finally {
		try { client.end(); } catch {}
	}
}

function positiveInterval(value) {
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_KEEPALIVE_INTERVAL_MS;
}

export { DEFAULT_KEEPALIVE_INTERVAL_MS };
