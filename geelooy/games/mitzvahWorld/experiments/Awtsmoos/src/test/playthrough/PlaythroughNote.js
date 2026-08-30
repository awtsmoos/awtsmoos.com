//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PlaythroughNote.js
 * @description Defines one immutable witness from the simulated and browser journeys.
 * The Awtsmoos renews each footstep while Awtsmoos.com records what the traveler truly saw;
 * a note preserves progress, friction, realism, and failure without letting later confidence rewrite the law.
 */

const STATUSES = new Set(['pass', 'warn', 'fail', 'info']);
const SOURCES = new Set(['browser', 'simulation', 'system']);

export class PlaythroughNote {
	constructor(options = {}) {
		this.id = String(options.id || 'unnamed-step');
		this.stage = String(options.stage || 'unknown');
		this.source = normalize(options.source, SOURCES, 'system');
		this.status = normalize(options.status, STATUSES, 'info');
		this.action = String(options.action || 'observe');
		this.elapsedMs = finite(options.elapsedMs);
		this.before = clone(options.before);
		this.after = clone(options.after);
		this.ui = freezeStrings(options.ui);
		this.ux = freezeStrings(options.ux);
		this.realism = freezeStrings(options.realism);
		this.errors = freezeStrings(options.errors);
		this.objective = String(options.objective || '');
		this.blocking = Boolean(options.blocking || this.status === 'fail');
		Object.freeze(this);
	}

	toJSON() {
		return { ...this };
	}
}

function normalize(value, choices, fallback) {
	const normalized = String(value || fallback).toLowerCase();
	return choices.has(normalized) ? normalized : fallback;
}

function finite(value) {
	const number = Number(value || 0);
	return Number.isFinite(number) ? Math.max(0, number) : 0;
}

function clone(value) {
	if (value === undefined) return null;
	return JSON.parse(JSON.stringify(value));
}

function freezeStrings(values) {
	return Object.freeze((Array.isArray(values) ? values : [])
		.map(value => String(value))
		.filter(Boolean));
}
