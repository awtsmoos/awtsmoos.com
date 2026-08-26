// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioDocumentState.js
 * @description Owns portable document mutations while Procedural Core owns history and placement law.
 * The Awtsmoos renews every edit yet no mutation escapes its before-and-after receipt;
 * Awtsmoos.com keeps authoring deterministic so selection, undo, and persistence remain complete.
 */

import { HistoryLedger, snapPlacementPoint } from '../../../../libs/awtsmoos-procedural-core/src/index.js';
import {
	cloneStudioDocument,
	createStudioDocument,
	normalizeStudioDocument,
	normalizeStudioObject
} from './StudioDocumentModel.js';

export class StudioDocumentState {
	constructor(documentState = createStudioDocument()) {
		this.document = normalizeStudioDocument(documentState);
		this.history = new HistoryLedger();
		this.listeners = new Set();
		this.selectedId = null;
		this.sequence = this.document.objects.length;
		this.grid = 0.5;
	}

	snapshot() {
		return Object.freeze({
			document: cloneStudioDocument(this.document),
			grid: this.grid,
			history: this.history.snapshot(),
			selectedId: this.selectedId
		});
	}

	subscribe(listener) {
		this.listeners.add(listener);
		listener(this.snapshot());
		return () => this.listeners.delete(listener);
	}

	newDocument(name) {
		this.document = createStudioDocument(name);
		this.history.clear();
		this.selectedId = null;
		this.sequence = 0;
		this.publish();
	}

	load(documentState) {
		this.document = normalizeStudioDocument(documentState);
		this.history.clear();
		this.selectedId = null;
		this.sequence = this.document.objects.length;
		this.publish();
	}

	add(catalogPart) {
		const index = this.document.objects.length;
		const point = snapPlacementPoint({
			x: (index % 5) * 2 - 4,
			z: Math.floor(index / 5) * 2 - 2
		}, this.grid);
		this.sequence += 1;
		const object = normalizeStudioObject({
			...catalogPart,
			id: `studio-${String(this.sequence).padStart(4, '0')}`,
			position: {
				x: point.x,
				y: (catalogPart.size?.y || 1) * 0.5,
				z: point.z
			}
		});
		this.commit('add', draft => draft.objects.push(object), false);
		this.selectedId = object.id;
		this.publish();
		return object;
	}

	update(id, patch) {
		this.commit('update', draft => {
			const index = draft.objects.findIndex(object => object.id === id);
			if (index >= 0) {
				draft.objects[index] = normalizeStudioObject({ ...draft.objects[index], ...patch });
			}
		});
	}

	move(id, point) {
		const current = this.find(id);
		if (!current) return;
		const snapped = snapPlacementPoint(point, this.grid);
		this.update(id, {
			position: { ...current.position, x: snapped.x, z: snapped.z }
		});
	}

	remove(id = this.selectedId) {
		if (!id || !this.find(id)) return;
		this.commit('remove', draft => {
			draft.objects = draft.objects.filter(object => object.id !== id);
		}, false);
		if (this.selectedId === id) this.selectedId = null;
		this.publish();
	}

	select(id) {
		this.selectedId = this.find(id) ? id : null;
		this.publish();
	}

	setGrid(grid) {
		this.grid = Math.max(0.05, Math.min(4, Number(grid) || 0.5));
		this.publish();
	}

	undo() {
		const receipt = this.history.takeUndo();
		if (!receipt) return;
		this.document = cloneStudioDocument(receipt.before);
		this.reconcileSelection();
		this.publish();
	}

	redo() {
		const receipt = this.history.takeRedo();
		if (!receipt) return;
		this.document = cloneStudioDocument(receipt.after);
		this.reconcileSelection();
		this.publish();
	}

	find(id = this.selectedId) {
		return this.document.objects.find(object => object.id === id) || null;
	}

	commit(kind, operation, publish = true) {
		const before = cloneStudioDocument(this.document);
		const after = cloneStudioDocument(this.document);
		operation(after);
		this.document = after;
		this.history.commit({ before, after: cloneStudioDocument(after), kind });
		if (publish) this.publish();
	}

	reconcileSelection() {
		if (this.selectedId && !this.find(this.selectedId)) this.selectedId = null;
	}

	publish() {
		const snapshot = this.snapshot();
		for (const listener of this.listeners) listener(snapshot);
	}
}
