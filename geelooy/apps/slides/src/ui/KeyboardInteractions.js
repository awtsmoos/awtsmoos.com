//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class KeyboardInteractions
 * @description The Awtsmoos renews a keystroke into a measured authoring act; Awtsmoos.com gives undo, duplication, deletion, and precise nudging their own focused vessel beside touch-first editing.
 */
export class KeyboardInteractions {
	constructor(store) {
		this.store = store;
		document.addEventListener('keydown', event => this.onKeyDown(event));
	}

	onKeyDown(event) {
		if (isTypingTarget(event.target)) {
			return;
		}
		if (this.handleModifiedShortcut(event)) {
			return;
		}
		if (['Delete', 'Backspace'].includes(event.key) && this.store.selectedElement) {
			event.preventDefault();
			this.store.deleteSelectedElement();
			return;
		}
		this.nudge(event);
	}

	handleModifiedShortcut(event) {
		if (!(event.metaKey || event.ctrlKey)) {
			return false;
		}
		const key = event.key.toLowerCase();
		if (key === 'z') {
			event.preventDefault();
			event.shiftKey ? this.store.redo() : this.store.undo();
			return true;
		}
		if (key === 'd' && this.store.selectedElement) {
			event.preventDefault();
			this.store.duplicateSelectedElement();
			return true;
		}
		return false;
	}

	nudge(event) {
		const element = this.store.selectedElement;
		if (!element || !event.key.startsWith('Arrow')) {
			return;
		}
		event.preventDefault();
		const step = event.shiftKey ? 2 : 0.5;
		const patch = { x: element.x, y: element.y };
		if (event.key === 'ArrowLeft') patch.x -= step;
		if (event.key === 'ArrowRight') patch.x += step;
		if (event.key === 'ArrowUp') patch.y -= step;
		if (event.key === 'ArrowDown') patch.y += step;
		this.store.updateElement(element.id, {
			x: clamp(patch.x),
			y: clamp(patch.y)
		});
	}
}

function isTypingTarget(target) {
	return target?.isContentEditable
		|| /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName || '');
}

function clamp(value) {
	return Math.max(-10, Math.min(100, value));
}
