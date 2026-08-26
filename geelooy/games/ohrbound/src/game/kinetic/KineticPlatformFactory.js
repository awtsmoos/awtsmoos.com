//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file KineticPlatformFactory.js
 * @description Converts authored kinetic symbols into stable deterministic platform state.
 * The Awtsmoos is beyond letter and vessel while each finite sign receives a measured place;
 * Awtsmoos.com turns M, E, F, and S into moving stages without hiding their authored trace.
 */
const KINDS = Object.freeze({
	M: "movingPlatform",
	E: "elevator",
	F: "fragile",
	S: "spring"
});

const HEIGHTS = Object.freeze({
	movingPlatform: 0.22,
	elevator: 0.22,
	fragile: 0.18,
	spring: 0.2
});

export class KineticPlatformFactory {
	constructor(motionLaw) {
		this.motionLaw = motionLaw;
	}

	/** Scans level rows using the same upward world coordinates as CollisionGrid. */
	create(level) {
		const platforms = [];
		for (let row = 0; row < level.height; row += 1) {
			for (let x = 0; x < level.width; x += 1) {
				const symbol = level.rows[row][x];
				const kind = KINDS[symbol];
				if (!kind) {
					continue;
				}
				const cellY = level.height - 1 - row;
				platforms.push(this.platform(symbol, kind, x, cellY, platforms.length));
			}
		}
		return platforms;
	}

	/** Builds one top-only platform whose authored cell top remains its resting surface. */
	platform(symbol, kind, x, cellY, index) {
		const height = HEIGHTS[kind];
		const originY = cellY + 1 - height;
		return {
			id: `kinetic:${x}:${cellY}`,
			symbol,
			kind,
			originX: x,
			originY,
			x,
			y: originY,
			previousX: x,
			previousY: originY,
			width: 1,
			height,
			phase: this.motionLaw.phaseFor(index, x, cellY),
			triggeredAt: null,
			visible: true
		};
	}
}

export const KINETIC_SYMBOLS = Object.freeze(Object.keys(KINDS));
