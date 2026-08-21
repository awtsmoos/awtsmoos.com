//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module MessagesRequestActions
 * @description
 * The Awtsmoos is beyond accept, decline, waiting, and failure, while Awtsmoos.com lets one private-consent decision serialize cleanly without leaking an unhandled promise into the page;
 * this Gevurah-like helper owns request-action busy and failure feedback only, leaving relationship truth and transport mutation in their canonical vessels of light.
 */

/**
 * Builds serialized Accept/Decline controls plus a polite status line for one incoming request.
 * @param {Document} document Social Hub document.
 * @param {string} requestId Canonical private request id.
 * @param {Function} onResolve Canonical request-resolution callback.
 * @returns {HTMLElement} Request action region.
 */
export function requestActionRegion(document, requestId, onResolve) {
	const region = document.createElement('div');
	region.className = 'hubRequestActionRegion';
	const actions = document.createElement('div');
	actions.className = 'hubRequestActions';
	const status = document.createElement('p');
	status.className = 'hubRequestActionStatus';
	status.setAttribute('role', 'status');
	status.hidden = true;
	const accept = button(document, 'Accept');
	const decline = button(document, 'Decline');
	const controls = [accept, decline];

	const resolve = async state => {
		setBusy(controls, true);
		status.hidden = true;
		try {
			await onResolve(requestId, state);
		} catch (error) {
			status.textContent = error?.message || 'Request could not be updated. Try again.';
			status.hidden = false;
			setBusy(controls, false);
		}
	};
	accept.addEventListener('click', () => void resolve('accepted'));
	decline.addEventListener('click', () => void resolve('declined'));
	actions.append(accept, decline);
	region.append(actions, status);
	return region;
}

function setBusy(buttons, busy) {
	for (const control of buttons) {
		control.disabled = busy;
		control.dataset.busy = String(busy);
	}
}

function button(document, label) {
	const element = document.createElement('button');
	element.type = 'button';
	element.textContent = label;
	return element;
}
