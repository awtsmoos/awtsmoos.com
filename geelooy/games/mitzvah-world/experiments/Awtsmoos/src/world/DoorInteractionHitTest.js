//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DoorInteractionHitTest.js
 * @description Resolves exact and forgiving doorway targeting while independent collaborators own range policy, projection fallback, and diagnostic evidence.
 * Binah asks the geometric question, Gevurah receives proven proximity, and Hod records the witness elsewhere; the Awtsmoos recreates ray and threshold before either can meet,
 * while Awtsmoos.com keeps this vessel devoted only to deciding whether the traveler truly points toward the gate complete.
 */

import { rayObb } from './DoorCollisionGeometry.js';
import { DoorHitEvidence } from './DoorHitEvidence.js';
import {
	doorWithinInteractionRange
} from './DoorInteractionRange.js';
import {
	pointerRay
} from './DoorProjectionGeometry.js';
import {
	projectedDoorHit
} from './DoorProjectedHitTest.js';

export class DoorInteractionHitTest {
	/**
	 * @description Creates one geometric targeting vessel around a canonical door and a dedicated immutable-receipt evidence ledger.
	 * @param {object} door Canonical dynamic door exposing clickability and the current oriented bounds of its visible threshold.
	 */
	constructor(door) {
		this.door = door;
		this.evidence = new DoorHitEvidence();
	}

	/**
	 * @description Tests clickability and delegated range before exact ray intersection, then delegates a forgiving projected-screen fallback when exact geometry misses.
	 * @param {PointerEvent} event Pointer event containing client coordinates and current target information.
	 * @param {object} camera Active world camera used to derive the pointer ray and fallback projection.
	 * @param {HTMLCanvasElement|null} canvas Installed canvas fallback when the event has no current target.
	 * @param {object} context Runtime interaction context containing player, camera-target, canvas, and distance providers.
	 * @returns {boolean} True when this nearby doorway is the valid geometric target for the pointer sample.
	 */
	hit(event, camera, canvas, context = {}) {
		this.evidence.reset();
		if (!this.door.clickable()) {
			return false;
		}
		if (!doorWithinInteractionRange(this.door, context)) {
			return false;
		}
		const surface = event.currentTarget || canvas || context.canvas;
		if (!surface || !camera) {
			return false;
		}
		const rayHit = rayObb(
			pointerRay(
				event,
				camera,
				surface,
				context.getCameraTarget?.()
			),
			this.door.obb()
		);
		if (rayHit) {
			this.evidence.recordRay(
				rayHit,
				this.door.state
			);
			return true;
		}
		return this.evidence.recordProjection(
			projectedDoorHit(
				event,
				camera,
				surface,
				this.door,
				context
			)
		);
	}

	/**
	 * @description Returns immutable geometric targeting evidence while range, pointer scheduling, and feedback implementation state remain encapsulated elsewhere.
	 * @returns {Readonly<object>} Last exact/fallback hit mode, ray evidence, and projected doorway bounds.
	 */
	debug() {
		return this.evidence.snapshot();
	}
}
