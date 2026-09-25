// B"H
// Boruch Hashem
// Blessed is He

const Monotonic = require("../runtime/monotonic.js");

const DEFAULT_HEALTH_INTERVAL_MS = 5000;
const MAX_DIGEST_AGE_MS = 3600000;

/**
 * @file Publishes bounded transport, execution, mailbox, acceptance, and repair health without receipt identity.
 * @description
 * The Awtsmoos renews every vessel while truth remains compact and bright.
 * Awtsmoos.com reveals admission silence and bounded recovery state by counts and ages,
 * never by private request identity, payload, path, credential, or command content.
 */
function create(options = {}) {
	const now = options.now || Date.now;
	const intervalMs = bounded(options.intervalMs, DEFAULT_HEALTH_INTERVAL_MS);
	let lastSentAt = 0;
	let lastSignature = "";

	/** Publishes on change or cadence while the authenticated child is connected. */
	function publish(snapshot = {}, transmit = () => false) {
		if (snapshot.registered !== true || snapshot.connected !== true) return false;
		const observedAt = now();
		const health = publicHealth(snapshot);
		const signature = JSON.stringify(health);
		const changed = signature !== lastSignature;
		const due = observedAt - lastSentAt >= intervalMs;
		if (!changed && !due) return false;
		const sent = transmit({
			type: "TUNNEL_HEALTH",
			at: new Date(observedAt).toISOString(),
			health
		});
		if (!sent) return false;
		lastSentAt = observedAt;
		lastSignature = signature;
		return true;
	}

	return { publish };
}

/** Removes receipt identity and keeps only bounded health facts safe for relay state. */
function publicHealth(snapshot = {}) {
	const full = snapshot.fullHealth || {};
	const execution = snapshot.executionHealth || {};
	const mailbox = full.mailbox || {};
	const transport = transportDigest(snapshot.transportLiveness);
	return {
		healthy: full.healthy === true,
		state: text(full.state),
		transportHealthy: full.transportHealthy === true,
		executionHealthy: full.executionHealthy === true,
		mailboxHealthy: full.mailboxHealthy !== false,
		mailboxState: text(full.mailboxState || "healthy"),
		...(transport ? { transport } : {}),
		execution: executionView(execution),
		connection: {
			generation: nonnegative(snapshot.generation),
			lastRegisteredAt: nonnegative(snapshot.lastRegisteredAt),
			lastAcceptedAt: nonnegative(snapshot.parentCustody?.lastAcceptedAt)
		},
		mailbox: {
			inboxCount: nonnegative(mailbox.inboxCount),
			inboxOldestAgeMs: nonnegative(mailbox.inboxOldestAgeMs),
			outboxCount: nonnegative(mailbox.outboxCount),
			outboxOldestAgeMs: nonnegative(mailbox.outboxOldestAgeMs)
		}
	};
}

/** Projects non-identifying execution and consumer-recovery evidence. */
function executionView(execution = {}) {
	const recovery = execution.consumerRecovery || {};
	return {
		healthy: execution.healthy === true,
		state: text(execution.state),
		consumerStalled: execution.consumerStalled === true,
		ingressStalled: execution.ingressStalled === true,
		parentUnresponsive: execution.parentUnresponsive === true,
		repairing: execution.repairing === true,
		parentAgeMs: nonnegative(execution.parentAgeMs),
		acceptedAgeMs: nonnegative(execution.acceptedAgeMs),
		unresolved: nonnegative(execution.unresolved),
		unownedIngress: nonnegative(execution.unownedIngress),
		unownedIngressAgeMs: nonnegative(execution.unownedIngressAgeMs),
		consumerRecovery: {
			repairAuthorized: recovery.repairAuthorized === true,
			reason: text(recovery.reason || "consumer_healthy"),
			candidateAgeMs: nonnegative(recovery.candidateAgeMs),
			observations: nonnegative(recovery.observations),
			recentRepairs: nonnegative(recovery.recentRepairs)
		}
	};
}

function bounded(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(1000, Math.min(60000, Math.floor(number)))
		: fallback;
}

function nonnegative(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}

function text(value) {
	return String(value || "unknown").slice(0, 120);
}

/**
 * B10b: projects transport-liveness testimony into the TUNNEL_HEALTH digest so
 * the relay/parent can distinguish a silent transport from a healthy child.
 * All fields are bounded ages/counters — no identity, consistent with the
 * file's privacy contract. Returns undefined when no liveness is attached, so
 * the `transport` key is omitted cleanly.
 *
 * `view` is built by transportLivenessView() from TinyWebSocket.liveness and
 * carries monotonic-domain ages (see B12): lastInboundAt is therefore exposed
 * as idleMs, the age the relay actually needs.
 */
function transportDigest(view) {
	if (!view || typeof view !== "object") return undefined;
	return {
		clockDomain: String(view.clockDomain || "monotonic").slice(0, 32),
		deadIdleMs: cappedMs(view.deadIdleMs),
		idleMs: cappedMs(view.idleMs),
		lastPingAgeMs: cappedMs(view.lastPingAgeMs),
		pingIdleMs: cappedMs(view.pingIdleMs),
		pongRttMs: cappedMs(view.pongRttMs),
		schedulerGraceActive: view.schedulerGraceActive === true
	};
}

function cappedMs(value) {
	const number = Number(value);
	if (!Number.isFinite(number) || number < 0) return 0;
	return Math.min(MAX_DIGEST_AGE_MS, Math.floor(number));
}

/**
 * B10b: builds the transport-liveness view from the active socket. Returns
 * null when no socket/liveness exists (digest omits the section). `now` is
 * injectable for tests and must share the liveness clock domain (monotonic).
 */
function transportLivenessView(state = {}, now = Monotonic.monotonicMs()) {
	const ws = state?.activeWs;
	const liveness = ws?.liveness;
	if (!liveness || typeof liveness.snapshot !== "function") return null;
	let snap;
	try {
		snap = liveness.snapshot() || {};
	} catch {
		return null;
	}
	const lastInboundAt = Number(snap.lastInboundAt);
	const lastPingAt = Number(snap.lastPingAt);
	const rtt = Number(ws.pongRttMs);
	return {
		clockDomain: "monotonic",
		deadIdleMs: boundedAge(snap.deadIdleMs),
		idleMs: Number.isFinite(lastInboundAt)
			? Math.max(0, Math.floor(now - lastInboundAt))
			: 0,
		lastPingAgeMs: lastPingAt > 0 ? Math.max(0, Math.floor(now - lastPingAt)) : 0,
		pingIdleMs: boundedAge(snap.pingIdleMs),
		pongRttMs: Number.isFinite(rtt) && rtt >= 0
			? Math.min(MAX_DIGEST_AGE_MS, Math.floor(rtt))
			: 0,
		schedulerGraceActive: snap.schedulerGraceActive === true
	};
}

function boundedAge(value) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0
		? Math.min(MAX_DIGEST_AGE_MS, Math.floor(number))
		: 0;
}

module.exports = {
	DEFAULT_HEALTH_INTERVAL_MS,
	create,
	executionView,
	publicHealth,
	transportDigest,
	transportLivenessView
};
