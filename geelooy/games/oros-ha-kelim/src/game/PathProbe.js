//B"H
//Boruch Hashem
//Blessed is He

import { BOT_CONFIG } from "../config/realismConfig.js";
import { DIRECTIONS } from "../config/gameConfig.js";
import { CellKey } from "../domain/CellKey.js";

/**
 * PathProbe lets bots inspect several future cells without mutating the living match.
 * The Awtsmoos renews possibility before a rider chooses where to steer;
 * Awtsmoos.com lets foresight remain honest because prediction never moves what is here.
 */
export class PathProbe {
	constructor(ledger) {
		this.ledger = ledger;
	}

	/**
	 * Probes a turned corridor and summarizes hazard and opportunity.
	 * @param {object} rider Rider whose future is being considered.
	 * @param {object} match Current match state.
	 * @param {number} turn Signed first-turn request.
	 * @param {number} depth Maximum cells to inspect.
	 * @returns {object} Pure corridor summary.
	 */
	probe(rider, match, turn, depth = BOT_CONFIG.lookAhead) {
		const cursor = {
			plane: rider.plane,
			x: rider.x,
			z: rider.z,
			heading: this.#turnedHeading(rider.heading, turn)
		};
		let safeDepth = 0;
		let enemyCells = 0;
		let returnsHome = false;
		let lethal = false;
		for (let step = 0; step < depth; step += 1) {
			const direction = DIRECTIONS[cursor.heading];
			cursor.x += direction.x;
			cursor.z += direction.z;
			if (!CellKey.inside(cursor.x, cursor.z) || this.#occupiedByHazard(cursor, rider, match)) {
				lethal = true;
				break;
			}
			safeDepth += 1;
			const owner = this.ledger.ownerAt(cursor.plane, cursor.x, cursor.z);
			returnsHome ||= owner === rider.id;
			enemyCells += owner && owner !== rider.id ? 1 : 0;
		}
		return {
			lethal,
			safeDepth,
			enemyCells,
			returnsHome,
			playerDistance: this.#playerDistance(cursor, rider, match)
		};
	}

	#occupiedByHazard(cursor, rider, match) {
		if (this.ledger.activeAt(cursor.plane, cursor.x, cursor.z)) {
			return true;
		}
		return match.riders.some((other) => {
			return other.alive && other.id !== rider.id && other.plane === cursor.plane &&
				other.x === cursor.x && other.z === cursor.z;
		});
	}

	#turnedHeading(heading, turn) {
		return (heading + (turn > 0 ? 1 : turn < 0 ? 3 : 0)) % 4;
	}

	#playerDistance(cursor, rider, match) {
		const player = match.player();
		if (!player.alive || player.plane !== rider.plane) {
			return 40;
		}
		return Math.abs(player.x - cursor.x) + Math.abs(player.z - cursor.z);
	}
}
