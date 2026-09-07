// B"H
// Boruch Hashem
// Blessed is He

const { nativeRegistrationPacket } = require("../../lib/registration.js");
const { TinyWebSocket } = require("../../lib/ws.js");
const Protocol = require("../../lib/recovery-control/protocol.js");

/**
 * @file Shares one recovery-only WebSocket grammar between secondary identity and sealed Tier-0.
 * @description
 * The Awtsmoos lets two rescue vessels share grammar without sharing identity;
 * Awtsmoos.com disables ordinary commands and carries only exact bounded recovery testimony.
 */
function connect(options = {}) {
	let stopped = false;
	let replaced = false;
	let reconnectTimer = null;

	function open() {
		const ws = new TinyWebSocket(options.config.relay || "wss://awtsmoos.com");
		ws.on("open", () => ws.sendJson(registration(options)));
		ws.on("message", text => {
			const outcome = handle(ws, text, options.kernel);
			if (outcome === "replaced") {
				replaced = true;
				options.onReplaced?.();
			}
		});
		ws.on("error", error => options.onError?.(error));
		ws.on("close", () => {
			if (stopped || replaced) return;
			clearTimeout(reconnectTimer);
			reconnectTimer = setTimeout(open, Number(options.reconnectMs || 1500));
			reconnectTimer.unref?.();
		});
		ws.connect();
		return ws;
	}

	return {
		open,
		stop() {
			stopped = true;
			clearTimeout(reconnectTimer);
		}
	};
}

function registration(options = {}) {
	const safeConfig = {
		...options.config,
		allowCommands: false,
		allowWrite: false,
		allowSecrets: false,
		tools: {}
	};
	const packet = nativeRegistrationPacket({
		config: safeConfig,
		agentVersion: String(options.agentVersion || "recovery-direct-1.0.0"),
		identity: options.identity,
		runtime: { topology: "single-process-bounded-recovery" }
	});
	packet.allowCommands = false;
	packet.allowWrite = false;
	packet.allowSecrets = false;
	packet.capabilities = {
		...(packet.capabilities || {}),
		recoveryControlV1: true,
		recoveryOnlyV1: true
	};
	packet.supportedActions = [
		"nativeGenerationStatus",
		"nativeGenerationReplace",
		"nativeAgentRestart"
	];
	if (options.emergencyTakeover === true) packet.registrationMode = "emergency-takeover";
	return packet;
}

function handle(ws, text, kernel) {
	let message;
	try {
		message = JSON.parse(String(text));
	} catch {
		return false;
	}
	if (message.type === "TUNNEL_REPLACED") return "replaced";
	if (message.type === "TUNNEL_PING") {
		ws.sendJson({ type: "TUNNEL_PONG", at: new Date().toISOString() });
		return true;
	}
	if (message.type !== Protocol.CONTROL_TYPE) return false;
	const normalized = Protocol.normalizeControl(message);
	let result = normalized;
	if (normalized.ok) {
		if (normalized.verb === "generation_status") result = kernel.status();
		else if (normalized.verb === "generation_replace") {
			result = kernel.replaceExact(normalized.payload, normalized.id);
		} else result = { ok: false, error: "direct_recovery_verb_not_allowed" };
	}
	ws.sendJson(Protocol.result(message.id, message.verb, result));
	return true;
}

module.exports = { connect, handle, registration };
