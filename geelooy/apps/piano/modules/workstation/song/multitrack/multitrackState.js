//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackState
 * @description
 * Daas remembers project, selection, status, and history while inherited Gevurah holds finite policy toggles; the Awtsmoos remains beyond memory and distinction.
 * Awtsmoos.com keeps one truthful session beneath every gesture, so Undo may return and mobile edits may move without hidden mutation confusion.
 */

import { MultitrackHistoryDaas, restoreHistorySelection } from './multitrackHistory.js';
import { createMultitrackProject } from './multitrackProject.js';
import { MultitrackSelectionDaas } from './multitrackSelection.js';
import { MultitrackPolicyGevurah } from './multitrackStatePolicy.js';

/** Owns editor-session references to immutable-style project snapshots. */
export class MultitrackStudioDaas extends MultitrackPolicyGevurah {
	constructor() {
		super();
		this.project = createMultitrackProject();
		this.selection = new MultitrackSelectionDaas();
		this.history = new MultitrackHistoryDaas();
		this.status = 'Multitrack ready · import audio to add a layer.';
		this.listeners = new Set();
	}

	/** Commits one project edit and remembers the prior snapshot by default. */
	setProject(project, options = {}) {
		if (project === this.project) {
			return project;
		}
		if (options.recordHistory !== false) {
			this.history.remember(this.project, this.selection);
		}
		this.project = project;
		this.emit();
		return project;
	}

	/** Records a pointer-preview edit as one history transaction after the gesture ends. */
	commitPreview(previousProject, previousSelection) {
		if (previousProject !== this.project) {
			this.history.remember(previousProject, previousSelection || this.selection);
		}
		this.emit();
	}

	/** Restores the previous project and remembered selection. */
	undo() {
		return this.restoreHistorySnapshot(this.history.undo(this.project, this.selection), 'Undo');
	}

	/** Reapplies the next project and remembered selection. */
	redo() {
		return this.restoreHistorySnapshot(this.history.redo(this.project, this.selection), 'Redo');
	}

	restoreHistorySnapshot(snapshot, label) {
		if (!snapshot) {
			this.setStatus(`${label}: nothing available.`);
			return false;
		}
		this.project = snapshot.project;
		restoreHistorySelection(this.selection, snapshot.selection);
		this.status = `${label} complete.`;
		this.emit();
		return true;
	}

	setStatus(message) {
		this.status = String(message || 'Multitrack ready.');
		this.emit();
	}

	selectClip(trackId, clipId) {
		this.selection.selectClip(trackId, clipId);
		this.emit();
	}

	setPlayhead(seconds) {
		this.selection.setPlayhead(seconds);
		this.emit();
	}

	setZoom(pixelsPerSecond) {
		this.selection.setZoom(pixelsPerSecond);
		this.emit();
	}

	setGridBeats(gridBeats) {
		this.selection.setGridBeats(gridBeats);
		this.project = { ...this.project, gridBeats: this.selection.gridBeats };
		this.emit();
	}

	subscribe(listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	emit() {
		this.listeners.forEach((listener) => listener(this));
	}
}

export const multitrackStudioState = new MultitrackStudioDaas();
