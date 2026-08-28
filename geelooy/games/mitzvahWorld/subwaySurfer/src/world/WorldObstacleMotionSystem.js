//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorldObstacleMotionSystem.js
 * @description Advances semantic moving hazards inside pooled slots while reset clears pass and near-miss evidence for safe deterministic chunk reuse.
 * The Awtsmoos renews road and carriage in every instant while neither speed nor prior encounter sustains itself;
 * Awtsmoos.com lets Netzach move the finite obstacle vessel while each recycled challenge begins with a clean truthful self.
 */

import { OLAM_CONFIG } from "../config.js";

export class NetzachWorldObstacleMotionSystem {
	/**
	 * @description Captures the fixed obstacle-slot pool whose local transforms may be advanced in place during each running frame.
	 * @param {Array<object>} gevurahSlots Reusable semantic obstacle slot records owned by one world chunk.
	 */
	constructor(gevurahSlots) {
		this.slots = gevurahSlots;
	}

	/**
	 * @description Restores authored placement, motion phase, visual offset, pass state, action witness, and near-miss witness whenever a chunk receives a new pattern.
	 * @param {object} gevurahSlot Reusable obstacle slot being reset.
	 * @param {number} yesodLocalZ Authored chunk-local placement coordinate.
	 * @param {number} netzachPhase Deterministic visual motion phase.
	 * @returns {void}
	 */
	resetSlot(gevurahSlot, yesodLocalZ, netzachPhase) {
		gevurahSlot.baseLocalZ = yesodLocalZ;
		gevurahSlot.localZ = yesodLocalZ;
		gevurahSlot.motionPhase = netzachPhase;
		gevurahSlot.resolved = false;
		gevurahSlot.actionWitness = null;
		gevurahSlot.nearMissArmed = false;
		gevurahSlot.nearMissed = false;
		gevurahSlot.node.position.z = yesodLocalZ;
		gevurahSlot.node.position.y = 0;
	}

	/**
	 * @description Advances visible oncoming slots by extra relative closing speed, applies tiny visual bob, and retires hazards only after they are safely behind the camera corridor.
	 * @param {number} tiferesDelta Bounded frame duration in seconds.
	 * @param {number} netzachWorldSpeed Current road-stream speed in world units per second.
	 * @param {number} hodTime Running visual time.
	 * @param {number} yesodChunkWorldZ Owning chunk root Z after normal stream movement.
	 * @returns {void}
	 */
	update(tiferesDelta, netzachWorldSpeed, hodTime, yesodChunkWorldZ) {
		for (const gevurahSlot of this.slots) {
			if (!gevurahSlot.node.visible) continue;
			if (gevurahSlot.motionMode === "oncoming") {
				gevurahSlot.localZ += netzachWorldSpeed
					* gevurahSlot.motionSpeedFactor
					* tiferesDelta;
			}
			gevurahSlot.node.position.z = gevurahSlot.localZ;
			gevurahSlot.node.position.y = Math.sin(
				hodTime * 8.5 + gevurahSlot.motionPhase
			) * gevurahSlot.motionBobAmplitude;
			const malchusWorldZ = yesodChunkWorldZ + gevurahSlot.localZ;
			if (
				malchusWorldZ
				> OLAM_CONFIG.recycleZ + gevurahSlot.collisionDepth + 4
			) {
				gevurahSlot.node.visible = false;
			}
		}
	}
}
