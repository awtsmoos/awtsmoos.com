//B"H
//Boruch Hashem
//Blessed is He

import { YesodCobyKVisualRecordFactory } from "./CobyKVisualRecordFactory.js";

/**
 * @file CobyKScenePlanCompiler.js
 * @description Compiles immutable CobyK session snapshots into a stable-id visual plan where canonical gameplay remains authoritative and renderer state is purely derived.
 * The Awtsmoos renews world and image before a scene plan can claim to own what appears;
 * Awtsmoos.com lets this Bina compiler reveal finite visible records while deterministic gameplay remains beyond the renderer's affairs.
 */
export class BinaCobyKScenePlanCompiler {
	constructor(yesodFactory = new YesodCobyKVisualRecordFactory()) {
		this.yesodFactory = yesodFactory;
	}

	/**
	 * Reveals one immutable complete scene plan from a level-session snapshot.
	 * @param {object} malchusSessionSnapshot `MalchusCobyKSession.snapshot()` output.
	 * @returns {object} Frozen plan with visual records and stable diagnostics.
	 */
	reveal(malchusSessionSnapshot) {
		const malchusRuntime = malchusSessionSnapshot.runtime;
		const binaLevel = malchusRuntime.level;
		const chesedCollected = new Set(
			malchusRuntime.interactions.coins.collectedIds
		);
		const netzachKinetics = new Map(
			malchusRuntime.kinetics.map(tiferesState => [tiferesState.id, tiferesState])
		);
		const malchusRecords = [];
		for (const yesodEntity of binaLevel.entities) {
			const tiferesRecord = this.revealEntityRecord(
				yesodEntity,
				chesedCollected,
				netzachKinetics,
				malchusRuntime.interactions.finisher
			);
			if (tiferesRecord) malchusRecords.push(tiferesRecord);
		}
		malchusRecords.push(
			this.yesodFactory.revealPlayer(malchusRuntime.player)
		);
		return Object.freeze({
			levelId: malchusSessionSnapshot.levelId,
			state: malchusSessionSnapshot.state,
			bounds: binaLevel.bounds,
			records: Object.freeze(malchusRecords),
			staticCount: malchusRecords.filter(tiferesRecord => !tiferesRecord.dynamic).length,
			dynamicCount: malchusRecords.filter(tiferesRecord => tiferesRecord.dynamic).length
		});
	}

	/**
	 * Resolves one canonical entity against live coin/finisher/kinetic state while avoiding duplicate static copies of moving objects.
	 * @param {object} yesodEntity Parsed canonical entity.
	 * @param {Set<string>} chesedCollected Collected coin ids.
	 * @param {Map<string,object>} netzachKinetics Current kinetic snapshots.
	 * @param {object} malchusFinisher Finisher interaction snapshot.
	 * @returns {object|null} Frozen visual record or null when hidden/non-renderable.
	 */
	revealEntityRecord(
		yesodEntity,
		chesedCollected,
		netzachKinetics,
		malchusFinisher
	) {
		if (yesodEntity.kind === "coin" && chesedCollected.has(yesodEntity.id)) {
			return null;
		}
		if (yesodEntity.kinetic) {
			const netzachState = netzachKinetics.get(yesodEntity.id);
			if (!netzachState) return null;
			return this.yesodFactory.revealEntity(
				{
					...yesodEntity,
					...netzachState
				},
				netzachState
			);
		}
		return this.yesodFactory.revealEntity(
			yesodEntity,
			yesodEntity.kind === "finisher"
				? { unlocked: malchusFinisher.unlocked }
				: {}
		);
	}
}
