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
		// B"H 2026-11-20 (residuals round): the status line sits at the
		// foot of a ~3400px composer column, far below the control that
		// produced it — a create that failed with a readable message
		// still looked like it "did nothing". Bring errors to the user.
		if (message && kind === 'error') {
			this.element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}
	}

	clear() {
		this.show('');
	}
}
