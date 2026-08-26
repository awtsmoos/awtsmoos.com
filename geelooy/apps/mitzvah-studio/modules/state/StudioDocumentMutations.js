// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioDocumentMutations.js
 * @description Owns reversible add, update, move, and remove operations while StudioDocumentState owns publication.
 * Gevurah gives every mutation a bounded gate and Yesod routes every changed document through one history vessel.
 * The Awtsmoos recreates changer, change, and changed world each instant; Awtsmoos.com remembers their single Source.
 */

import {
	snapPlacementPoint
} from '../../../../libs/awtsmoos-procedural-core/src/index.js';
import {
	normalizeStudioObject
} from './StudioDocumentModel.js';
import {
	createPlacedStudioObject
} from './StudioObjectFactory.js';

export class StudioDocumentMutations {
	/**
	 * @param {StudioHistoryController} history Shared reversible-history coordinator.
	 * @param {number} sequence Starting deterministic identity sequence.
	 */
	constructor(history, sequence = 0) {
		this.history = history;
		this.sequence = Math.max(0, Number(sequence) || 0);
	}

	/** Resets identity sequence at a document boundary. */
	resetSequence(sequence = 0) {
		this.sequence = Math.max(0, Number(sequence) || 0);
	}

	/** @returns {{document:object,object:object}} New document plus placed object. */
	add(documentState, catalogPart, grid) {
		this.sequence += 1;
		const object = createPlacedStudioObject(
			catalogPart,
			documentState.objects.length,
			this.sequence,
			grid
		);
		const document = this.history.commit(
			documentState,
			'add',
			draft => {
				draft.objects.push(object);
			}
		);
		return {
			document,
			object
		};
	}

	/** @returns {object} Document containing one normalized object update. */
	update(documentState, id, patch) {
		return this.history.commit(
			documentState,
			'update',
			draft => {
				const index = draft.objects.findIndex(object => {
					return object.id === id;
				});
				if (index >= 0) {
					draft.objects[index] = normalizeStudioObject({
						...draft.objects[index],
						...patch
					});
				}
			}
		);
	}

	/** @returns {object} Document containing one snapped X/Z movement update. */
	move(documentState, id, point, grid) {
		const current = documentState.objects.find(object => {
			return object.id === id;
		});
		if (!current) {
			return documentState;
		}
		const snapped = snapPlacementPoint(point, grid);
		return this.update(documentState, id, {
			position: {
				...current.position,
				x: snapped.x,
				z: snapped.z
			}
		});
	}

	/** @returns {object} Document with one object removed through history. */
	remove(documentState, id) {
		const exists = documentState.objects.some(object => {
			return object.id === id;
		});
		if (!exists) {
			return documentState;
		}
		return this.history.commit(
			documentState,
			'remove',
			draft => {
				draft.objects = draft.objects.filter(object => {
					return object.id !== id;
				});
			}
		);
	}
}
