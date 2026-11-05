// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyActionPolicy.js
 * @description Selects deterministic role and boss actions from profile, phase, and attack count.
 * The Awtsmoos gives every hostile intention a measured name before consequence;
 * Awtsmoos.com keeps Sentinel, Pursuer, Scribe, and Kedem grammar readable and bounded.
 */

const ROLE_ACTIONS = Object.freeze({
	cantor: Object.freeze([
		'letter-bolt',
		'binding-verse',
		'grounding-chant'
	]),
	skirmisher: Object.freeze([
		'pursuit-rush',
		'redirectable-lunge'
	]),
	warden: Object.freeze([
		'measured-guard',
		'heavy-shield-strike'
	])
});

export function selectMinimalEnemyAction(combat, state) {
	const profile = combat.actor.profile;
	const phase = minimalEnemyBossPhase(combat.actor);
	const deck = bossDeck(profile, phase)
		|| profile.actionDeck
		|| ROLE_ACTIONS[profile.archetype]
		|| Object.freeze(['shadow-strike']);
	const index = Math.max(0, combat.attackCount) % deck.length;
	const id = deck[index];
	const caster = isCasterAction(id, state, combat.session.role);
	return Object.freeze({
		category: caster ? 'cast' : 'melee',
		concealed: Boolean(profile.boss && phase === 3),
		danger: dangerFor(id),
		durationMultiplier: durationMultiplier(id, phase),
		id,
		letters: lettersFor(id, profile),
		phase,
		shape: shapeFor(id, profile),
		state: caster ? 'cast-windup' : 'melee-windup'
	});
}

export function minimalEnemyBossPhase(actor) {
	if (!actor.profile?.boss) return 1;
	const maximum = Math.max(1, Number(actor.profile.maxHealth || 1));
	const ratio = Math.max(0, Math.min(1, Number(actor.health || 0) / maximum));
	if (ratio <= 0.34) return 3;
	if (ratio <= 0.67) return 2;
	return 1;
}

function bossDeck(profile, phase) {
	if (!profile.boss) return null;
	if (phase === 3) return Object.freeze([
		'concealed-unification',
		'measured-guard',
		'dividing-seal'
	]);
	if (phase === 2) return Object.freeze([
		'dividing-seal',
		'individual-measure',
		'heavy-shield-strike'
	]);
	return Object.freeze([
		'measured-guard',
		'heavy-shield-strike',
		'measured-ring'
	]);
}

function isCasterAction(id, state, role) {
	if (state === 'cast-windup' || role === 'caster') return true;
	return /bolt|verse|chant|seal|unification|ring|measure/.test(id);
}

function durationMultiplier(id, phase) {
	const base = /heavy|binding|division|unification/.test(id) ? 1.28 : 1;
	return Number((base + (phase - 1) * 0.08).toFixed(2));
}

function dangerFor(id) {
	if (/unification|heavy|binding/.test(id)) return 'high';
	if (/seal|rush|ring/.test(id)) return 'medium';
	return 'low';
}

function lettersFor(id, profile) {
	if (id === 'binding-verse') return 'אסר';
	if (id === 'grounding-chant') return 'ארץ';
	if (id === 'dividing-seal') return 'חלק';
	if (id === 'concealed-unification') return 'אחד';
	if (id === 'pursuit-rush') return 'רדף';
	return profile.attackLetters || 'דין';
}

function shapeFor(id, profile) {
	const vocabulary = profile.telegraphVocabulary || {};
	if (/guard|heavy/.test(id)) return vocabulary.guard || vocabulary.heavy || 'square';
	if (/rush|lunge/.test(id)) return vocabulary.rush || 'arrow-wedge';
	if (/seal|verse|chant|bolt/.test(id)) return vocabulary.cast || vocabulary.seal || 'glyph';
	return vocabulary.concealment || 'warning-ring';
}
