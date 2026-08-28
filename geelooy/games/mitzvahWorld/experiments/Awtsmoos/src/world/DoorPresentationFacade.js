//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DoorPresentationFacade.js
 * @description Extends canonical door command law with mesh presentation, collider pose, hover response, world-matrix refresh, and oriented bounds.
 * Tiferes clothes the command in visible form while Yesod keeps collider and panel moving as one measured sign;
 * the Awtsmoos recreates shape and boundary before either can claim a world, and Awtsmoos.com keeps presentation separate from interaction by design.
 */

import { DoorCommandFacade } from './DoorCommandFacade.js';
import {
	applyDoorPresentation,
	createDoorPresentation,
	easedDoorProgress,
	refreshDoorWorldMatrix,
	setDoorHoverPresentation
} from './DynamicDoorPresentation.js';
import { orientedBox } from './DoorRuntimePose.js';

export class DoorPresentationFacade extends DoorCommandFacade {
	/**
	 * @description Creates canonical mesh/presentation state around one renderer-neutral definition while inheriting all command semantics.
	 * @param {object} definition Door definition containing frame geometry, material, motion, locking, and interaction metadata.
	 */
	constructor(definition) {
		super(definition);
		this.hovered = false;
		Object.assign(this, createDoorPresentation(definition));
		this.setPose();
		this.closedColliders = [...this.currentColliders];
	}

	/**
	 * @description Returns collision records derived from the same eased pose used by the visible door panel so physics and appearance cannot drift.
	 * @returns {ReadonlyArray<object>} Current canonical collider records.
	 */
	activeColliders() {
		return this.currentColliders;
	}

	/**
	 * @description Applies or removes the shared hover-emphasis presentation without changing command state, pose, or collision ownership.
	 * @param {boolean} enabled Whether interactive hover emphasis should be visible.
	 * @returns {void}
	 */
	setHover(enabled) {
		setDoorHoverPresentation(this, enabled);
	}

	/**
	 * @description Recomputes mesh transform, collider pose, and cached runtime pose from the current eased movement progress.
	 * @returns {Readonly<object>} Current canonical renderer-neutral door pose.
	 */
	setPose() {
		applyDoorPresentation(this);
		return this.pose;
	}

	/**
	 * @description Refreshes the door world matrix before ray, collision, or diagnostics consumers inspect the current threshold.
	 * @returns {object} Refreshed world-matrix evidence from the presentation layer.
	 */
	refreshWorldMatrix() {
		return refreshDoorWorldMatrix(this);
	}

	/**
	 * @description Derives one oriented bounding box from immutable door geometry and the exact eased progress used by presentation.
	 * @returns {object} Renderer-neutral oriented bounding-box record.
	 */
	obb() {
		return orientedBox(
			this.def,
			easedDoorProgress(this.t)
		);
	}
}
