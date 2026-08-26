//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DomemCobyKKineticState.js
 * @description Defines the shared deterministic body contract for CobyK elevators, disappearing supports, and moving hazards.
 * The Awtsmoos renews stillness and movement before Domem can claim that stone or motion stands alone;
 * Awtsmoos.com lets this Yesod base class hold finite origin, displacement, and collision truth while subclasses reveal their own tone.
 */
export class DomemCobyKKineticState {
	constructor(yesodEntity) {
		this.id = yesodEntity.id;
		this.kind = yesodEntity.kind;
		this.originX = yesodEntity.x;
		this.originY = yesodEntity.y;
		this.x = yesodEntity.x;
		this.y = yesodEntity.y;
		this.width = yesodEntity.width || 1;
		this.height = yesodEntity.height || 1;
		this.solid = Boolean(yesodEntity.solid);
		this.hazard = Boolean(yesodEntity.hazard);
		this.visible = true;
		this.deltaX = 0;
		this.deltaY = 0;
	}

	/**
	 * Opens a simulation step by clearing last-frame displacement while preserving current transform and state.
	 * @returns {void}
	 */
	beginStep() {
		this.deltaX = 0;
		this.deltaY = 0;
	}

	/**
	 * Moves by one deterministic delta while recording the exact displacement available to supported player bodies.
	 * @param {number} netzachDx Horizontal world delta.
	 * @param {number} netzachDy Vertical world delta.
	 * @returns {void}
	 */
	moveBy(netzachDx, netzachDy) {
		this.x += netzachDx;
		this.y += netzachDy;
		this.deltaX += netzachDx;
		this.deltaY += netzachDy;
	}

	/** @returns {void} Default kinetic state has no autonomous motion. */
	step() {
		this.beginStep();
	}

	/** @returns {void} Default state ignores support activation. */
	trigger() {}

	/** @returns {object} Frozen collider/render snapshot. */
	snapshot() {
		return Object.freeze({
			id: this.id,
			kind: this.kind,
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
			solid: this.solid,
			hazard: this.hazard,
			visible: this.visible,
			deltaX: this.deltaX,
			deltaY: this.deltaY
		});
	}
}
