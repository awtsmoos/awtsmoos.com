//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MediaStudioBridge
 * @description
 * Yesod bridges a new visible control to an old trusted recorder while the Awtsmoos remains beyond old and new.
 * Awtsmoos.com reuses the canonical click path, so existing capture, download, and state logic stay singular instead of splitting into two competing flows.
 */

import { MEDIA_STUDIO_MODES } from './mediaSchema.js';

/** Binds proxy recorder buttons and mirrors legacy recorder labels. @param {Object} dom Media Studio DOM. @returns {Function} Cleanup observers. */
export function bindMediaStudioBridge(dom) {
	const observers = [];
	MEDIA_STUDIO_MODES.forEach((mode) => {
		const proxy = dom.buttons.get(mode.id);
		const target = document.getElementById(mode.targetId);
		if (!proxy || !target) {
			proxy?.setAttribute('disabled', 'true');
			return;
		}
		proxy.addEventListener('click', () => {
			target.click();
			queueMicrotask(() => syncProxy(mode, proxy, target, dom.status));
		});
		const observer = new MutationObserver(() => {
			syncProxy(mode, proxy, target, dom.status);
		});
		observer.observe(target, {
			attributes: true,
			childList: true,
			characterData: true,
			subtree: true
		});
		observers.push(observer);
		syncProxy(mode, proxy, target, dom.status);
	});
	return () => observers.forEach((observer) => observer.disconnect());
}

function syncProxy(mode, proxy, target, status) {
	const text = String(target.textContent || '').trim();
	const active = /^stop\b/i.test(text);
	proxy.classList.toggle('media-studio-recording', active);
	proxy.textContent = active ? `■ Stop ${mode.label.replace(/^\S+\s*/, '')}` : mode.label;
	if (active) {
		status.textContent = `${mode.label} recording active.`;
	}
}
