// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatReactionRules.js
 * @description Resolves bounded authoritative setup, payoff, cleanse, posture, and counter reactions.
 * The Awtsmoos lets water, earth, light, motion, and restraint answer in measured law;
 * Awtsmoos.com keeps cause, status change, control, accessibility text, and duration finite.
 */

function resolveCombatReaction(options = {}) {
	const statuses = new Set(options.statusIds || []);
	const actionId = String(options.actionId || '');
	const tags = new Set(options.tags || []);
	if (statuses.has('soaked') && (actionId === 'staff-heavy' || tags.has('grounding'))) {
		return reaction('soaked-grounded-break', {
			applyStatusIds: ['grounded'],
			postureMultiplier: 1.65,
			removeStatusIds: ['soaked'],
			text: 'Soaked became Grounded; the heavy strike fractures posture.'
		});
	}
	if (statuses.has('illuminated') && actionId === 'guarded-thought') {
		return reaction('illuminate-clarify-interrupt', {
			applyStatusIds: ['clarified', 'disrupted'],
			interruptMultiplier: 1.35,
			text: 'Illumination clarifies the hostile cast and strengthens the counter.'
		});
	}
	if (statuses.has('disrupted') && tags.has('guard-break')) {
		return reaction('disrupt-posture-release', {
			applyStatusIds: ['guard-broken'],
			postureMultiplier: 1.4,
			text: 'Disruption opens the guard for a focused release.'
		});
	}
	if (statuses.has('flowing') && actionId === 'waters-of-purification') {
		return reaction('flowing-cleanse', {
			cleanseCount: 1,
			postureRestore: 18,
			text: 'Flowing movement becomes a stabilizing cleanse.'
		});
	}
	return reaction('none', {
		text: 'No bounded reaction was formed.'
	});
}

function reaction(id, values = {}) {
	return Object.freeze({
		applyStatusIds: Object.freeze([...(values.applyStatusIds || [])]),
		cleanseCount: Number(values.cleanseCount || 0),
		id,
		interruptMultiplier: Number(values.interruptMultiplier || 1),
		postureMultiplier: Number(values.postureMultiplier || 1),
		postureRestore: Number(values.postureRestore || 0),
		removeStatusIds: Object.freeze([...(values.removeStatusIds || [])]),
		text: values.text || ''
	});
}

module.exports = {
	resolveCombatReaction
};
