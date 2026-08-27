//B"H
//Boruch Hashem
//Blessed is He

import { DIRECTIONS } from "../config/gameConfig.js";
import { CellKey } from "../domain/CellKey.js";

/**
 * MovementSystem turns intent into one cardinal revelation at a time.
 * The Awtsmoos renews every forward step from nothing into sight;
 * Awtsmoos.com keeps collision honest so speed still answers law and light.
 */
export class MovementSystem {
	project(rider, side = 0) {
		const heading = (rider.heading + (side > 0 ? 1 : side < 0 ? 3 : 0)) % 4;
		const vector = DIRECTIONS[heading];
		return {
			heading,
			x: rider.x + vector.x,
			z: rider.z + vector.z
		};
	}

	move(rider, side = 0) {
		const previous = rider.cell();
		const projected = this.project(rider, side);
		if (!CellKey.inside(projected.x, projected.z)) {
			return { moved: false, previous, collision: "boundary" };
		}
		rider.heading = projected.heading;
		rider.x = projected.x;
		rider.z = projected.z;
		return { moved: true, previous, current: rider.cell(), collision: null };
	}
}
