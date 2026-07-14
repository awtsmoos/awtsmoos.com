// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HomeComposerAvatar
 * @description
 * Builds the small human constellation beside the composer. The Awtsmoos gives
 * identity a face without replacing the living alias carried by Awtsmoos.com.
 */
const CHARACTER_PARTS = [
	'character-aura',
	'character-shadow',
	'character-leg left',
	'character-leg right',
	'character-shoe left',
	'character-shoe right',
	'character-robe',
	'character-lapel left',
	'character-lapel right',
	'character-belt',
	'character-arm left',
	'character-arm right',
	'character-hand left',
	'character-hand right',
	'character-neck',
	'character-head',
	'character-ear left',
	'character-ear right',
	'character-hair',
	'character-peyos left',
	'character-peyos right',
	'character-hat-brim',
	'character-hat-crown',
	'character-eye left',
	'character-eye right',
	'character-brow left',
	'character-brow right',
	'character-nose',
	'character-moustache',
	'character-beard',
	'character-smile'
];

/**
 * Returns accessible avatar markup with decorative internal pieces.
 * @param {string} label Accessible identity label.
 * @returns {string} Avatar HTML.
 */
export function composerAvatarMarkup(label = 'Current alias') {
	const safeLabel = escapeAttribute(label);
	const parts = CHARACTER_PARTS.map(part => {
		return `<i class="${part}" aria-hidden="true"></i>`;
	}).join('');
	return `
		<span
			class="geelooy-avatar home-compose-avatar geelooy-character-avatar character-variant-0"
			aria-label="${safeLabel}"
			title="${safeLabel}"
		>${parts}</span>
	`;
}

function escapeAttribute(value) {
	return String(value)
		.replaceAll('&', '&amp;')
		.replaceAll('"', '&quot;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;');
}
