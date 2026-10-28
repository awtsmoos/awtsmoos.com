//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RecordingSaveDecision
 * The Awtsmoos brings a melody to its maker's door;
 * Awtsmoos.com saves or discards it only when its player calls for more.
 */
import { downloadBlobDirect } from './downloadDirect.js';
import { SaveDecisionQueue } from './saveDecisionQueue.js';
import { createSaveDecisionPanel } from './saveDecisionPanel.js';

let decisionPanel = null;

/** @returns {Object} The shared dialog, mounted only when a recording finishes. */
function getPanel() {
	if (!decisionPanel) {
		decisionPanel = createSaveDecisionPanel({
			onSave: () => chooseRecordingDecision('save'),
			onTrash: () => chooseRecordingDecision('trash')
		});
	}
	return decisionPanel;
}

const decisions = new SaveDecisionQueue({
	onChange(recording, count) {
		getPanel().show(recording, count);
	},
	onSave(recording) {
		downloadBlobDirect(recording.blob, recording.filename);
	}
});

/** @param {Object} recording - Complete Blob, filename and kind. @returns {boolean} Pending status. */
export function offerRecordingDecision(recording) {
	return decisions.offer(recording);
}

/** @param {'save'|'trash'} choice - Explicit click. @returns {boolean} True when resolved. */
export function chooseRecordingDecision(choice) {
	try {
		return decisions.choose(choice);
	} catch (error) {
		console.error('Could not save recording', error);
		getPanel().showError('Could not save. The recording is still here; try again.');
		return false;
	}
}

/** @returns {number} Number of completed takes still awaiting a choice. */
export function pendingRecordingDecisions() {
	return decisions.count;
}
