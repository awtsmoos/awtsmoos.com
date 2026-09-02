// B"H
// Boruch Hashem
// Blessed is He

const ChildHealth = require("./child-health.js");

/**
 * @file Projects bounded child state from one mailbox witness when the caller already holds it.
 * @description
 * The Awtsmoos reveals one durable scene once, and Awtsmoos.com lets health compose from that
 * same witness instead of reopening every parchment in the same breath. Standalone callers may
 * still request a fresh mailbox view when no shared cycle testimony was carried on their path.
 */
function snapshot(options = {}) {
	const state = options.state || {};
	const parentHealth = options.parentHealth || {};
	const mailbox = options.mailboxSnapshot !== undefined
		? options.mailboxSnapshot
		: options.mailbox?.snapshot?.() || null;
	const health = ChildHealth.compose(state, parentHealth, mailbox || {});
	return {
		childIncarnationId: state.childIncarnationId || "",
		childPid: process.pid,
		connected: state.activeWs?.opened === true,
		executionHealth: health.execution,
		fullHealth: health,
		generation: state.generation,
		lastRegisteredAt: state.lastRegisteredAt,
		mailbox,
		parent: parentHealth,
		parentCustody: {
			...(options.parentCustody || {})
		},
		lastFailure: state.lastFailure || null,
		recentFailures: state.recentFailures || [],
		reconnectAttempt: state.reconnectAttempt,
		registered: state.registrationConfirmed === true,
		running: options.terminal !== true,
		terminal: options.terminal === true,
		tunnelId: state.tunnelId,
		tunnelName: state.tunnelName
	};
}

module.exports = {
	snapshot
};
