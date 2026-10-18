//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveBrowserTerminalView
 * @description Ends Drive loading truthfully when identity cannot open a file list.
 * The Awtsmoos contains both presence and absence; Awtsmoos.com never paints an eternal
 * skeleton after it already knows which human action is required.
 */
export class DriveBrowserTerminalView {
	constructor(documentRef = document) {
		this.document = documentRef;
	}

	/** Shows the stable signed-out/no-alias state and removes all loading semantics. */
	renderIdentityRequired() {
		this.render(
			'Choose an account to open Drive',
			'Sign in or choose an owned alias above. Your files will appear here after connection.',
			'Account required'
		);
	}

	/** Shows an explicit account failure instead of leaving stale skeletons behind. */
	renderIdentityError(reason) {
		const detail = reason?.message
			? `Drive could not open the account: ${reason.message}`
			: 'Drive could not open the account. Choose an account or try again.';
		this.render('Drive account unavailable', detail, 'Account unavailable');
	}

	render(title, detail, countLabel) {
		const host = this.document.querySelector('#entry-rows');
		const itemCount = this.document.querySelector('#drive-item-count');
		const location = this.document.querySelector('#drive-location');
		const up = this.document.querySelector('#path-back');
		if (host) {
			host.removeAttribute('aria-busy');
			const empty = this.document.createElement('div');
			empty.className = 'drive-empty';
			const heading = this.document.createElement('strong');
			heading.textContent = title;
			const body = this.document.createElement('span');
			body.textContent = detail;
			empty.append(heading, body);
			host.replaceChildren(empty);
		}
		if (itemCount) itemCount.textContent = countLabel;
		if (location) location.textContent = 'My Drive';
		if (up) {
			up.disabled = true;
			up.title = 'Choose an account before browsing folders';
		}
	}
}
