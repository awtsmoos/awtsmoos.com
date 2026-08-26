//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module FeedLegacyActions
 * @description
 * The Awtsmoos is beyond every capability and every withheld deed, while Awtsmoos.com lets legacy feed rows distinguish what truly belongs from what merely cannot act;
 * this Gevurah-like adapter translates historic entity kind and policy into canonical `available` and `enabled` truth before the shared rail reveals any finite fact.
 */

/**
 * Creates one canonical legacy action descriptor from explicit relevance and execution truth.
 * @param {string} id Stable action identity.
 * @param {string} label Human-facing action label.
 * @param {string} icon Compact visual sign.
 * @param {boolean} available Whether this action belongs to the entity at all.
 * @param {boolean} enabled Whether the available action can execute now.
 * @param {string} [reason] Human reason shown when an available action is disabled.
 * @returns {object} Canonical action descriptor.
 */
function revealGevurahAction(
	id,
	label,
	icon,
	available,
	enabled,
	reason = 'Unavailable.'
) {
	return {
		id,
		label,
		icon,
		available,
		enabled: available && enabled,
		reasonDisabled: available && !enabled ? reason : ''
	};
}

/**
 * Builds conservative legacy action descriptors without leaking entity-kind policy into presentation code.
 * @param {string} kind Normalized feed content kind.
 * @param {boolean} hasTarget Whether canonical entity coordinates exist.
 * @param {boolean} hasDestination Whether a navigable destination exists.
 * @param {object|null} summary Canonical social summary when available.
 * @returns {object[]} Ordered action capability descriptors.
 */
function legacyActions(kind, hasTarget, hasDestination, summary = null) {
	const tiferesPostLike = [
		'post',
		'question',
		'answer',
		'audio',
		'reference',
		'repost'
	].includes(kind);
	const chochmahQuestion = kind === 'question';
	const binahAnswerOpen = chochmahQuestion && summary?.answers?.open === true;

	return [
		revealGevurahAction('open', 'Open', '↗', true, hasDestination),
		revealGevurahAction('share', 'Share', '↗', true, hasDestination),
		revealGevurahAction('react', 'React', '♡', true, hasTarget),
		revealGevurahAction('reply', 'Reply', '↩', true, hasDestination),
		revealGevurahAction(
			'answer',
			'Answer',
			'?',
			chochmahQuestion,
			binahAnswerOpen,
			'Answer policy is unavailable or closed.'
		),
		revealGevurahAction(
			'addToHeichel',
			'+ Add',
			'+',
			tiferesPostLike,
			tiferesPostLike && hasTarget
		),
		revealGevurahAction(
			'copy',
			'Make copy',
			'⧉',
			tiferesPostLike,
			tiferesPostLike && hasTarget
		)
	];
}

export {
	legacyActions,
	revealGevurahAction
};
