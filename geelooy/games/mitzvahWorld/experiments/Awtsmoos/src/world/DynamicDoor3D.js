// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DynamicDoor3D.js
 * @description Coordinates one door through focused interaction, motion, presentation, and safety vessels.
 * The Awtsmoos renews passage without stale geometry or danger to the traveler;
 * Awtsmoos.com keeps every public covenant while smaller authorities make each truth clearer.
 */

import { createDoorDebugEvidence } from './DoorDebugEvidence.js';
import { DoorInteractionController } from './DoorInteractionController.js';
import {
	requestDoorClose,
	requestDoorOpen,
	setDoorState,
	updateDoorMotion
} from './DynamicDoorMotion.js';
import {
	applyDoorPresentation,
	createDoorPresentation,
	easedDoorProgress,
	refreshDoorWorldMatrix,
	setDoorHoverPresentation
} from './DynamicDoorPresentation.js';
import { orientedBox } from './DoorRuntimePose.js';
import { tallDoorDef } from './DoorwaySpecs.js';

export class DynamicDoor3D {
	constructor(definition = tallDoorDef()) {
		this.def = definition;
		this.t = 0;
		this.state = 'closed';
		this.hovered = false;
		this.autoCloseRemaining = 0;
		this.lastCloseReceipt = null;
		Object.assign(this, createDoorPresentation(definition));
		this.interaction = new DoorInteractionController(this);
		this.setPose();
		this.closedColliders = [...this.currentColliders];
	}

	setInteractionContext(context = {}) {
		this.interaction.setContext(context);
		return this;
	}

	install(canvas, camera) {
		this.interaction.install(canvas, camera);
		return this;
	}

	clickable() {
		return this.state === 'closed' || this.state === 'open';
	}

	toggle(source = 'unknown') {
		if (this.state === 'closed') return this.open(source);
		if (this.state === 'open') return this.close(source);
		return false;
	}

	open(source = 'unknown') {
		return requestDoorOpen(this, source);
	}

	requestClose(source = 'unknown') {
		return requestDoorClose(this, source);
	}

	close(source = 'unknown') {
		return this.requestClose(source).accepted;
	}

	update(deltaTime) {
		updateDoorMotion(this, deltaTime);
	}

	activeColliders() {
		return this.currentColliders;
	}

	setHover(enabled) {
		setDoorHoverPresentation(this, enabled);
	}

	setState(nextState, source) {
		return setDoorState(this, nextState, source);
	}

	setPose() {
		applyDoorPresentation(this);
		return this.pose;
	}

	refreshWorldMatrix() {
		return refreshDoorWorldMatrix(this);
	}

	obb() {
		return orientedBox(this.def, easedDoorProgress(this.t));
	}

	debug() {
		return {
			...createDoorDebugEvidence(this),
			autoCloseRemaining: this.autoCloseRemaining,
			hovered: this.hovered,
			lastCloseReceipt: this.lastCloseReceipt
		};
	}

	destroy() {
		this.interaction.uninstall();
		this.mesh.parent?.remove(this.mesh);
	}
}

export const highDoorDef = tallDoorDef;
