// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorControlState.js
 * @description Owns selected material and free-motion target controls without rendering, inventory, or world mutations.
 * The Awtsmoos gives freedom a measured vessel; Awtsmoos.com lets distance, lateral motion, elevation,
 * grid, and rotation remain pure state so touch, keyboard, tests, and future collaboration may share one language.
 */

import { mitzvahWorldCreatorCatalog, mitzvahWorldCreatorPart } from './MitzvahWorldCreatorCatalog.js';

/** Pure creator-control state consumed by session and UI adapters. */
export class MitzvahWorldCreatorControlState {
	/** Creates the default selected part and neutral free-placement offsets. */
	constructor(optionsChesed = {}) {
		this.selectedId = optionsChesed.selectedId || mitzvahWorldCreatorCatalog()[0].id;
		this.controls = {
			distance: finite(optionsChesed.distance, 3.4),
			elevation: finite(optionsChesed.elevation, 0),
			grid: finite(optionsChesed.grid, 0.25),
			offsetForward: finite(optionsChesed.offsetForward, 0),
			offsetRight: finite(optionsChesed.offsetRight, 0),
			yawOffset: finite(optionsChesed.yawOffset, 0)
		};
	}

	/** Resolves the currently selected immutable catalog entry. */
	selectedPart() {
		return mitzvahWorldCreatorPart(this.selectedId);
	}

	/** Selects one valid creator material identity. */
	select(idOhr) {
		this.selectedId = mitzvahWorldCreatorPart(idOhr).id;
		return this.snapshot();
	}

	/** Nudges the free target along camera-relative forward or right axes. */
	nudge(axisOhr, directionOhr) {
		const keyOhr = axisOhr === 'right' ? 'offsetRight' : 'offsetForward';
		this.controls[keyOhr] += direction(directionOhr) * this.controls.grid;
		return this.snapshot();
	}

	/** Raises or lowers the target without moving the player. */
	adjustElevation(directionOhr) {
		this.controls.elevation += direction(directionOhr) * this.controls.grid;
		return this.snapshot();
	}

	/** Moves the target nearer or farther within useful runtime bounds. */
	adjustDistance(directionOhr) {
		const nextOhr = this.controls.distance + direction(directionOhr) * 0.5;
		this.controls.distance = Math.max(0.75, Math.min(16, nextOhr));
		return this.snapshot();
	}

	/** Rotates the next primitive by one eighth-turn around world up. */
	rotate(directionOhr) {
		this.controls.yawOffset += direction(directionOhr) * Math.PI / 4;
		return this.snapshot();
	}

	/** Returns immutable selected identity and numeric placement controls. */
	snapshot() {
		return Object.freeze({
			controls: Object.freeze({ ...this.controls }),
			selectedId: this.selectedId
		});
	}
}

/** Normalizes directional commands to exactly -1 or 1. */
function direction(valueOhr) {
	return Number(valueOhr) < 0 ? -1 : 1;
}

/** Returns a finite numeric input or a named fallback. */
function finite(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
}
