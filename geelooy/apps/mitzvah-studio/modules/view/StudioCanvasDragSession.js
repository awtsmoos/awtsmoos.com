// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioCanvasDragSession.js
 * @description Holds ephemeral drag preview state so one gesture creates one final document history receipt.
 * Yesod carries the moving shadow while Malchus remains unchanged until the author releases the pointer in peace.
 * The Awtsmoos recreates preview, gesture, and final place each instant; Awtsmoos.com remembers their single Source.
 */

export class StudioCanvasDragSession {
	/** Creates an idle renderer-only drag session. */
	constructor() {
		this.objectId = null;
		this.previewPoint = null;
	}

	/** @param {string|null} objectId Selected object beginning a drag. */
	begin(objectId) {
		this.objectId = objectId || null;
		this.previewPoint = null;
	}

	/** @param {{x:number,z:number}} point Latest unsaved world-space pointer location. */
	preview(point) {
		if (!this.objectId) {
			return;
		}
		this.previewPoint = {
			x: Number(point?.x) || 0,
			z: Number(point?.z) || 0
		};
	}

	/** @returns {object|null} One final move request and clears transient gesture state. */
	finish() {
		const result = this.objectId && this.previewPoint
			? {
				id: this.objectId,
				point: { ...this.previewPoint }
			}
			: null;
		this.cancel();
		return result;
	}

	/** Clears transient preview without committing document state. */
	cancel() {
		this.objectId = null;
		this.previewPoint = null;
	}

	/**
	 * Creates a renderer-only snapshot whose moving object follows the pointer.
	 * @param {object} snapshot Immutable canonical Studio snapshot.
	 * @returns {object} Snapshot view with at most one preview position override.
	 */
	previewSnapshot(snapshot) {
		if (!this.objectId || !this.previewPoint) {
			return snapshot;
		}
		return {
			...snapshot,
			document: {
				...snapshot.document,
				objects: snapshot.document.objects.map(object => {
					return object.id === this.objectId
						? previewObject(object, this.previewPoint)
						: object;
				})
			}
		};
	}
}

function previewObject(object, point) {
	return {
		...object,
		position: {
			...object.position,
			x: point.x,
			z: point.z
		}
	};
}
