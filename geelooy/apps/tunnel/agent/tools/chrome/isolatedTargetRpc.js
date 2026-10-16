//B"H
//Boruch Hashem
//Blessed is He

"use strict";
const { TinyWebSocket } = require("../../lib/ws.js");

/** A separate target-bound CDP socket which cannot displace the global browser lane. */
async function connectTarget(target, timeoutMs = 3000, Socket = TinyWebSocket) {
	if (!target?.webSocketDebuggerUrl || target?.type !== "page") {
		throw Object.assign(new Error("target_missing_devtools_socket"), { code:"TARGET_NOT_AVAILABLE" });
	}
	const socket = new Socket(target.webSocketDebuggerUrl);
	let seq = 0;
	const pending = new Map();
	const closed = message => {
		for (const entry of pending.values()) {
			clearTimeout(entry.timer);
			entry.reject(new Error(message));
		}
		pending.clear();
	};
	socket.on("message", raw => {
		let reply;
		try { reply = JSON.parse(raw); } catch { return; }
		const entry = pending.get(reply.id);
		if (!entry) return;
		pending.delete(reply.id);
		clearTimeout(entry.timer);
		if (reply.error) entry.reject(new Error(reply.error.message || "cdp_command_failed"));
		else entry.resolve(reply.result || {});
	});
	socket.on("close", () => closed("isolated_target_socket_closed"));
	socket.on("error", () => closed("isolated_target_socket_error"));
	await new Promise((resolve,reject) => {
		const timer = setTimeout(() => reject(new Error("cdp_connect_timeout")), timeoutMs);
		socket.once("open", () => {clearTimeout(timer);resolve();});
		socket.once("error", error => {clearTimeout(timer);reject(error);});
		socket.connect();
	}).catch(error => {socket.close(true);throw error;});
	return {
		async call(method, params = {}, timeout = timeoutMs) {
			const id = ++seq;
			return new Promise((resolve,reject) => {
				const timer = setTimeout(() => {pending.delete(id);reject(new Error("cdp_timeout:"+method));},timeout);
				pending.set(id,{resolve,reject,timer});
				try {socket.sendJson({id,method,params});}
				catch(error) {clearTimeout(timer);pending.delete(id);reject(error);}
			});
		},
		close() {socket.close(true);closed("isolated_target_complete");}
	};
}
module.exports = { connectTarget };
