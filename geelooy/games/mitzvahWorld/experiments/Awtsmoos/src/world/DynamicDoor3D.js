//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DynamicDoor3D.js
 * @description Completes the canonical doorway inheritance chain by adding runtime interaction, frame integration, diagnostics, and teardown to the presentation facade.
 * Malchus receives the living threshold after command and presentation laws have already been purified above; the Awtsmoos recreates user, hinge, and frame in one tide,
 * while Awtsmoos.com keeps this final runtime vessel narrow enough that every public method may remain richly documented and every lower concern stays outside.
 */

import { createDoorDebugEvidence } from './DoorDebugEvidence.js';
import { DoorInteractionController } from './DoorInteractionController.js';
import { updateDoorMotion } from './DoorMotionIntegrator.js';
import { DoorPresentationFacade } from './DoorPresentationFacade.js';
import { tallDoorDef } from './DoorwaySpecs.js';

export class DynamicDoor3D extends DoorPresentationFacade {
	/**
	 * @description Creates one canonical dynamic doorway, then installs a focused interaction controller around inherited command and presentation state.
	 * @param {object} definition Renderer-neutral doorway definition containing identity, geometry, material, motion, locking, and interaction policy.
	 */
	constructor(definition = tallDoorDef()) {
		super(definition);
		this.interaction = new DoorInteractionController(this);
	}

	/**
	 * @description Installs player, body, and event-bus context used by pointer feedback and collision-safe closing without mutating the door definition.
	 * @param {object} context Runtime interaction context with player position, camera target, bus, radius, and height providers.
	 * @returns {DynamicDoor3D} This doorway for fluent world assembly.
	 */
	setInteractionContext(context = {}) {
		this.interaction.setContext(context);
		return this;
	}

	/**
	 * @description Installs pointer interaction against one canvas/camera pair while inherited command and presentation contracts remain renderer-neutral.
	 * @param {HTMLCanvasElement} canvas Interactive render surface receiving pointer events.
	 * @param {object} camera Active world camera used for doorway hit testing.
	 * @returns {DynamicDoor3D} This doorway for fluent installation.
	 */
	install(canvas, camera) {
		this.interaction.install(canvas, camera);
		return this;
	}

	/**
	 * @description Advances the separated door motion integrator for one frame, preserving command receipts and presentation synchronization.
	 * @param {number} deltaTime Elapsed frame time in seconds.
	 * @returns {void}
	 */
	update(deltaTime) {
		updateDoorMotion(this, deltaTime);
	}

	/**
	 * @description Returns one clone-safe diagnostic record joining command receipt, prompt semantics, pose evidence, and pointer visibility for professional tooling.
	 * @returns {Readonly<object>} Canonical door diagnostics for API, UI, and developer inspection.
	 */
	debug() {
		return {
			...createDoorDebugEvidence(this),
			autoCloseRemaining: this.autoCloseRemaining,
			hovered: this.hovered,
			lastActionReceipt: this.lastActionReceipt,
			prompt: this.prompt()
		};
	}

	/**
	 * @description Releases pointer ownership and removes the visible mesh from its parent so no hidden interaction or rendering vessel survives destruction.
	 * @returns {void}
	 */
	destroy() {
		this.interaction.uninstall();
		this.mesh.parent?.remove(this.mesh);
	}
}

export const highDoorDef = tallDoorDef;
