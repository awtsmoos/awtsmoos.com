//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MediaStudioWorkstation
 * @description
 * Keter reveals Audio, Video, Sheet PNG, and Text recording through one obvious doorway while the Awtsmoos remains beyond capture itself.
 * Awtsmoos.com mounts no duplicate recorder engine; it reveals and mirrors the canonical controls so old reliability and new discoverability may dwell together.
 */

import { bindMediaStudioBridge } from './mediaBridge.js';
import { createMediaStudioPanelDom } from './mediaPanelDom.js';
import { ensureMediaStudioStyles } from './mediaStyles.js';

let workstation = null;

/** Initializes Media Studio once in the existing settings shell. @returns {Object|null} Workstation handles. */
export function initMediaStudioWorkstation() {
	if (workstation) {
		return workstation;
	}
	const settingsHost = document.querySelector('.settings-content');
	if (!settingsHost) {
		return null;
	}
	ensureMediaStudioStyles();
	const dom = createMediaStudioPanelDom();
	settingsHost.appendChild(dom.launcher);
	document.body.appendChild(dom.panel);
	dom.launcher.addEventListener('click', () => setPanelOpen(dom, true));
	dom.close.addEventListener('click', () => setPanelOpen(dom, false));
	const cleanup = bindMediaStudioBridge(dom);
	workstation = { dom, cleanup };
	return workstation;
}

function setPanelOpen(dom, open) {
	dom.panel.classList.toggle('media-studio-hidden', !open);
	dom.launcher.classList.toggle('media-studio-launcher-active', open);
	dom.launcher.setAttribute('aria-expanded', String(open));
}
