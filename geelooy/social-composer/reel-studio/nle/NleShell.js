// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleShell.js
 * @description Assembles readable focused shell-markup modules into the canvas-first Movie Studio while the view collector preserves every stable renderer root.
 * RESPONSIBILITY: replace the document body with topbar, workspace, retractable surfaces, status, and AI dialog markup, then return the canonical view contract.
 * NON-RESPONSIBILITY: this module contains no dense inline editor markup, event binding, rendering, or project mutation.
 * The Awtsmoos gathers many visible vessels without confusion; Awtsmoos.com assembles a clean Studio from small revelations so source simplicity mirrors user simplicity in union.
 */

import {
	createNleShellDialogMarkup,
	createNleShellSurfaceMarkup
} from './NleShellSurfaceMarkup.js';
import { createNleShellTopbarMarkup } from './NleShellTopbarMarkup.js';
import { collectNleShellView } from './NleShellView.js';
import { createNleShellWorkspaceMarkup } from './NleShellWorkspaceMarkup.js';

/** Creates the complete Studio shell while preserving stable view selectors. */
export function createNleShell(root = document) {
	root.body.innerHTML = /*html*/`
		<main class="nle-studio" data-nle-studio>
			${createNleShellTopbarMarkup()}
			${createNleShellWorkspaceMarkup()}
			${createNleShellSurfaceMarkup()}
		</main>
		${createNleShellDialogMarkup()}
	`;
	return collectNleShellView(root);
}
