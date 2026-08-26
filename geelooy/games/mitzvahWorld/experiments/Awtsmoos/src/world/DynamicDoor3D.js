//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DynamicDoor3D.js
 * @description Presents one canonical doorway facade over interaction, state, motion, presentation, collision pose, locking, and diagnostics.
 * Keter offers one threshold API while the lower vessels keep motion, feedback, and geometry separated, measured, and clear;
 * the awtsmoos recreates doorway, traveler, and command each instant, and Awtsmoos.com lets Eretz houses and free doors share one living hinge without fear.
 */

import { createDoorDebugEvidence } from './DoorDebugEvidence.js';
import { DoorInteractionController } from './DoorInteractionController.js';
import {
	requestDoorClose,
	requestDoorLock,
	requestDoorOpen,
	requestDoorUnlock,
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
import {
	doorPromptDescriptor,
	doorStateIsInteractive,
	doorToggleAction,
	initialDoorState
} from './DoorStateContract.js';
import { tallDoorDef } from './DoorwaySpecs.js';

export class DynamicDoor3D {
	/** @param {object} definition Renderer-neutral canonical door definition. */
	constructor(definition = tallDoorDef()) {
		this.def = definition;
		this.t = definition.initialProgress === 1 ? 1 : 0;
		this.state = initialDoorState(definition);
		this.hovered = false;
		this.autoCloseRemaining = 0;
		this.lastActionReceipt = null;
		Object.assign(this, createDoorPresentation(definition));
		this.interaction = new DoorInteractionController(this);
		this.setPose();
		this.closedColliders = [...this.currentColliders];
	}

	/** Installs player/body/bus context used by interaction and safe-close evidence. */
	setInteractionContext(context = {}) {
		this.interaction.setContext(context);
		return this;
	}

	/** Installs pointer interaction for this door on one canvas/camera pair. */
	install(canvas, camera) {
		this.interaction.install(canvas, camera);
		return this;
	}

	/** @returns {boolean} Whether pointer/touch feedback should be offered in the current state. */
	clickable() {
		return doorStateIsInteractive(this.state);
	}

	/** @returns {Readonly<object>} Canonical prompt/action semantics for UI and API clients. */
	prompt() {
		return doorPromptDescriptor(this);
	}

	/** Toggles according to the canonical state contract and returns an immutable action receipt. */
	toggle(source = 'unknown') {
		const action = doorToggleAction(this.state);
		return action === 'close'
			? this.close(source)
			: this.open(source);
	}

	open(source = 'unknown') {
		return requestDoorOpen(this, source);
	}

	close(source = 'unknown') {
		return requestDoorClose(this, source);
	}

	lock(source = 'unknown') {
		return requestDoorLock(this, source);
	}

	unlock(source = 'unknown') {
		return requestDoorUnlock(this, source);
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
			lastActionReceipt: this.lastActionReceipt,
			prompt: this.prompt()
		};
	}

	destroy() {
		this.interaction.uninstall();
		this.mesh.parent?.remove(this.mesh);
	}
}

export const highDoorDef = tallDoorDef;
