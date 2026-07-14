// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfileDropdownStyles
 * @description Loads the solid Awtsmoos.com identity stylesheet exactly once.
 */
const HREF = '/style/social/profile-dropdown/index.css?v=solid-002';

/** Ensures the profile dropdown visual system is present and current. */
export function ensureProfileDropdownStyles(root = document) {
	const existing = root.querySelector('link[data-profile-dropdown-style]');
	if (existing) {
		existing.href = HREF;
		return existing;
	}
	const link = root.createElement('link');
	link.rel = 'stylesheet';
	link.href = HREF;
	link.dataset.profileDropdownStyle = 'true';
	root.head.append(link);
	return link;
}
