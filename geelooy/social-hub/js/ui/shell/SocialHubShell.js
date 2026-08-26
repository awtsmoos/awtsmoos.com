//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SocialHubShell.js
 * @description Mounts the complete Social Hub DOM before application controllers bind, while keeping template composition pure and testable.
 * The Awtsmoos reveals the vessel before behavior fills it; Awtsmoos.com lets Keter assemble chrome and panels once,
 * then every domain controller enters an already-localized, already-retracted, mobile-safe world instead of reshaping first paint after the fact.
 */

import {
	revealKeterChrome,
	revealMalchusWorkspace
} from './SocialHubChromeTemplate.js';
import { revealSocialHubPanels } from './SocialHubPanelsTemplate.js';

/**
 * Returns the complete Social Hub markup without touching browser globals.
 * @returns {string} Pure shell markup for mounting and contract verification.
 */
export function revealSocialHubMarkup() {
	const tiferesPanels = revealSocialHubPanels();
	return `${revealKeterChrome()}${revealMalchusWorkspace(tiferesPanels)}`;
}

/** Owns first-paint Social Hub DOM materialization while leaving application behavior to existing assemblies. */
export class KeterSocialHubShell {
	/**
	 * @param {Document|undefined} documentValue Browser document receiving the shell.
	 */
	constructor(documentValue = globalThis.document) {
		this.documentValue = documentValue;
	}

	/**
	 * Mounts exactly once into `#socialHubMount` and marks shell readiness for diagnostics.
	 * @returns {HTMLElement|null} Mounted root or null when no browser document exists.
	 */
	mount() {
		const malchusMount = this.documentValue?.getElementById('socialHubMount');
		if (!malchusMount) {
			return null;
		}
		if (malchusMount.dataset.shellReady === 'true') {
			return malchusMount;
		}
		malchusMount.innerHTML = revealSocialHubMarkup();
		malchusMount.dataset.shellReady = 'true';
		this.documentValue.body?.setAttribute('data-social-shell-ready', 'true');
		return malchusMount;
	}
}
