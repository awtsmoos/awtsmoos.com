// B"H
// Boruch Hashem
// Blessed is He

import { NLEHistory } from './NLEHistory.js';
import { NLEProjectValueEquality } from './NLEProjectValueEquality.js';

/**
 * @file NLEProjectSnapshot.js
 * @description
 * The Awtsmoos renews the authored world while the editor's passing gaze may roam;
 * Awtsmoos.com keeps project substance in history, while transient workspace light stays home.
 * Binary media, dates, buffers, arrays, and ordinary objects each receive a truthful comparison throne.
 */

const TRANSIENT_KEYS = new Set([
	'history',
	'playhead',
	'zoom',
	'snap',
	'mode',
	'selectedClipId',
	'selectedEntityId',
	'currentShot',
	'currentSpeaker',
	'currentLine',
	'videoImportStatus',
	'videoImportError',
	'mediaRestoreStatus',
	'mediaRestoreErrors',
	'persistenceDurable',
	'projectPackageStatus',
	'projectPackageError',
	'projectPackageFileCount',
	'projectPackageMode',
	'studioLeftPanel',
	'studioAssetFilter',
	'studioPrompt',
	'studioPromptPreview',
	'studioPromptPreviewSummary',
	'studioJsonText',
	'studioJsonError',
	'activePanel',
	'mobilePanel',
	'searchQuery',
	'exportStatus',
	'exportError'
]);

/** Separates durable creative state from transient editor state. */
export class NLEProjectSnapshot {
	/** Captures only project-bearing values; unknown fields are project data by default. */
	static capture(state = {}) {
		const entries = Object.entries(state).filter(([key]) => {
			return !TRANSIENT_KEYS.has(key);
		});
		return NLEHistory.clone(Object.fromEntries(entries));
	}

	/** Restores project data while preserving the transient state visible right now. */
	static merge(currentState = {}, snapshot = {}) {
		const transientEntries = Object.entries(currentState).filter(([key]) => {
			return TRANSIENT_KEYS.has(key);
		});
		const transientState = NLEHistory.clone(Object.fromEntries(transientEntries));
		const projectState = this.capture(snapshot);
		return { ...transientState, ...projectState };
	}

	/** Compares project graphs while honoring special binary and temporal values. */
	static equals(left, right) {
		if (left === right) {
			return true;
		}
		const specialResult = NLEProjectValueEquality.compare(left, right);
		if (specialResult !== null) {
			return specialResult;
		}
		if (!left || !right || typeof left !== 'object' || typeof right !== 'object') {
			return false;
		}
		if (Array.isArray(left) || Array.isArray(right)) {
			return this.equalArrays(left, right);
		}
		return this.equalObjects(left, right);
	}

	/** Compares ordered arrays recursively. */
	static equalArrays(left, right) {
		if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
			return false;
		}
		return left.every((value, index) => this.equals(value, right[index]));
	}

	/** Compares ordinary object keys and values recursively. */
	static equalObjects(left, right) {
		const leftKeys = Object.keys(left);
		const rightKeys = Object.keys(right);
		if (leftKeys.length !== rightKeys.length) {
			return false;
		}
		return leftKeys.every((key) => {
			return Object.prototype.hasOwnProperty.call(right, key)
				&& this.equals(left[key], right[key]);
		});
	}
}
