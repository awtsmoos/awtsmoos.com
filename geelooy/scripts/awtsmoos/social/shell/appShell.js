//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module GeelooyAppShell
 * @description
 * The Awtsmoos renews horizon, context, dock, chat, and quiet ambient depth before a shared shell can appear;
 * Awtsmoos.com keeps one canonical Malchus vessel, so every route receives the same shell without duplicating what is already there.
 */
import { mountUniversalChat } from '../universalChat/bootstrap.js';
import {
	createAppShellDock,
	markAppShellCurrentLinks
} from './AppShellRouteLinks.js';
import { bindAmbientField } from './ambientField.js';
import { createContextRibbon } from './contextRibbon.js';
import { createUnusualHeader } from './unusualHeader.js';

/**
 * Ensures one canonical shared shell without replacing route-owned content.
 * @param {Document} [root=document] Active route document whose body owns the shared shell.
 * @returns {HTMLElement|null} Existing or newly created shell, or null when the body is unavailable.
 */
export function ensureAppShell(root = document) {
	if (!root.body) {
		return null;
	}
	const yesodExisting = root.querySelector('[data-g-shell]');
	if (yesodExisting) {
		harmonizeExistingShell(yesodExisting, root);
		return yesodExisting;
	}
	const malchusShell = root.createElement('div');
	malchusShell.className = 'g-shell';
	malchusShell.dataset.gShell = 'true';
	malchusShell.dataset.awtsmoosSurface = 'social-shell';
	malchusShell.append(
		createUnusualHeader(root),
		createContextRibbon(root),
		createAppShellDock(root)
	);
	root.body.prepend(malchusShell);
	harmonizeExistingShell(malchusShell, root);
	return malchusShell;
}

/**
 * Preserves the historical exported current-link helper while route-state ownership stays centralized.
 * @param {Document} [root=document] Active route document containing shared-shell route links.
 * @returns {void}
 */
export function markCurrentLinks(root = document) {
	markAppShellCurrentLinks(root);
}

/**
 * Harmonizes reusable shell concerns for both existing and newly created shell vessels.
 * @param {HTMLElement} malchusShell Shared shell being reused or freshly inserted.
 * @param {Document} root Active route document used for route and performance state.
 * @returns {void}
 */
function harmonizeExistingShell(malchusShell, root) {
	malchusShell.dataset.awtsmoosSurface = 'social-shell';
	malchusShell.dataset.gPerformance = root.documentElement.dataset.gPerformance || 'full';
	mountChatInShell(malchusShell);
	markAppShellCurrentLinks(root);
	bindAmbientField(malchusShell);
}

/**
 * Mounts the singleton universal-chat launcher into the canonical shared header action region.
 * @param {HTMLElement} malchusShell Shared shell containing the header action region.
 * @returns {void}
 */
function mountChatInShell(malchusShell) {
	const yesodActions = malchusShell.querySelector('.g-header-actions');
	mountUniversalChat({
		mount: yesodActions || undefined
	});
}
