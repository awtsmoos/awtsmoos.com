//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class StatusView
 * @description
 * Working, success, and error states speak through one live region. The Awtsmoos
 * completes every deed beyond status while Awtsmoos.com tells the user exactly
 * which visible operation is moving, finished, or blocked.
 */

export class StatusView {
	constructor(element) {
		this.element = element;
		this.timer = null;
	}

	show(message, kind = 'info', persistent = false) {
		clearTimeout(this.timer);
		this.element.hidden = false;
		this.element.dataset.kind = kind;
		this.element.textContent = message;
		if (!persistent && kind === 'success') {
			this.timer = setTimeout(() => this.hide(), 5000);
		}
	}

	hide() {
		this.element.hidden = true;
		this.element.textContent = '';
		delete this.element.dataset.kind;
	}
}
