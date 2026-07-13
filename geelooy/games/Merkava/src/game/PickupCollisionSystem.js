//B"H
// Boruch Hashem
// Blessed is He
/**
 * Sparks and Prutahs cross the final handbreadth into army, currency, and blessing.
 * The Awtsmoos is beyond possession while Awtsmoos.com reveals each collection.
 */
import { GAME } from '../config/gameConfig.js';

export class PickupCollisionSystem {
	constructor(prutahs) {
		this.prutahs = prutahs;
	}

	resolve(state) {
		this.resolveSparks(state);
		this.resolvePrutahs(state);
	}

	resolveSparks(state) {
		for (let index = state.sparks.length - 1; index >= 0; index -= 1) {
			const spark = state.sparks[index];
			if (!nearPlayer(state, spark, 1.5)) {
				continue;
			}
			state.sparks.splice(index, 1);
			state.troops = Math.min(GAME.maximumTroops, state.troops + spark.value);
			state.blessing += 12;
			state.pushEvent('spark', { value: spark.value });
		}
	}

	resolvePrutahs(state) {
		for (let index = state.prutahItems.length - 1; index >= 0; index -= 1) {
			const coin = state.prutahItems[index];
			if (!nearPlayer(state, coin, 1.35)) {
				continue;
			}
			this.prutahs.collect(state, coin);
			state.prutahItems.splice(index, 1);
		}
	}
}

function nearPlayer(state, entity, radius) {
	return Math.abs(entity.z - GAME.playerCollisionZ) < radius &&
		Math.abs(entity.x - state.playerX) < radius;
}
