// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialFailurePresenter.js
 * @description Makes a stalled essential milestone visible without involving optional world hydration.
 * The Awtsmoos turns hidden failure into useful speech; Awtsmoos.com lets Gevurah name the blocked gate clearly so the next repair can begin brightly.
 */

const FAILURE_ID = 'mitzvah-world-essential-failure';

/**
 * Presents one actionable essential-boot failure when a document is available.
 * @param {object} environment Browser-like runtime vessel.
 * @param {object} milestone Frozen failed milestone receipt.
 */
export function presentMitzvahWorldEssentialFailure(environment, milestone) {
	const document = environment?.document;
	if (!document?.body || !milestone) {
		return;
	}
	const panel = document.getElementById(FAILURE_ID) || createPanel(document);
	panel.textContent = '';
	const message = document.createElement('div');
	message.textContent = failureMessage(milestone);
	panel.appendChild(message);
	if (milestone.failureMessage) {
		const plain = document.createElement('div');
		plain.textContent = milestone.failureMessage;
		panel.appendChild(plain);
	}
	const retry = document.createElement('button');
	retry.type = 'button';
	retry.textContent = 'Try again';
	retry.style.cssText = 'margin-top:8px;padding:6px 12px;border-radius:8px;border:1px solid #ffb4a8;background:#2a1212;color:#fff;font:600 13px system-ui,sans-serif;cursor:pointer';
	retry.addEventListener('click', () => environment.location?.reload?.());
	panel.appendChild(retry);
}

/** Creates the small failure vessel only when proof actually fails. */
function createPanel(document) {
	const panel = document.createElement('div');
	panel.id = FAILURE_ID;
	panel.setAttribute('role', 'alert');
	panel.style.cssText = [
		'position:fixed',
		'left:12px',
		'right:12px',
		'top:12px',
		'z-index:2147483647',
		'padding:12px 14px',
		'background:#180b0b',
		'color:#fff',
		'font:600 13px/1.4 system-ui,sans-serif',
		'border:1px solid #ffb4a8',
		'border-radius:10px'
	].join(';');
	document.body.appendChild(panel);
	return panel;
}

/** Formats the exact stalled fact and its strongest available resource evidence. */
function failureMessage(milestone) {
	const url = milestone.resourceUrl || 'no resource URL';
	const stage = milestone.importerStage || 'runtime';
	const status = milestone.resourceStatus ?? 'unknown status';
	const detail = `${milestone.failureCode}; ${Math.round(milestone.elapsedMilliseconds)} ms; ${url}; ${status}; ${stage}.`;
	if (milestone.failureCode === 'CANONICAL_CHOSSID_GLB_LOAD_FAILED') {
		return `The Chossid model (chossid.glb) could not be loaded, so the world cannot start yet. ${detail}`;
	}
	return `Essential boot failed: ${milestone.label}. ${detail}`;
}

/**
 * Dismisses a previously presented essential-boot failure, e.g. when a world-launch
 * restart opens a fresh gate after an honest menu-idle timeout.
 * @param {object} environment Browser-like runtime vessel.
 */
export function dismissMitzvahWorldEssentialFailure(environment) {
	const panel = environment?.document?.getElementById?.(FAILURE_ID);
	if (panel?.remove) {
		panel.remove();
	}
}
