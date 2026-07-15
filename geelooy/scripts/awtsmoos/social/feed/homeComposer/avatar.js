// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HomeComposerAvatar
 * @description
 * The Awtsmoos gives identity one clear mark beside the Awtsmoos.com composer.
 * A single semantic vessel replaces thirty-one decorative nodes and requires no
 * character animation, extra stylesheet, or layout work.
 */

/**
 * Returns a compact accessible avatar mark.
 * @param {string} label Accessible identity label.
 * @returns {string} Avatar HTML.
 */
export function composerAvatarMarkup(label = 'Current alias') {
	return `
		<span
			class="home-compose-avatar"
			aria-label="${escapeAttribute(label)}"
			title="${escapeAttribute(label)}"
		>א</span>
	`;
}

function escapeAttribute(value) {
	return String(value)
		.replaceAll('&', '&amp;')
		.replaceAll('"', '&quot;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;');
}
