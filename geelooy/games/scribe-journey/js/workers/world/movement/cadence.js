// B"H

const TURN_DELAY_MS = 55;
const BLOCK_RETRY_MS = 130;

const FALLBACK_KEYS = [
	['ArrowUp', 'up'],
	['ArrowDown', 'down'],
	['ArrowLeft', 'left'],
	['ArrowRight', 'right'],
	['w', 'up'],
	['s', 'down'],
	['a', 'left'],
	['d', 'right']
];

export function createCadenceState() {
	return { intent: null, nextAttemptAt: 0 };
}

export function resolveHeldDirection(keys = {}) {
	if (keys.__intent) return keys.__intent;
	return FALLBACK_KEYS.find(([key]) => keys[key])?.[1] || null;
}

export function evaluateIntent(cadence, player, direction, now) {
	if (!direction) {
		cadence.intent = null;
		cadence.nextAttemptAt = 0;
		return false;
	}

	if (cadence.intent !== direction && player.direction !== direction) {
		player.direction = direction;
		cadence.intent = direction;
		cadence.nextAttemptAt = now + TURN_DELAY_MS;
		return false;
	}

	cadence.intent = direction;
	return now >= cadence.nextAttemptAt;
}

export function recordAttempt(cadence, result, now) {
	cadence.nextAttemptAt = result.moved ? Number.POSITIVE_INFINITY : now + BLOCK_RETRY_MS;
}

export function recordStepComplete(cadence, now) {
	cadence.nextAttemptAt = now;
}
