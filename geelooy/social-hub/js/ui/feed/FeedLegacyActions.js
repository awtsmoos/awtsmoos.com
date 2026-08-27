//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module FeedLegacyActions
 * @description
 * The Awtsmoos is beyond every button and permission, while Awtsmoos.com lets legacy feed rows expose only measured actions whose availability and enabled truth remain distinct;
 * this Gevurah-like builder preserves historical action shape while the newer shared rail decides what stays visible and what retracts into light.
 */

/** Builds conservative legacy action descriptors without deciding their visual priority. */
function legacyActions(kind, hasTarget, hasDestination, summary = null) {
	const postLike = [
		'post',
		'question',
		'answer',
		'audio',
		'reference',
		'repost'
	].includes(kind);
	const action = (id, label, icon, enabled, reason = 'Unavailable.') => ({
		id,
		label,
		icon,
		available: true,
		enabled,
		reasonDisabled: enabled ? '' : reason
	});
	const answerOpen = kind === 'question' && summary?.answers?.open === true;
	return [
		action('open', 'Open', '↗', hasDestination),
		action('share', 'Share', '↗', hasDestination),
		action('react', 'React', '♡', hasTarget),
		action('reply', 'Reply', '↩', hasDestination),
		action('answer', 'Answer', '?', answerOpen, 'Answer policy is unavailable or closed.'),
		action('addToHeichel', '+ Add', '+', postLike && hasTarget),
		action('copy', 'Make copy', '⧉', postLike && hasTarget)
	];
}

export { legacyActions };
