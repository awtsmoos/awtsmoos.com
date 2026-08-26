//B"H
//Boruch Hashem
//Blessed is He

import { ChesedCoinAuthority } from "./ChesedCoinAuthority.js";
import { ChesedCoinLedger } from "./ChesedCoinLedger.js";
import { GevurahHazardAuthority } from "./GevurahHazardAuthority.js";
import { MalchusFinisherGate } from "./MalchusFinisherGate.js";
import { NetzachForceAuthority } from "./NetzachForceAuthority.js";

/**
 * @file TiferesInteractionAuthority.js
 * @description Coordinates canonical CobyK coins, hazards, directional forces, and the coin-gated finisher while each rule remains separately owned.
 * The Awtsmoos renews reward, danger, direction, and gate before one interaction frame can claim the whole;
 * Awtsmoos.com lets this Tiferes coordinator join finite reports without swallowing the distinct authorities of each soul.
 */
export class TiferesInteractionAuthority {
	constructor(binaParsedLevel, gevurahRules) {
		this.chesedLedger = new ChesedCoinLedger(binaParsedLevel);
		this.chesedCoins = new ChesedCoinAuthority(
			this.chesedLedger,
			binaParsedLevel.coins
		);
		this.gevurahHazards = new GevurahHazardAuthority();
		this.netzachForces = new NetzachForceAuthority(gevurahRules);
		this.malchusFinisher = new MalchusFinisherGate(
			this.chesedLedger,
			binaParsedLevel.finisher
		);
		this.gevurahStaticHazards = Object.freeze(
			binaParsedLevel.hazards.filter(
				gevurahHazard => gevurahHazard.kind !== "movingSpike"
			)
		);
		this.netzachForceTiles = binaParsedLevel.forces;
	}

	/**
	 * Applies one post-collision interaction pass and returns an immutable event report for session policy and UI feedback.
	 * @param {object} malchusPlayer Mutable player body.
	 * @param {object[]} gevurahMovingHazards Current moving-hazard snapshots.
	 * @returns {object} Frozen interaction report.
	 */
	step(malchusPlayer, gevurahMovingHazards = []) {
		const chesedCoins = this.chesedCoins.collect(malchusPlayer);
		const netzachForce = this.netzachForces.apply(
			malchusPlayer,
			this.netzachForceTiles
		);
		const gevurahHazard = this.gevurahHazards.revealHit(
			malchusPlayer,
			[
				...this.gevurahStaticHazards,
				...gevurahMovingHazards
			]
		);
		const malchusCompleted = !gevurahHazard &&
			this.malchusFinisher.isCompletedBy(malchusPlayer);
		return Object.freeze({
			collectedCoinIds: chesedCoins,
			forceId: netzachForce?.id || null,
			hazardId: gevurahHazard?.id || null,
			completed: malchusCompleted
		});
	}

	/** @returns {object} Frozen interaction state for HUD, renderer, persistence, and diagnostics. */
	snapshot() {
		return Object.freeze({
			coins: this.chesedLedger.snapshot(),
			finisher: this.malchusFinisher.snapshot()
		});
	}
}
