// B"H
// Boruch Hashem
// Blessed is He

const { TinyWebSocket } = require("../ws.js");

/**
 * @file Watches for a server-pushed pairing approval over WebSocket.
 * @description
 * Level 3 of Yaakov's multi-level approval detection (2026-10-14). The agent
 * already polls pairing/status (level 1); this opens a WebSocket to the relay,
 * logs in under the pairing alias, and resolves the moment the server pushes
 * the approval event. The push carries no credential — it is only a wake-up:
 * the device still consumes the credential through the possession-bound
 * pairing/status call. If the socket fails, closes, or never connects, the
 * watcher resolves false and polling remains fully authoritative. Never throws.
 */

const DEFAULT_TIMEOUT_MS = 12 * 60 * 60 * 1000;

/** Derives the wss relay URL from trusted config, mirroring pairingClient. */
function relayWsUrl(config = {}) {
	const explicit = process.env.AWTSMOOS_PAIRING_WS_URL;
	if (explicit && /^wss?:\/\//i.test(String(explicit).trim())) {
		return String(explicit).trim();
	}
	const relay = String(config.relay || "wss://awtsmoos.com").trim();
	if (/^wss?:\/\//i.test(relay)) return relay;
	return "wss://awtsmoos.com";
}

/** Server alias this pairing listens under. */
function aliasFor(pairingId) {
	return `pairing:${String(pairingId || "").trim()}`;
}

/**
 * Watches for a pairing_approved push for one pairing ID.
 * @returns {{notified: Promise<boolean>, close(): void, takeFired(): boolean, state: object}}
 * notified resolves true on push, false on close/timeout/abort. takeFired
 * returns true once per push arrival and resets, so poll loops never spin.
 */
function watchForApproval(config, pairingId, options = {}) {
	const state = { active: true, fired: false };
	const cleanPairingId = String(pairingId || "").trim();
	let settled = false;
	let ws = null;
	let resolveOut = null;
	const notified = new Promise(resolve => { resolveOut = resolve; });
	const finish = value => {
		if (settled) return;
		settled = true;
		state.active = false;
		if (value) state.fired = true;
		try { clearTimeout(timer); } catch {}
		try { ws?.close(); } catch {}
		try { resolveOut(value); } catch {}
	};
	const timer = setTimeout(() => finish(false), Number(options.timeoutMs || DEFAULT_TIMEOUT_MS));
	if (timer.unref) timer.unref();
	const signal = options.signal;
	if (signal) {
		if (signal.aborted) {
			finish(false);
		} else if (typeof signal.addEventListener === "function") {
			signal.addEventListener("abort", () => finish(false), { once: true });
		}
	}
	const api = {
		notified,
		close: () => finish(false),
		state,
		takeFired() {
			const f = state.fired;
			state.fired = false;
			return f;
		}
	};
	if (!cleanPairingId) {
		finish(false);
		return api;
	}
	try {
		ws = new TinyWebSocket(relayWsUrl(config));
	} catch {
		finish(false);
		return api;
	}
	ws.on("open", () => {
		if (settled) return;
		try {
			ws.sendJson({ type: "LOGIN", aliasId: aliasFor(cleanPairingId) });
		} catch {
			finish(false);
		}
	});
	ws.on("message", payload => {
		if (settled) return;
		let msg = null;
		try { msg = JSON.parse(String(payload)); } catch { return; }
		if (msg && msg.type === "pairing_approved") {
			if (!msg.pairingId || String(msg.pairingId) === cleanPairingId) {
				try {
					options.log?.("info", `B"H pairing approval push received; confirming with the server…`);
				} catch {}
				finish(true);
			}
		}
	});
	// A quiet close/error simply yields to polling — the push is a hint, never a gate.
	ws.on("close", () => finish(false));
	ws.on("error", () => {});
	try {
		ws.connect();
	} catch {
		finish(false);
	}
	return api;
}

module.exports = { aliasFor, relayWsUrl, watchForApproval };
