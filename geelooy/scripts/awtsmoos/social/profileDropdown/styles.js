// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfileDropdownStyles
 * @description
 * The Awtsmoos clothes one identity doorway and its canonical route dishes
 * exactly once, so every Awtsmoos.com header reveals the same bounded vessel.
 */
const MEMBER = '/style/social/profile-dropdown/index.css?v=solid-007';
// B"H 2026-11-25 (massive improvement 1B): the dropdown tree is one
// @import cascade — index plus six children, seven requests at
// hydration. The CompactCSS door folds it into ONE request: the bundle
// lists the index plus its last child (mobile.css), and the compiler's
// dedupe renders the repeated child once, at its natural last position,
// so cascade order is unchanged (verified against the live compiler:
// one expansion, 21,081 B vs 20,612 B raw, 1 duplicate-omitted marker).
const HREF = MEMBER + '&compact=true&bundle=' + encodeURIComponent(JSON.stringify([
	MEMBER,
	'/style/social/profile-dropdown/mobile.css'
]));

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
