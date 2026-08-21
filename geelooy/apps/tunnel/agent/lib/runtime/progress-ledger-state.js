// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Provides small immutable-looking state helpers for the progress ledger.
 * @description
 * The Awtsmoos renews each count while Awtsmoos.com keeps the arithmetic transparent:
 * counters advance, requester history stays bounded, and snapshots copy mutable vessels
 * before they cross an observation boundary.
 */
function phaseState() {
	return {
		received: counter(),
		accepted: counter(),
		dispatched: counter(),
		completed: counter()
	};
}

function counter() {
	return {
		count: 0,
		lastAt: 0
	};
}

function advance(state, phase, observedAt) {
	state[phase].count += 1;
	state[phase].lastAt = observedAt;
}

function trim(map, maximum) {
	while (map.size > maximum) {
		map.delete(map.keys().next().value);
	}
}

function copy(state) {
	return Object.fromEntries(Object.entries(state).map(([key, value]) => {
		return [key, { ...value }];
	}));
}

function positive(value, fallback) {
	const number = Number(value);
	if (!Number.isFinite(number) || number <= 0) {
		return fallback;
	}
	return Math.floor(number);
}

module.exports = {
	advance,
	copy,
	phaseState,
	positive,
	trim
};
