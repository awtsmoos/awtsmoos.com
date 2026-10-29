//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RecordingSaveDecisionPanel
 * The Awtsmoos offers each finished song to its maker's voice;
 * Awtsmoos.com keeps Save and Trash accessible without an accidental choice.
 */
import { createDecisionFocus } from './saveDecisionFocus.js';

/** @param {string} tag - HTML element. @param {string} text - Safe text. */
function element(tag, text = '') {
	const node = document.createElement(tag);
	node.textContent = text;
	return node;
}

/** @param {Object} handlers - Save and Trash actions. @returns {Object} Modal controller. */
export function createSaveDecisionPanel({ onSave, onTrash }) {
	const stylesheet = element('link');
	stylesheet.rel = 'stylesheet';
	stylesheet.href = new URL('./saveDecisionStyles.css', import.meta.url).href;
	document.head.appendChild(stylesheet);
	const backdrop = element('div');
	backdrop.className = 'awtsmoos-save-decision-backdrop';
	backdrop.hidden = true;
	const dialog = element('section');
	dialog.className = 'awtsmoos-save-decision';
	dialog.setAttribute('role', 'alertdialog');
	dialog.setAttribute('aria-modal', 'true');
	dialog.setAttribute('aria-labelledby', 'awtsmoos-save-title');
	const heading = element('h2', 'Recording finished');
	heading.id = 'awtsmoos-save-title';
	const explanation = element('p', 'Save this recording to your device or send it to Trash.');
	const filename = element('strong');
	filename.className = 'awtsmoos-save-filename';
	const preview = element('div');
	preview.className = 'awtsmoos-save-preview';
	const message = element('p', 'This recording stays until you choose.');
	message.className = 'awtsmoos-save-message';
	message.setAttribute('aria-live', 'polite');
	const actions = element('div');
	actions.className = 'awtsmoos-save-actions';
	const save = element('button', 'Save to device');
	save.type = 'button';
	save.className = 'awtsmoos-save-confirm';
	const trash = element('button', 'Trash recording');
	trash.type = 'button';
	trash.className = 'awtsmoos-save-trash';
	actions.append(save, trash);
	dialog.append(heading, explanation, filename, preview, message, actions);
	backdrop.appendChild(dialog);
	document.body.appendChild(backdrop);
	const focus = createDecisionFocus(dialog, save);
	let previewUrl = null;
	save.addEventListener('click', onSave);
	trash.addEventListener('click', onTrash);

	/** @param {Object|null} recording - Pending file or null. @param {number} count - Number awaiting choice. */
	function show(recording, count) {
		preview.querySelector('audio, video')?.pause();
		preview.replaceChildren();
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			previewUrl = null;
		}
		backdrop.hidden = !recording;
		focus.setOpen(Boolean(recording));
		if (!recording) {
			return;
		}
		filename.textContent = recording.filename;
		message.textContent = count > 1
			? `${count} recordings await your choice. This is the first.`
			: 'Keep this page open until you choose Save or Trash.';
		const kind = recording.kind || recording.blob.type.split('/')[0];
		let media = null;
		if (kind === 'audio' || kind === 'video') {
			media = element(kind);
			media.controls = true;
			media.preload = 'metadata';
		} else if (kind === 'image') {
			media = element('img');
			media.alt = 'Preview of the recorded sheet music';
		}
		if (media) {
			previewUrl = URL.createObjectURL(recording.blob);
			media.src = previewUrl;
			preview.appendChild(media);
		}
		save.focus({ preventScroll: true });
	}
	return {
		show,
		showError(text) {
			message.textContent = text;
		}
	};
}
