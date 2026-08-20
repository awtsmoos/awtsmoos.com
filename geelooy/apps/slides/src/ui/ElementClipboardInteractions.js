//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class ElementClipboardInteractions
 * @description The Awtsmoos lets one finite form be remembered, released, and renewed elsewhere; Awtsmoos.com keeps keyboard and touch clipboard acts inside one focused vessel without trusting browser clipboard serialization.
 */
export class ElementClipboardInteractions {
	constructor(store) {
		this.store = store;
		this.copiedElement = null;
		document.addEventListener('keydown', event => this.onKeyDown(event));
		document.addEventListener('click', event => this.onClick(event));
	}

	onKeyDown(event) {
		if (isTypingTarget(event.target) || !(event.metaKey || event.ctrlKey)) {
			return;
		}
		const key = event.key.toLowerCase();
		if (key === 'c' && this.store.selectedElement) {
			event.preventDefault();
			this.copySelected();
		} else if (key === 'x' && this.store.selectedElement) {
			event.preventDefault();
			this.cutSelected();
		} else if (key === 'v' && this.copiedElement) {
			event.preventDefault();
			this.paste();
		}
	}

	onClick(event) {
		const action = event.target.closest('[data-action]')?.dataset.action;
		if (action === 'copy-element') {
			this.copySelected();
		} else if (action === 'cut-element') {
			this.cutSelected();
		} else if (action === 'paste-element') {
			this.paste();
		}
	}

	copySelected() {
		if (!this.store.selectedElement) {
			return false;
		}
		this.copiedElement = cloneElement(this.store.selectedElement);
		return true;
	}

	cutSelected() {
		if (!this.copySelected()) {
			return false;
		}
		this.store.deleteSelectedElement();
		return true;
	}

	paste() {
		if (!this.copiedElement) {
			return null;
		}
		const copied = cloneElement(this.copiedElement);
		const { id, type, ...overrides } = copied;
		overrides.x = Number(overrides.x || 0) + 2;
		overrides.y = Number(overrides.y || 0) + 2;
		this.store.addElement(type, overrides);
		this.copiedElement = cloneElement(this.store.selectedElement);
		return this.store.selectedElement?.id || null;
	}
}

function cloneElement(element) {
	return element ? JSON.parse(JSON.stringify(element)) : null;
}

function isTypingTarget(target) {
	return target?.isContentEditable
		|| /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName || '');
}
