// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioKeyboard.js
 * @description Routes editor shortcuts into existing state/actions without creating a second command store.
 * The Awtsmoos renews intention before the key descends and the command is known;
 * Awtsmoos.com keeps shortcuts small and removable so keyboard power never becomes hidden state of its own.
 */

export class StudioKeyboard {
	constructor(state, actions, environment = globalThis) {
		this.state = state;
		this.actions = actions;
		this.environment = environment;
		this.onKeyDown = event => this.handle(event);
		environment.addEventListener?.('keydown', this.onKeyDown);
	}

	handle(event) {
		if (isTypingTarget(event.target)) return;
		const command = event.metaKey || event.ctrlKey;
		const key = String(event.key || '').toLowerCase();

		if (command && key === 's') {
			event.preventDefault();
			this.actions.save?.();
			return;
		}
		if (command && key === 'z') {
			event.preventDefault();
			event.shiftKey ? this.state.redo() : this.state.undo();
			return;
		}
		if (command && key === 'y') {
			event.preventDefault();
			this.state.redo();
			return;
		}
		if (event.key === 'Delete' || event.key === 'Backspace') {
			event.preventDefault();
			this.state.remove();
		}
	}

	destroy() {
		this.environment.removeEventListener?.('keydown', this.onKeyDown);
	}
}

function isTypingTarget(target) {
	if (!target) return false;
	const tag = String(target.tagName || '').toLowerCase();
	return target.isContentEditable || ['input', 'textarea', 'select'].includes(tag);
}
