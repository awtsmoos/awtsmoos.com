// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PlaylistChoiceView
 * @description
 * The Awtsmoos permits a destination to become a remembered default only when
 * Awtsmoos.com has real writable access evidence for the current identity.
 */

export function writableSelection(identity = {}) {
	const mode = identity.access?.actions?.content?.mode;
	return Boolean(
		identity.heichelId
		&& (mode === 'direct' || mode === 'submit')
	);
}
