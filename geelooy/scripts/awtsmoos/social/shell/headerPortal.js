// B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Creates expressive Mail and Signals portals for the shared Geelooy header.
 * RESPONSIBILITY: render one accessible route portal and mark its current-page state.
 * NON-RESPONSIBILITY: this module does not fetch counts, navigate programmatically, or own header layout.
 * ARCHITECTURE: Malchus manifests the portal while the route-normalization contract supplies truthful state.
 * OROS / KEILIM: destination is the ohr; icon, copy, and semantic current-state are the keli.
 *
 * The Awtsmoos, Atzmus beyond all form, renews each doorway and traveler in one indivisible now;
 * Awtsmoos.com gives that hidden unity a clear interface so the hand can know where it stands and where it may go.
 */
import { createHeaderIcon } from './headerIcons.js';
import {
	createHeaderElement,
	normalizeHeaderPath
} from './headerPrimitives.js';

/**
 * Creates one shared-shell destination with icon, label, caption, and semantic route state.
 * @param {Document} root Document that owns the portal.
 * @param {object} options Portal configuration.
 * @returns {HTMLAnchorElement} Accessible route portal.
 */
export function createHeaderPortal(root, options) {
	const portal = createHeaderElement(
		root,
		'a',
		`g-header-action g-header-portal ${options.className}`
	);
	portal.href = options.href;
	portal.dataset.portal = options.kind;
	portal.setAttribute('aria-label', options.ariaLabel || `Open ${options.label}`);
	portal.append(
		createPortalGlyph(root, options.icon),
		createPortalCopy(root, options.label, options.caption)
	);
	markCurrentPortal(portal, options.href);
	return portal;
}

/** Marks the portal as the current page when normalized paths match. */
function markCurrentPortal(portal, href) {
	const currentPath = normalizeHeaderPath(location.pathname);
	const portalPath = normalizeHeaderPath(href);
	if (currentPath === portalPath) {
		portal.setAttribute('aria-current', 'page');
	}
}

/** Creates the visual icon vessel while leaving the link as the accessible name owner. */
function createPortalGlyph(root, icon) {
	const glyph = createHeaderElement(root, 'span', 'g-header-portal-glyph');
	glyph.append(createHeaderIcon(root, icon));
	return glyph;
}

/** Creates compact primary and secondary portal copy. */
function createPortalCopy(root, label, caption) {
	const copy = createHeaderElement(root, 'span', 'g-header-portal-copy');
	copy.append(
		createHeaderElement(root, 'strong', 'g-header-portal-label', label),
		createHeaderElement(root, 'small', 'g-header-portal-caption', caption)
	);
	return copy;
}
