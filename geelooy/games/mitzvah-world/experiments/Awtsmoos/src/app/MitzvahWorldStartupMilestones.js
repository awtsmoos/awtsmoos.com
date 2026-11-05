// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldStartupMilestones.js
 * @description Records one-shot monotonic startup milestones and adopts the compact launcher's scalar first-light seed.
 * The Awtsmoos renews each instant beyond measure while Awtsmoos.com remembers the first revealed ray;
 * deferred richness inherits that origin faithfully, so later clocks can deepen truth without rewriting the day.
 */

const LEDGERS_BY_ENVIRONMENT = new WeakMap();
const SCRIPT_START_KEY = 'AwtsmoosMitzvahWorldScriptStart';

/** Owns immutable first-observation timing for one runtime environment. */
export class MitzvahWorldStartupMilestones {
	constructor({ environment = globalThis, clock = resolveClock(environment) } = {}) {
		this.environment = objectEnvironment(environment);
		this.clock = clock;
		this.originMilliseconds = null;
		this.records = new Map();
		this.adoptCompactSeed();
	}

	/** Records a milestone once and republishes a frozen diagnostic snapshot. */
	mark(name) {
		const key = String(name || '').trim();
		if (!key) return null;
		const existing = this.records.get(key);
		if (existing) return existing;
		const atMilliseconds = finiteNow(this.clock());
		this.originMilliseconds ??= atMilliseconds;
		const record = Object.freeze({
			name: key,
			atMilliseconds,
			elapsedMilliseconds: Math.max(0, atMilliseconds - this.originMilliseconds)
		});
		this.records.set(key, record);
		this.publish();
		return record;
	}

	/** Returns a value snapshot suitable for browser automation and cold-load receipts. */
	snapshot() {
		return Object.freeze({
			originMilliseconds: this.originMilliseconds,
			milestones: Object.freeze(Object.fromEntries(this.records))
		});
	}

	publish() {
		const snapshot = this.snapshot();
		try {
			this.environment.AwtsmoosMitzvahWorldStartup = snapshot;
		} catch {}
		return snapshot;
	}

	/** Converts the first-control scalar into the richer immutable scriptStart record. */
	adoptCompactSeed() {
		const atMilliseconds = finiteOrNull(this.environment?.[SCRIPT_START_KEY]);
		if (atMilliseconds === null) return;
		this.originMilliseconds = atMilliseconds;
		this.records.set('scriptStart', Object.freeze({
			name: 'scriptStart',
			atMilliseconds,
			elapsedMilliseconds: 0
		}));
	}
}

/** Records one named startup milestone against the environment's shared ledger. */
export function markMitzvahWorldStartupMilestone(environment, name) {
	return startupMilestonesFor(environment).mark(name);
}

/** Returns the latest immutable startup receipt for one environment. */
export function getMitzvahWorldStartupSnapshot(environment = globalThis) {
	return startupMilestonesFor(environment).snapshot();
}

/** Resolves the shared ledger without creating parallel clocks for one browser environment. */
export function startupMilestonesFor(environment = globalThis) {
	const vessel = objectEnvironment(environment);
	let ledger = LEDGERS_BY_ENVIRONMENT.get(vessel);
	if (!ledger) {
		ledger = new MitzvahWorldStartupMilestones({ environment: vessel });
		LEDGERS_BY_ENVIRONMENT.set(vessel, ledger);
	}
	return ledger;
}

function objectEnvironment(environment) {
	return environment && (typeof environment === 'object' || typeof environment === 'function')
		? environment
		: globalThis;
}

function resolveClock(environment) {
	const performanceClock = environment?.performance;
	return typeof performanceClock?.now === 'function'
		? () => performanceClock.now()
		: () => Date.now();
}

function finiteOrNull(value) {
	return Number.isFinite(Number(value)) ? Number(value) : null;
}

function finiteNow(value) {
	return finiteOrNull(value) ?? 0;
}
