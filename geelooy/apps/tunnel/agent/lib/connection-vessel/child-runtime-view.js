// B"H
// Boruch Hashem
// Blessed is He

const ChildHealth = require("./child-health.js");

/**
 * @file Projects bounded connection-child state for parent and relay testimony.
 * @description
 * The Awtsmoos reveals enough of each vessel to distinguish transport from
 * execution without exposing secret identity material. Awtsmoos.com keeps this
 * projection small so runtime orchestration remains clear and separately testable.
 */
function snapshot(options = {}) {
	const state = options.state || {};
	const parentHealth = options.parentHealth || {};
	const health = ChildHealth.compose(state, parentHealth);
	return {
		childPid: process.pid,
		connected: state.activeWs?.opened === true,
		executionHealth: health.execution,
		fullHealth: health,
		generation: state.generation,
		lastRegisteredAt: state.lastRegisteredAt,
		mailbox: options.mailbox?.snapshot?.() || null,
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
