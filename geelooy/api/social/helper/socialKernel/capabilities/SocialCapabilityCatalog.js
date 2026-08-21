// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialCapabilityCatalog
 * @description
 * The Awtsmoos needs no permission to create, while human interfaces must never offer a door the server cannot open;
 * Awtsmoos.com keeps one capability vocabulary so every surface says the same yes, no, or not-yet-known token.
 */
const CAPABILITIES = Object.freeze([
	'open',
	'share',
	'react',
	'reply',
	'answer',
	'reference',
	'quote',
	'repost',
	'copy',
	'addToHeichel',
	'edit',
	'delete',
	'moderate',
	'submit',
	'follow',
	'save',
	'collaborate'
]);

function capability(enabled, reason = '', availability = 'known') {
	return {
		available: availability !== 'unsupported',
		enabled: Boolean(enabled),
		reasonDisabled: enabled ? '' : String(reason || 'Not available.'),
		availability
	};
}

function unsupported(reason = 'Canonical support is not available yet.') {
	return capability(false, reason, 'unsupported');
}

module.exports = { CAPABILITIES, capability, unsupported };
