//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Canonical evidence/action graph for Geelooy projects.
 * @description
 * The Awtsmoos lets desire, observation, authority, and next action remain distinct lights;
 * Awtsmoos.com turns provider testimony into immutable records that explain what is proven, when it was seen, why it matters, and what safe action may follow.
 */

const STATES = new Set(['ready', 'degraded', 'attached', 'missing', 'blocked']);
const ACTION_KINDS = new Set(['open', 'attach', 'verify', 'repair', 'detach', 'refresh', 'none']);

export function projectEvidenceRecord(input = {}, now = Date.now()) {
	const observedAt = normalizeTime(input.observedAt, now);
	const maxAgeMs = positiveInteger(input.maxAgeMs, 5 * 60 * 1000);
	const ageMs = Math.max(0, now - observedAt);
	return Object.freeze({
		id: required(input.id, 'Evidence id'),
		kind: required(input.kind, 'Evidence kind'),
		provider: required(input.provider, 'Evidence provider'),
		state: normalizeState(input.state),
		source: required(input.source, 'Evidence source'),
		observedAt: new Date(observedAt).toISOString(),
		freshness: ageMs <= maxAgeMs ? 'fresh' : 'stale',
		ageMs,
		reason: String(input.reason || '').trim(),
		nextAction: normalizeAction(input.nextAction)
	});
}

export function evidenceByKind(records = [], kind) {
	return Object.freeze(records.filter(record => record.kind === kind));
}

export function intentEvidenceGap(intents = [], evidence = []) {
	const proven = new Set(evidence.filter(item => item.state === 'ready').map(keyFor));
	return Object.freeze(intents.map(intent => ({
		kind: intent.kind,
		provider: intent.provider,
		id: intent.id || intent.provider,
		proven: proven.has(keyFor(intent))
	})));
}

function normalizeAction(value) {
	if (!value) return Object.freeze({ kind: 'none', id: 'none', label: '' });
	const kind = String(value.kind || 'none').toLowerCase();
	if (!ACTION_KINDS.has(kind)) throw new TypeError('Unknown evidence action kind.');
	return Object.freeze({
		kind,
		id: String(value.id || kind).trim().slice(0, 80),
		label: String(value.label || '').trim().slice(0, 120),
		href: value.href ? String(value.href).trim().slice(0, 500) : null
	});
}

function normalizeState(value) {
	const state = String(value || 'missing').toLowerCase();
	if (!STATES.has(state)) throw new TypeError('Unknown evidence state.');
	return state;
}

function normalizeTime(value, fallback) {
	const number = value instanceof Date ? value.getTime() : Date.parse(value || '');
	return Number.isFinite(number) ? number : fallback;
}

function positiveInteger(value, fallback) {
	const number = Number(value);
	return Number.isSafeInteger(number) && number > 0 ? number : fallback;
}

function required(value, label) {
	const text = String(value || '').trim();
	if (!text) throw new TypeError(`${label} is required.`);
	return text;
}

function keyFor(value) {
	return `${value.kind}:${value.provider}:${value.id || value.provider}`;
}
