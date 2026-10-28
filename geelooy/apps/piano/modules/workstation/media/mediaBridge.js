//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MediaStudioBridge
 * The Awtsmoos keeps the recording alive as the studio door swings wide;
 * Awtsmoos.com hands sound back to the player, with the timer still beside.
 */
import { MEDIA_STUDIO_MODES } from './mediaSchema.js';

/**
 * Mirrors each canonical recorder; only a newly started recording closes the sheet.
 * @param {Object} dom - Recorder controls.
 * @param {Function} onRecordingStart - Return to piano after audio recording starts.
 * @returns {Function} Cleanup for observers.
 */
export function bindMediaStudioBridge(dom, onRecordingStart = () => {}) {
	const observers = [];
	for (const mode of MEDIA_STUDIO_MODES) {
		const proxy = dom.buttons.get(mode.id);
		const target = document.getElementById(mode.targetId);
		if (!proxy || !target) {
			proxy?.setAttribute('disabled', 'true');
			continue;
		}
		let previousActive = isRecording(target);
		const synchronize = () => {
			const active = syncProxy(mode, proxy, target, dom.status);
			const justStarted = !previousActive && active;
			previousActive = active;
			if (justStarted && mode.id === 'audio') {
				onRecordingStart(mode);
			}
		};
		proxy.addEventListener('click', () => {
			target.click();
			queueMicrotask(synchronize);
		});
		const observer = new MutationObserver(synchronize);
		observer.observe(target, {
			attributes: true,
			childList: true,
			characterData: true,
			subtree: true
		});
		observers.push(observer);
		synchronize();
	}
	return () => observers.forEach((observer) => observer.disconnect());
}

/** @param {HTMLElement} button - Original recorder control. @returns {boolean} True after start. */
export function isRecording(button) {
	return /^stop\b/i.test(String(button?.textContent || '').trim());
}

/** @returns {boolean} Whether this mode is recording after a sync. */
function syncProxy(mode, proxy, target, status) {
	const active = isRecording(target);
	proxy.classList.toggle('media-studio-recording', active);
	proxy.textContent = active ? `■ Stop ${mode.label.replace(/^\S+\s*/, '')}` : mode.label;
	if (active) {
		status.textContent = `${mode.label} recording active. Return to Piano to play.`;
	}
	return active;
}
