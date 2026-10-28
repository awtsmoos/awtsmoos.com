//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MediaStudioWorkstation
 * The Awtsmoos keeps every note recording even after the studio goes away;
 * Awtsmoos.com puts a Back to Piano button within reach when fingers play.
 */
import { bindMediaStudioBridge } from './mediaBridge.js';
import { createMediaStudioPanelDom } from './mediaPanelDom.js';
import { ensureMediaStudioStyles } from './mediaStyles.js';

let workstation = null;

/** @returns {Object|null} Shared compact media workstation, mounted once. */
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
	dom.closeBottom.addEventListener('click', () => setPanelOpen(dom, false));
	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape' && !dom.panel.classList.contains('media-studio-hidden')) {
			setPanelOpen(dom, false);
		}
	});
	const cleanup = bindMediaStudioBridge(dom, () => setPanelOpen(dom, false));
	workstation = { dom, cleanup };
	return workstation;
}

/**
 * Changes only panel visibility; a running MediaRecorder remains untouched.
 * @param {Object} dom - Panel and launcher.
 * @param {boolean} open - New visibility.
 */
export function setPanelOpen(dom, open) {
	dom.panel.classList.toggle('media-studio-hidden', !open);
	dom.launcher.classList.toggle('media-studio-launcher-active', open);
	dom.launcher.setAttribute('aria-expanded', String(open));
	if (open) {
		dom.panel.focus?.({ preventScroll: true });
	}
}
