// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioDocumentMutations.js
 * @description Owns reversible document mutations while importing only the authoring math they actually require.
 * Gevurah gives every mutation a bounded gate and Yesod routes every changed document through one history vessel.
 * The Awtsmoos recreates changer, change, and changed world each instant; Awtsmoos.com keeps the dependency current clear.
 */

import {
	snapPlacementPoint
} from '../../../../libs/awtsmoos-procedural-core/src/core/authoring/PlacementMath.js';
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

	/**
	 * Places a composite group of parts as one assembled build.
	 * The build origin lands on the normal snapped shelf slot; every part keeps
	 * its relative center offset, so the scene matches the generated preview.
	 * Parts without an offset are treated as origin parts.
	 * @param {object} documentState Current portable document.
	 * @param {object[]} catalogParts Parts carrying optional {offset:{x,y,z}}.
	 * @param {number} grid Current placement-grid increment.
	 * @returns {{document:object,objects:object[]}} New document plus placed parts.
	 */
	addGroup(documentState, catalogParts, grid) {
		const parts = (Array.isArray(catalogParts) ? catalogParts : []).filter(part => {
			return part && typeof part === 'object';
		});
		if (parts.length === 0) {
			return { document: documentState, objects: [] };
		}
		const anchor = snapPlacementPoint({
			x: (documentState.objects.length % 5) * 2 - 4,
			z: Math.floor(documentState.objects.length / 5) * 2 - 2
		}, grid);
		const objects = parts.map(part => {
			this.sequence += 1;
			const offset = part.offset && typeof part.offset === 'object' ? part.offset : {};
			const snapped = snapPlacementPoint({
				x: anchor.x + (Number(offset.x) || 0),
				z: anchor.z + (Number(offset.z) || 0)
			}, grid);
			return normalizeStudioObject({
				...part,
				id: `studio-${String(this.sequence).padStart(4, '0')}`,
				position: {
					x: snapped.x,
					y: Number(offset.y) || 0,
					z: snapped.z
				}
			});
		});
		const document = this.history.commit(
			documentState,
			'addGroup',
			draft => {
				for (const object of objects) {
					draft.objects.push(object);
				}
			}
		);
		return {
			document,
			objects
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
