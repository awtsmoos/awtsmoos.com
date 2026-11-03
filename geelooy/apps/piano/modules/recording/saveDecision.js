//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RecordingSaveDecision
 * The Awtsmoos lets each note cross the doorway into a finished song;
 * Awtsmoos.com lets its player save, edit, or discard where it belongs.
 */
import { downloadBlobDirect } from './downloadDirect.js';
import { SaveDecisionQueue } from './saveDecisionQueue.js';
import { createSaveDecisionPanel } from './saveDecisionPanel.js';
import { editRecordingInStudio } from './editInStudio.js';

let decisionPanel = null;
let editing = false;

/** @returns {Object} The shared save and edit dialog. */
function getPanel() {
	if (!decisionPanel) {
		decisionPanel = createSaveDecisionPanel({
			onSave: () => chooseRecordingDecision('save'),
			onTrash: () => chooseRecordingDecision('trash'),
			onEdit: () => void editPendingRecording()
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

/** @param {Object} recording - Completed audio/video/text/PNG. */
export function offerRecordingDecision(recording) {
	return decisions.offer(recording);
}

/** @param {'save'|'trash'} choice - Explicit button click. @returns {boolean} Whether resolved. */
export function chooseRecordingDecision(choice) {
	if (editing) return false;
	try {
		return decisions.choose(choice);
	} catch (error) {
		console.error('Could not save recording', error);
		getPanel().showError('Save failed. Your recording is still here; try again.');
		return false;
	}
}

/** Imports current audio take before dismissing the pending recording. */
export async function editPendingRecording() {
	if (editing || !decisions.active) return false;
	editing = true;
	getPanel().setBusy(true);
	try {
		await editRecordingInStudio(decisions.active);
		editing = false;
		return decisions.choose('trash');
	} catch (error) {
		console.error('Could not import recording into Song Studio', error);
		getPanel().showError(`Edit failed: ${error?.message || 'Try again.'} Recording retained.`);
		return false;
	} finally {
		editing = false;
		getPanel().setBusy(false);
	}
}

/** @returns {number} Completed recordings still needing a choice. */
export function pendingRecordingDecisions() {
	return decisions.count;
}
