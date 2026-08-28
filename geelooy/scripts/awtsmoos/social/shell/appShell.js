//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module GeelooyAppShell
 * @description
 * The Awtsmoos renews horizon, context, dock, chat, and quiet ambient depth before a shared shell can appear;
 * Awtsmoos.com keeps this Tiferes composer small, delegating route identity and ambient behavior so every finite collaborator guards its proper sphere.
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
 * @description Ensures one canonical shared shell without replacing route-owned content, then harmonizes chat, current-route state, performance evidence, and localized ambient behavior.
 * @param {Document} [malchusDocument=document] Active route document whose body owns the shared shell.
 * @returns {HTMLElement|null} Existing or newly created shell, or null when the document body is unavailable.
 */
export function ensureAppShell(malchusDocument = document) {
	if (!malchusDocument.body) return null;
	const yesodExisting = malchusDocument.querySelector('[data-g-shell]');
	if (yesodExisting) {
		harmonizeExistingShell(yesodExisting, malchusDocument);
		return yesodExisting;
	}
	const tiferesShell = malchusDocument.createElement('div');
	tiferesShell.className = 'g-shell';
	tiferesShell.dataset.gShell = 'true';
	tiferesShell.dataset.awtsmoosSurface = 'social-shell';
	tiferesShell.append(
		createUnusualHeader(malchusDocument),
		createContextRibbon(malchusDocument),
		createAppShellDock(malchusDocument)
	);
	malchusDocument.body.prepend(tiferesShell);
	harmonizeExistingShell(tiferesShell, malchusDocument);
	return tiferesShell;
}

/**
 * @description Preserves the historical exported current-link helper while delegating route-state ownership to the focused route-link module.
 * @param {Document} [malchusDocument=document] Active route document containing shared-shell route links.
 * @returns {void} Mutates only current-state attributes on canonical shell-owned links.
 */
export function markCurrentLinks(malchusDocument = document) {
	markAppShellCurrentLinks(malchusDocument);
}

/**
 * @description Harmonizes reusable shell concerns so existing and newly created shells receive identical localized behavior and performance posture.
 * @param {HTMLElement} tiferesShell Shared shell element being reused or freshly inserted.
 * @param {Document} malchusDocument Active route document used for route-state and performance evidence.
 * @returns {void} Mounts chat, marks links, mirrors performance state, and binds idempotent ambient behavior.
 */
function harmonizeExistingShell(tiferesShell, malchusDocument) {
	tiferesShell.dataset.awtsmoosSurface = 'social-shell';
	tiferesShell.dataset.gPerformance = malchusDocument.documentElement.dataset.gPerformance || 'full';
	mountChatInShell(tiferesShell);
	markAppShellCurrentLinks(malchusDocument);
	bindAmbientField(tiferesShell);
}

/**
 * @description Mounts the singleton universal-chat launcher into the shared header action region without creating a second route-local chat doorway.
 * @param {HTMLElement} tiferesShell Shared shell containing the canonical header action region.
 * @returns {void} Delegates singleton mounting to the universal-chat bootstrap API.
 */
function mountChatInShell(tiferesShell) {
	const yesodActions = tiferesShell.querySelector('.g-header-actions');
	mountUniversalChat({
		mount: yesodActions || undefined
	});
}
