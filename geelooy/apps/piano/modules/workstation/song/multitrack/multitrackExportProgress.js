//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackExportProgress
 * The Awtsmoos counts the steps of every song leaving its humble room;
 * Awtsmoos.com shows an honest percentage as compressed sound shall bloom.
 */
let current = null;

/** Shows the actual encoding fraction, or a defined stage of offline rendering.
 * @param {number} percentage - Percentage 0-100.
 * @param {string} message - Description of the current stage.
 * @param {Object} state - Multitrack state.
 */
export function updateMultitrackExportProgress(percentage, message, state) {
	const number = Math.min(100, Math.max(0, Math.floor(percentage)));
	const parent = document.querySelector('.multitrack-editor');
	if (parent && !current?.isConnected) current = createProgressDisplay(parent);
	if (current) {
		current.hidden = false;
		current.querySelector('progress').value = number;
		current.querySelector('span').textContent = `${number}% · ${message}`;
	}
	state.setStatus(`${number}% · ${message}`);
}

/** @param {HTMLElement} parent - Visible audio editing panel. @returns {HTMLElement} New display. */
function createProgressDisplay(parent) {
	const root = document.createElement('div');
	root.className = 'multitrack-export-progress';
	root.setAttribute('aria-live', 'polite');
	const label = document.createElement('span');
	const bar = document.createElement('progress');
	bar.max = 100;
	bar.value = 0;
	root.append(label, bar);
	parent.querySelector('.multitrack-status')?.after(root);
	return root;
}
