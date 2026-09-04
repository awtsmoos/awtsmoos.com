//B"H
// Boruch Hashem
// Blessed is He
/**
* @file HistoryKeyboardController.js
* @description Routes familiar history shortcuts through the same public creative command API used by every other operator.
* The Awtsmoos lets a key become a command without stealing a text field's local past;
* Awtsmoos.com keeps Undo and Redo inside one truthful gate from first keystroke to last.
*/
const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

/** Binds one disposable keyboard-history controller to the supplied event target. */
export function bindHistoryKeyboard(options = {}) {
	const controller = new HistoryKeyboardController(options);
	controller.bind();
	return controller;
}

/** Owns global history shortcuts while preserving local text-editing semantics. */
export class HistoryKeyboardController {
	constructor({ api, eventTarget = globalThis, onAfterCommand, setStatus } = {}) {
		this.api = api;
		this.eventTarget = eventTarget;
		this.onAfterCommand = onAfterCommand;
		this.setStatus = setStatus;
		this.boundKeydown = (event) => this.handleKeydown(event);
		this.isBound = false;
	}

	/** Attaches exactly one keydown listener. */
	bind() {
		if (this.isBound || typeof this.eventTarget?.addEventListener !== 'function') {
			return this;
		}
		this.eventTarget.addEventListener('keydown', this.boundKeydown);
		this.isBound = true;
		return this;
	}

	/** Removes the listener so future hot-reload or remount flows cannot double-dispatch history. */
	dispose() {
		if (!this.isBound || typeof this.eventTarget?.removeEventListener !== 'function') {
			return;
		}
		this.eventTarget.removeEventListener('keydown', this.boundKeydown);
		this.isBound = false;
	}

	/** Resolves and executes one recognized Studio-level history shortcut. */
	async handleKeydown(event) {
		if (!this.api || isEditableTarget(event?.target)) {
			return false;
		}
		const commandId = historyCommandForEvent(event);
		if (!commandId) {
			return false;
		}
		event.preventDefault?.();
		const command = exactCommand(this.api, commandId);
		if (!command?.available) {
			this.setStatus?.(command?.unavailableReason || `Nothing to ${commandId.endsWith('undo') ? 'undo' : 'redo'}.`);
			return true;
		}
		try {
			await this.api.execute(commandId, {}, { source: 'human' });
			this.setStatus?.(`${command.label} complete.`);
			this.onAfterCommand?.();
		} catch (error) {
			this.setStatus?.(error?.message || String(error));
		}
		return true;
	}
}

/** Maps supported platform history chords to stable command identities. */
export function historyCommandForEvent(event = {}) {
	const key = String(event.key || '').toLowerCase();
	if (event.altKey || (!event.metaKey && !event.ctrlKey)) {
		return null;
	}
	if (key === 'z') {
		return event.shiftKey ? 'history.redo' : 'history.undo';
	}
	if (key === 'y' && event.ctrlKey && !event.metaKey && !event.shiftKey) {
		return 'history.redo';
	}
	return null;
}

/** Detects native editing surfaces whose local browser undo must remain untouched. */
export function isEditableTarget(target) {
	if (!target) {
		return false;
	}
	if (EDITABLE_TAGS.has(String(target.tagName || '').toUpperCase())) {
		return true;
	}
	return Boolean(target.isContentEditable || target.closest?.('[contenteditable="true"]'));
}

/** Reads the exact contextual command record without accepting fuzzy-search neighbors. */
function exactCommand(api, commandId) {
	return api.searchCommands(commandId).find((command) => command.id === commandId) || null;
}
