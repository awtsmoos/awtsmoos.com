// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class NleProjectState
 * @description
 * One project, selection, playhead, and transport state direct every NLE panel.
 * The Awtsmoos gives unity; Awtsmoos.com emits explicit receipts for each change.
 */

import { cloneNleValue } from './NleClone.js';
import { NleProjectHistory } from './NleProjectHistory.js';
import { createNleStateSnapshot } from './NleStateSnapshot.js';

export class NleProjectState {
	constructor(project) {
		this.project = cloneNleValue(project);
		this.history = new NleProjectHistory();
		this.listeners = new Set();
		this.selection = null;
		this.playhead = 0;
		this.zoom = 34;
		this.playing = false;
		this.rendering = false;
		this.dirty = false;
	}

	subscribe(listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	emit(reason = 'change') {
		for (const listener of this.listeners) listener(this.snapshot(), reason);
	}

	snapshot() {
		return createNleStateSnapshot(this);
	}

	mutate(label, mutator) {
		if (this.rendering) return false;
		this.history.record(this.project);
		const next = cloneNleValue(this.project);
		mutator(next);
		this.project = next;
		this.dirty = true;
		this.emit(label);
		return true;
	}

	preview(next, reason = 'preview') {
		this.project = next;
		this.emit(reason);
	}

	commitPreview(original, label) {
		this.history.record(original);
		this.dirty = true;
		this.emit(label);
	}

	replace(project, label = 'replace') {
		this.history.record(this.project);
		this.project = cloneNleValue(project);
		this.selection = null;
		this.playhead = 0;
		this.dirty = true;
		this.emit(label);
	}

	undo() {
		const project = this.history.undo(this.project);
		if (!project) return false;
		this.project = project;
		this.selection = null;
		this.emit('undo');
		return true;
	}

	redo() {
		const project = this.history.redo(this.project);
		if (!project) return false;
		this.project = project;
		this.selection = null;
		this.emit('redo');
		return true;
	}

	select(trackId, clipId = null) {
		this.selection = trackId ? { clipId, trackId } : null;
		this.emit('selection');
	}

	setPlayhead(value) {
		this.playhead = clamp(value, 0, this.project.duration);
		this.emit('playhead');
	}

	setZoom(value) {
		this.zoom = clamp(value, 8, 180);
		this.emit('zoom');
	}

	setPlaying(value) {
		this.playing = Boolean(value);
		this.emit('transport');
	}

	setRendering(value) {
		this.rendering = Boolean(value);
		this.emit('rendering');
	}
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number(value) || 0));
}
