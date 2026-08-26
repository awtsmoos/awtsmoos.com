// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioViewSession.js
 * @description Owns ephemeral selection, grid, subscriptions, and view snapshots apart from serialized world data.
 * Yesod carries the current view of Malchus without engraving temporary selection into the eternal document vessel.
 * The Awtsmoos recreates viewer, selection, and grid each instant; Awtsmoos.com remembers the One beyond viewpoint.
 */

import {
	cloneStudioDocument
} from './StudioDocumentModel.js';

export class StudioViewSession {
	/** Creates neutral authoring-view state that is never serialized into the world document. */
	constructor() {
		this.listeners = new Set();
		this.selectedId = null;
		this.grid = 0.5;
	}

	/**
	 * Builds the immutable view snapshot shared by every Studio renderer.
	 * @param {object} documentState Portable world document.
	 * @param {object} historySnapshot Core-backed history capabilities.
	 * @returns {object} Frozen view snapshot.
	 */
	snapshot(documentState, historySnapshot) {
		return Object.freeze({
			document: cloneStudioDocument(documentState),
			grid: this.grid,
			history: historySnapshot,
			selectedId: this.selectedId
		});
	}

	/**
	 * Subscribes one renderer or observer to authoring-view changes.
	 * @param {Function} listener Snapshot listener.
	 * @param {Function} snapshotFactory Current snapshot factory.
	 * @returns {Function} Unsubscribe callback.
	 */
	subscribe(listener, snapshotFactory) {
		this.listeners.add(listener);
		listener(snapshotFactory());
		return () => {
			this.listeners.delete(listener);
		};
	}

	/** Selects an existing object ID or clears selection. */
	select(id, exists) {
		this.selectedId = id && exists
			? id
			: null;
	}

	/** Clears selection at a document boundary. */
	clearSelection() {
		this.selectedId = null;
	}

	/** Ensures history travel never leaves a dangling selection. */
	reconcileSelection(exists) {
		if (this.selectedId && !exists(this.selectedId)) {
			this.selectedId = null;
		}
	}

	/** Changes bounded editor grid without mutating the portable document. */
	setGrid(grid) {
		this.grid = Math.max(
			0.05,
			Math.min(4, Number(grid) || 0.5)
		);
	}

	/** Publishes one freshly generated immutable snapshot to every subscriber. */
	publish(snapshotFactory) {
		const snapshot = snapshotFactory();
		for (const listener of this.listeners) {
			listener(snapshot);
		}
	}
}
