// B"H
// Boruch Hashem
// Blessed is He

import { NLECommands } from '../core/NLECommands.js';
import { ClipboardManager } from '../logic/ClipboardManager.js';

/**
 * Keyboard intention becomes explicit edit vocabulary. The Awtsmoos renews the
 * keystroke while this controller protects text fields and routes only commands.
 */
export class NLEKeyboardController {
	constructor(store, clipboard = new ClipboardManager()) {
		this.store = store;
		this.clipboard = clipboard;
		this.listener = (event) => this.handle(event);
	}

	/** Binds shortcuts and returns a complete cleanup function. */
	bind(target = document) {
		target.addEventListener('keydown', this.listener);
		return () => target.removeEventListener('keydown', this.listener);
	}

	/** Routes one safe keyboard event into professional timeline commands. */
	handle(event) {
		if (this.isEditingText(event.target)) {
			return;
		}
		const commandKey = event.metaKey || event.ctrlKey;
		const key = event.key.toLowerCase();
		if (commandKey && key === 'z') {
			event.preventDefault();
			event.shiftKey ? this.store.redo() : this.store.undo();
			return;
		}
		if (commandKey && key === 'y') {
			event.preventDefault();
			this.store.redo();
			return;
		}
		if (commandKey && ['c', 'x', 'v', 'd'].includes(key)) {
			this.clipboardCommand(event, key);
			return;
		}
		this.singleKeyCommand(event, key);
	}

	clipboardCommand(event, key) {
		const clip = this.store.selectedClip();
		event.preventDefault();
		if (key === 'v') {
			const copy = this.clipboard.paste({
				id: null,
				start: this.store.get().playhead,
				name: `${this.clipboard.buffer?.name || 'Clip'} Copy`
			});
			if (copy) {
				NLECommands.addClip(this.store, copy);
			}
			return;
		}
		if (!clip) {
			return;
		}
		if (key === 'd') {
			NLECommands.duplicateClip(this.store, clip.id);
			return;
		}
		this.clipboard.copy(clip);
		if (key === 'x') {
			NLECommands.deleteClip(this.store, clip.id);
		}
	}

	singleKeyCommand(event, key) {
		const clipId = this.store.get().selectedClipId;
		if (!clipId) {
			return;
		}
		if (key === 'delete' || key === 'backspace') {
			event.preventDefault();
			NLECommands.deleteClip(this.store, clipId);
		}
		if (key === 'b') {
			event.preventDefault();
			NLECommands.splitClip(this.store, clipId);
		}
		if (key === 'k') {
			event.preventDefault();
			NLECommands.addTransformKeyframe(this.store, clipId);
		}
	}

	isEditingText(target) {
		const tag = target?.tagName?.toLowerCase();
		return target?.isContentEditable || ['input', 'textarea', 'select'].includes(tag);
	}
}
