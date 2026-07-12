// B"H
const Identity = require('./processIdentity.js');
const Group = require('./processGroup.js');
const Observe = require('./processObserve.js');

/**
 * B"H — Cleanup proves birth identity before signaling the whole family. TERM
 * receives a bounded grace, then KILL closes resistant descendants.
 */
async function cleanup(expected = {}, options = {}) {
	const observe = options.observe || Observe.observe;
	const groupAlive = options.groupAlive || Group.alive;
	const signalGroup = options.signalGroup || Group.signal;
	const observed = await Promise.resolve(observe(expected.pid));
	const comparison = Identity.compare(expected, observed);
	if (comparison.state === 'dead') {
		return receipt('cleaned', expected, observed, { alreadyDead: true });
	}
	if (!comparison.ok) {
		return receipt('identity_unverified', expected, observed, { comparison });
	}
	const graceMs = positive(options.graceMs, 500);
	const pollMs = positive(options.pollMs, 25);
	const attempts = [];
	const term = await Promise.resolve(signalGroup(expected, 'SIGTERM'));
	attempts.push(term);
	if (term.absent || await waitUntilDead(expected.processGroupId, graceMs, pollMs, groupAlive)) {
		return receipt('cleaned', expected, observed, {
			attempts,
			signals: sentSignals(attempts)
		});
	}
	if (!term.sent && term.errorCode) {
		return receipt('cleanup_failed', expected, observed, {
			attempts,
			signals: sentSignals(attempts),
			error: `signal_failed:${term.errorCode}`
		});
	}
	const kill = await Promise.resolve(signalGroup(expected, 'SIGKILL'));
	attempts.push(kill);
	const cleaned = kill.absent ||
		await waitUntilDead(expected.processGroupId, graceMs, pollMs, groupAlive);
	return receipt(cleaned ? 'cleaned' : 'cleanup_failed', expected, observed, {
		attempts,
		signals: sentSignals(attempts),
		error: cleaned ? null : `signal_failed:${kill.errorCode || 'group_still_alive'}`
	});
}

async function waitUntilDead(processGroupId, timeoutMs, pollMs, groupAlive = Group.alive) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() <= deadline) {
		if (!await Promise.resolve(groupAlive(processGroupId))) return true;
		await sleep(pollMs);
	}
	return !await Promise.resolve(groupAlive(processGroupId));
}

function sentSignals(attempts) {
	return attempts.filter(attempt => attempt?.sent).map(attempt => attempt.signal);
}

function receipt(state, expected, observed, details = {}) {
	return {
		ok: state === 'cleaned',
		state,
		expected: structuredClone(expected),
		observed: structuredClone(observed),
		at: new Date().toISOString(),
		...details
	};
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

module.exports = { cleanup, receipt, waitUntilDead };
