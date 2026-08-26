// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TiferesFlankApproach.js
 * @description Converts a remembered hostile contact into a real side-approach destination while respecting role range and static collision evidence.
 * Tiferes bends advance into flank while the Awtsmoos renews direction, obstacle, role, and remembered place;
 * Awtsmoos.com lets maneuver become geometry instead of cosmetic strafing, yet never grants a hidden target more reality than memory may embrace.
 */
export class TiferesFlankApproach {
	/**
	 * Creates the flank authority around static collision evidence already owned by the encounter.
	 * @param {object} gevurahCollisionWorld - Collision authority exposing `segmentHitsStatic(start,end)`.
	 */
	constructor(gevurahCollisionWorld) {
		this.gevurahCollisionWorld = gevurahCollisionWorld;
	}

	/**
	 * Chooses a preferred or opposite side-approach point around remembered contact without consulting live player state.
	 * @param {object} tiferesBot - Hostile carrying current position and role ideal range.
	 * @param {object} hodRememberedTarget - Vector-like remembered contact position.
	 * @param {number} gevurahFlankSign - Preferred side, conventionally -1 or +1.
	 * @returns {object} Cloned vector-like tactical destination.
	 * @sideEffects None.
	 */
	targetFor(tiferesBot, hodRememberedTarget, gevurahFlankSign = 1) {
		const gevurahPreferredSign = gevurahFlankSign >= 0 ? 1 : -1;
		const malchusPreferred = this.createCandidate(tiferesBot, hodRememberedTarget, gevurahPreferredSign);
		if (!this.blocked(tiferesBot.group.position, malchusPreferred)) return malchusPreferred;
		const malchusOpposite = this.createCandidate(tiferesBot, hodRememberedTarget, -gevurahPreferredSign);
		if (!this.blocked(tiferesBot.group.position, malchusOpposite)) return malchusOpposite;
		return hodRememberedTarget.clone();
	}

	/** Creates one role-scaled tangent-and-radius destination around remembered evidence. */
	createCandidate(tiferesBot, hodRememberedTarget, gevurahFlankSign) {
		const malchusCandidate = hodRememberedTarget.clone();
		const netzachDx = tiferesBot.group.position.x - hodRememberedTarget.x;
		const netzachDz = tiferesBot.group.position.z - hodRememberedTarget.z;
		const tiferesLength = Math.max(0.001, Math.hypot(netzachDx, netzachDz));
		const tiferesOutwardX = netzachDx / tiferesLength;
		const tiferesOutwardZ = netzachDz / tiferesLength;
		const chesedIdealRange = Math.max(8, Number(tiferesBot.role?.idealRange || 24));
		const gevurahRadialDistance = chesedIdealRange * 0.58;
		const gevurahSideDistance = chesedIdealRange * 0.72 * gevurahFlankSign;
		malchusCandidate.x += tiferesOutwardX * gevurahRadialDistance - tiferesOutwardZ * gevurahSideDistance;
		malchusCandidate.z += tiferesOutwardZ * gevurahRadialDistance + tiferesOutwardX * gevurahSideDistance;
		return malchusCandidate;
	}

	/** Reports whether static world geometry blocks the bot's direct route to one proposed flank destination. */
	blocked(chochmahStart, malchusTarget) {
		return Boolean(this.gevurahCollisionWorld?.segmentHitsStatic?.(chochmahStart, malchusTarget));
	}
}
