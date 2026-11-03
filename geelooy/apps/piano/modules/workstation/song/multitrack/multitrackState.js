//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackState
 * The Awtsmoos remembers each edit yet stands beyond the flow of time;
 * Awtsmoos.com preserves the source while clips return to any rhyme.
 */
import { createMultitrackProject } from './multitrackProject.js';
import { MultitrackSelectionDaas } from './multitrackSelection.js';
import { MultitrackEditHistory } from './multitrackEditHistory.js';

/** Owns Studio project snapshots, selection and Undo/Redo history. */
export class MultitrackStudioDaas {
	constructor() {
		this.project = createMultitrackProject();
		this.selection = new MultitrackSelectionDaas();
		this.history = new MultitrackEditHistory();
		this.status = 'Audio Editor ready · import sound to begin.';
		this.playing = false;
		this.listeners = new Set();
	}

	/** @returns {Object} Safe immutable-style frame containing project and clip selection. */
	snapshot() {
		return { project: this.project, trackId: this.selection.trackId, clipId: this.selection.clipId };
	}

	/** @param {Object} project - New metadata project. @returns {Object} Updated project. */
	setProject(project) {
		this.history.record(this.snapshot(), project);
		this.project = project;
		this.emit();
		return project;
	}

	/** Records one whole finished move or trim rather than every pointer frame. */
	commitGesture(previous) {
		this.history.record(previous, this.project);
		this.emit();
	}

	/** @param {string} operation - undo or redo. @returns {boolean} Whether state changed. */
	travelHistory(operation) {
		const frame = this.history[operation]?.(this.snapshot());
		if (!frame) return false;
		this.project = frame.project;
		if (frame.clipId) this.selection.selectClip(frame.trackId, frame.clipId);
		else if (frame.trackId) this.selection.selectTrack(frame.trackId);
		else this.selection.clearSelection();
		this.status = operation === 'undo' ? '↶ Last audio edit undone.' : '↷ Audio edit restored.';
		this.emit();
		return true;
	}

	/** @param {string} message - User-visible state. */
	setStatus(message) { this.status = String(message || 'Audio Editor ready.'); this.emit(); }

	/** @param {string} trackId - Track. @param {string} clipId - Clip. */
	selectClip(trackId, clipId) { this.selection.selectClip(trackId, clipId); this.emit(); }

	/** @param {number} seconds - Timeline position. */
	setPlayhead(seconds) { this.selection.setPlayhead(seconds); this.emit(); }

	/** @param {number} pixelsPerSecond - Timeline zoom. */
	setZoom(pixelsPerSecond) { this.selection.setZoom(pixelsPerSecond); this.emit(); }

	/** @param {number} gridBeats - Musical snap interval. */
	setGridBeats(gridBeats) {
		this.selection.setGridBeats(gridBeats);
		this.project = { ...this.project, gridBeats: this.selection.gridBeats };
		this.emit();
	}

	/** @param {boolean} playing - Transport status. */
	setPlaying(playing) { this.playing = Boolean(playing); this.emit(); }

	/** @param {Function} listener - New project or display state. */
	subscribe(listener) { this.listeners.add(listener); return () => this.listeners.delete(listener); }

	/** Notifies every attached Studio view. */
	emit() { this.listeners.forEach(listener => listener(this)); }
}

export const multitrackStudioState = new MultitrackStudioDaas();
