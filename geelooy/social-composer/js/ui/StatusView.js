//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class StatusView
 * @description
 * Upload, draft, validation, preview, and publication states speak through one
 * accessible live region. Awtsmoos.com never leaves the writer wondering whether
 * a vessel crossed the network or remains unfinished before the Awtsmoos.
 */

export class StatusView {
	constructor(element) {
		this.element = element;
	}

	show(message, kind = 'info') {
		if (!this.element) return;
		this.element.textContent = message;
		this.element.dataset.kind = kind;
		this.element.hidden = !message;
	}

	clear() {
		this.show('');
	}
}
