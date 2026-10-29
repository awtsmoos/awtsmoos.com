//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RecordingSaveDecisionPanel
 * The Awtsmoos lets a finished take enter the studio through a new door;
 * Awtsmoos.com gives Save, Edit, and Trash as choices to explore.
 */
import { createDecisionFocus } from './saveDecisionFocus.js';

/** @param {string} tag - Element type. @param {string} content - Safe label. */
function element(tag, content = '') {
	const node = document.createElement(tag);
	node.textContent = content;
	return node;
}

/** @param {Object} handlers - Completed recording actions. @returns {Object} Modal view. */
export function createSaveDecisionPanel({ onSave, onTrash, onEdit }) {
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
	const explanation = element('p', 'Save this recording, edit audio in Studio, or discard it.');
	const filename = element('strong');
	filename.className = 'awtsmoos-save-filename';
	const preview = element('div');
	preview.className = 'awtsmoos-save-preview';
	const message = element('p');
	message.className = 'awtsmoos-save-message';
	message.setAttribute('aria-live', 'polite');
	const actions = element('div');
	actions.className = 'awtsmoos-save-actions';
	const save = createAction('Save to device', 'awtsmoos-save-confirm', onSave);
	const edit = createAction('✂ Edit in Studio', 'awtsmoos-save-edit', onEdit);
	const trash = createAction('Trash recording', 'awtsmoos-save-trash', onTrash);
	actions.append(save, edit, trash);
	dialog.append(heading, explanation, filename, preview, message, actions);
	backdrop.appendChild(dialog);
	document.body.appendChild(backdrop);
	const focus = createDecisionFocus(dialog, save);
	let previewUrl = null;

	/** @param {Object|null} recording - Pending take. @param {number} count - Queue size. */
	function show(recording, count) {
		preview.querySelector('audio, video')?.pause();
		preview.replaceChildren();
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		previewUrl = null;
		backdrop.hidden = !recording;
		focus.setOpen(Boolean(recording));
		if (!recording) return;
		filename.textContent = recording.filename;
		message.textContent = count > 1
			? `${count} recordings pending. Choose what to do with this one.`
			: 'Keep this page open until you choose an action.';
		const kind = recording.kind || recording.blob.type.split('/')[0];
		edit.hidden = kind !== 'audio';
		let media = null;
		if (kind === 'audio' || kind === 'video') {
			media = element(kind);
			media.controls = true;
			media.preload = 'metadata';
		} else if (kind === 'image') {
			media = element('img');
			media.alt = 'Preview of the recorded music sheet';
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
		showError(text) { message.textContent = text; },
		setBusy(busy) {
			save.disabled = busy;
			trash.disabled = busy;
			edit.disabled = busy;
			if (busy) message.textContent = 'Importing recording into Song Studio…';
		}
	};
}

/** @returns {HTMLButtonElement} One labeled action. */
function createAction(label, className, callback) {
	const button = element('button', label);
	button.type = 'button';
	button.className = className;
	button.addEventListener('click', callback);
	return button;
}
