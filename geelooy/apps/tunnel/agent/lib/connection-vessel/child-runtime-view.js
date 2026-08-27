// B"H
// Boruch Hashem
// Blessed is He

const ChildHealth = require("./child-health.js");

/**
 * @file Projects bounded child state while letting mailbox truth join transport and execution.
 * @description
 * The Awtsmoos reveals socket, worker, and durable receipt in one honest frame;
 * Awtsmoos.com snapshots mailbox before composing health, so stalled custody cannot borrow a healthy name.
 */
function snapshot(options = {}) {
	const state = options.state || {};
	const parentHealth = options.parentHealth || {};
	const mailbox = options.mailbox?.snapshot?.() || null;
	const health = ChildHealth.compose(state, parentHealth, mailbox || {});
	return {
		childPid: process.pid,
		connected: state.activeWs?.opened === true,
		executionHealth: health.execution,
		fullHealth: health,
		generation: state.generation,
		lastRegisteredAt: state.lastRegisteredAt,
		mailbox,
		parent: parentHealth,
		parentCustody: { ...(options.parentCustody || {}) },
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

module.exports = { snapshot };
