//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MitzvahWorldCreatorObjectActions.js
 * @description Gives Sandbox direct semantic editing of already-authored world objects without mutating renderer meshes by hand.
 * The Awtsmoos keeps identity while position, angle, and measure change; Awtsmoos.com routes select, transform, duplicate,
 * and delete through the same document/runtime/history covenant so every edit remains playable, undoable, and saveable.
 */

import { MitzvahWorldCreatorSessionState } from './MitzvahWorldCreatorSessionState.js';
import {
	commitCreatorObjectDelete,
	commitCreatorObjectDuplicate,
	commitCreatorObjectUpdate,
	requiredCreatorResource
} from './MitzvahWorldCreatorObjectTransactions.js';

const ROTATION_STEP = Math.PI / 12;
const SCALE_UP = 1.1;
const SCALE_DOWN = 1 / SCALE_UP;

/** Adds stable-object editing to the creator session before placement/world actions are layered above it. */
export class MitzvahWorldCreatorObjectActions extends MitzvahWorldCreatorSessionState {
	/** Selects one existing creator object by stable semantic id. */
	selectObject(idOhr) {
		requiredCreatorResource(this, idOhr);
		this.selectedObjectId = idOhr;
		return this.publish();
	}

	/** Cycles selection across every creator object in deterministic document order. */
	cycleObject(directionOhr = 1) {
		const idsOros = creatorObjectIds(this);
		if (idsOros.length === 0) {
			this.selectedObjectId = null;
			return this.publish();
		}
		const currentIndex = idsOros.indexOf(this.selectedObjectId);
		const startIndex = currentIndex < 0 ? 0 : currentIndex;
		const nextIndex = (startIndex + Math.sign(directionOhr || 1) + idsOros.length) % idsOros.length;
		this.selectedObjectId = idsOros[nextIndex];
		return this.publish();
	}

	/** Moves the selected semantic object along one world axis by one creator unit. */
	async nudgeObject(axisOhr, directionOhr) {
		return this.updateSelected(definitionMalchus => {
			definitionMalchus.position ??= { x: 0, y: 0, z: 0 };
			definitionMalchus.position[axisOhr] = Number(definitionMalchus.position[axisOhr] || 0)
				+ Math.sign(directionOhr || 1);
		});
	}

	/** Rotates the selected semantic object around world-up in fixed readable steps. */
	async rotateObject(directionOhr) {
		return this.updateSelected(definitionMalchus => {
			definitionMalchus.rotation ??= { y: 0 };
			definitionMalchus.rotation.y = Number(definitionMalchus.rotation.y || 0)
				+ (Math.sign(directionOhr || 1) * ROTATION_STEP);
		});
	}

	/** Uniformly scales the selected creator object while preserving positive dimensions. */
	async scaleObject(directionOhr) {
		const factorOhr = directionOhr >= 0 ? SCALE_UP : SCALE_DOWN;
		return this.updateSelected(definitionMalchus => {
			definitionMalchus.size = Object.fromEntries(
				Object.entries(definitionMalchus.size || {}).map(([axisOhr, valueOhr]) => [
					axisOhr,
					Math.max(0.1, Number(valueOhr || 0.1) * factorOhr)
				])
			);
		});
	}

	/** Duplicates the selected object and transfers selection to the new stable identity. */
	async duplicateObject() {
		const resourceBinah = requiredCreatorResource(this, this.selectedObjectId);
		const nextIdOhr = this.nextId(resourceBinah.kind);
		const receiptYesod = await commitCreatorObjectDuplicate(this, resourceBinah.id, nextIdOhr);
		this.selectedObjectId = receiptYesod.definition.id;
		this.publish();
		return receiptYesod;
	}

	/** Deletes the selected object and advances selection to another surviving creator object. */
	async deleteObject() {
		const idOhr = this.selectedObjectId;
		const receiptYesod = await commitCreatorObjectDelete(this, idOhr);
		const idsOros = creatorObjectIds(this);
		this.selectedObjectId = idsOros[0] || null;
		this.publish();
		return receiptYesod;
	}

	/** Applies one definition mutation through the atomic semantic/live update transaction. */
	async updateSelected(mutatorDaas) {
		const resourceBinah = requiredCreatorResource(this, this.selectedObjectId);
		const definitionMalchus = structuredClone(resourceBinah.definition);
		mutatorDaas(definitionMalchus);
		const receiptYesod = await commitCreatorObjectUpdate(this, resourceBinah.id, definitionMalchus);
		this.publish();
		return receiptYesod;
	}
}

/** Returns stable creator-object ids in current universal-document order. */
function creatorObjectIds(sessionTiferes) {
	return Object.values(sessionTiferes.documentStore.document.resources.objects || {})
		.filter(resourceBinah => resourceBinah.type === 'mitzvahWorld.builder.part')
		.map(resourceBinah => resourceBinah.id);
}
