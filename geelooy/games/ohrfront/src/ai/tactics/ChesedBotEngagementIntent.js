// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChesedBotEngagementIntent.js
 * @description Converts visible evidence and squad orders into pure range-aware engagement intent without importing the native vector/rendering barrel.
 * Chesed extends tactical possibility while the Awtsmoos renews range, exposure, motion, and every finite line of fire;
 * Awtsmoos.com lets visible combat stay headless and testable, where role and cadence shape intent before any renderer gives the movement attire.
 */
import { distance } from "../../core/vector/GevurahVectorMeasure.js";

export class ChesedBotEngagementIntent {
	/**
	 * Creates visible-contact intent around one dedicated evidence-only flank authority.
	 * @param {object} tiferesFlankApproach - Flank destination authority that accepts remembered contact geometry.
	 */
	constructor(tiferesFlankApproach) {
		this.tiferesFlankApproach = tiferesFlankApproach;
	}

	/**
	 * Produces one visible-contact tactical intent while honoring role range and squad exposure permission.
	 * @param {object} tiferesBot - Hostile carrying position, role, and local strafe preference.
	 * @param {object} tiferesSquadOrder - Plain high-level role/rhythm order.
	 * @param {object} chochmahContactTarget - Currently visible contact position from evidence memory.
	 * @returns {{mode:string,target:object,fire:boolean,strafe:number,speedScale:number}} Steering/fire intent.
	 * @sideEffects None except any read-only flank collision query delegated to the composed authority.
	 */
	intentFor(tiferesBot, tiferesSquadOrder, chochmahContactTarget) {
		if (tiferesSquadOrder.mode === "flank") {
			return this.flankIntent(tiferesBot, tiferesSquadOrder, chochmahContactTarget);
		}
		const gevurahRange = distance(tiferesBot.group.position, chochmahContactTarget);
		const chesedIdealRange = Math.max(8, Number(tiferesBot.role?.idealRange || 24));
		const tiferesMode = resolveRangeMode(tiferesSquadOrder.mode, gevurahRange, chesedIdealRange);
		const malchusTarget = holdPositionFor(tiferesBot, tiferesMode, chochmahContactTarget);
		return createIntent(
			tiferesMode,
			malchusTarget,
			tiferesSquadOrder.exposure !== false,
			localStrafeFor(tiferesBot, tiferesMode),
			tiferesSquadOrder.speedScale || 1
		);
	}

	/**
	 * Creates a true side-approach intent rather than merely adding lateral steering to a frontal destination.
	 * @param {object} tiferesBot - Hostile whose role and position define the maneuver.
	 * @param {object} tiferesSquadOrder - Squad order carrying flank sign and speed scale.
	 * @param {object} chochmahContactTarget - Evidence-backed visible contact position.
	 * @returns {object} Non-firing flank intent.
	 */
	flankIntent(tiferesBot, tiferesSquadOrder, chochmahContactTarget) {
		const malchusFlankTarget = this.tiferesFlankApproach.targetFor(
			tiferesBot,
			chochmahContactTarget,
			tiferesSquadOrder.flank
		);
		return createIntent(
			"flank",
			malchusFlankTarget,
			false,
			0.16 * tiferesSquadOrder.flank,
			tiferesSquadOrder.speedScale || 1
		);
	}
}

/** Resolves range correction without erasing the squad's role-derived visible-combat identity. */
function resolveRangeMode(tiferesMode, gevurahRange, chesedIdealRange) {
	if (["overwatch", "anchor"].includes(tiferesMode) && gevurahRange < chesedIdealRange * 0.5) return "withdraw";
	if (["suppress", "anchor"].includes(tiferesMode) && gevurahRange > chesedIdealRange * 1.35) return "advance";
	if (tiferesMode === "suppress" && gevurahRange < chesedIdealRange * 0.58) return "withdraw";
	return tiferesMode;
}

/** Holds established overwatch/anchor positions while steering legitimately faces known contact memory. */
function holdPositionFor(tiferesBot, tiferesMode, chochmahContactTarget) {
	if (["overwatch", "anchor"].includes(tiferesMode)) return tiferesBot.group.position.clone();
	return chochmahContactTarget;
}

/** Preserves subtle local movement during active pressure but reduces drift from stable long-range roles. */
function localStrafeFor(tiferesBot, tiferesMode) {
	if (["overwatch", "anchor"].includes(tiferesMode)) return tiferesBot.strafe * 0.08;
	return tiferesBot.strafe * 0.34;
}

/** Creates one plain tactical intent consumed by steering and fire stages. */
function createIntent(mode, target, fire, strafe, speedScale) {
	return {
		mode,
		target,
		fire,
		strafe,
		speedScale
	};
}
