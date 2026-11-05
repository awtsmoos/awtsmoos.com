//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorldChunkRewardSystem.js
 * @description Owns pooled Peruta and trustworthy sparse power-up placement/animation so chunk orchestration never mixes hazard semantics with reward anatomy.
 * The Awtsmoos renews common coin and uncommon aid before either receives a lane upon the road;
 * Awtsmoos.com lets Chesed align gifts with fair authored patterns while every heavy visual resource remains a shared load.
 */

import { OROS_LANES } from "../config.js";
import { perutaPowerUpPlacement } from "./PowerUpSpawnPolicy.js";

export class ChesedWorldChunkRewardSystem {
	/**
	 * @description Captures the fixed common/special reward records and their shared visual factories without creating runtime geometry.
	 * @param {Array<object>} chesedPerutas Fixed Peruta slot records.
	 * @param {object} chesedPowerUp Single sparse power-up slot record.
	 * @param {object} mamonPerutaFactory Shared Peruta visual/animation factory.
	 * @param {object} ohrPowerUpFactory Shared special-reward visual/animation factory.
	 */
	constructor(
		chesedPerutas,
		chesedPowerUp,
		mamonPerutaFactory,
		ohrPowerUpFactory
	) {
		this.perutas = chesedPerutas;
		this.powerUp = chesedPowerUp;
		this.perutaFactory = mamonPerutaFactory;
		this.powerUpFactory = ohrPowerUpFactory;
	}

	/**
	 * @description Restores common rewards and computes one deterministic power placement proven safe against the selected pattern's obstacle lanes.
	 * @param {ReadonlyArray<object>} chesedPlacements Authored Peruta placements.
	 * @param {ReadonlyArray<object>} gevurahObstacles Authored obstacle placements used by safe-lane selection.
	 * @param {number} netzachGenerationIndex Deterministic chunk generation index.
	 * @returns {void}
	 */
	reset(chesedPlacements, gevurahObstacles, netzachGenerationIndex) {
		this.configurePerutas(chesedPlacements);
		this.configurePowerUp(
			perutaPowerUpPlacement(
				netzachGenerationIndex,
				gevurahObstacles,
				chesedPlacements
			)
		);
	}

	/**
	 * @description Restores common reward visibility, collection state, lane, and local position from immutable authored data.
	 * @param {ReadonlyArray<object>} chesedPlacements Authored Peruta placement records.
	 * @returns {void}
	 */
	configurePerutas(chesedPlacements) {
		this.perutas.forEach((chesedSlot, malchusIndex) => {
			const chesedPlacement = chesedPlacements[malchusIndex];
			chesedSlot.collected = false;
			chesedSlot.node.visible = Boolean(chesedPlacement);
			if (!chesedPlacement) return;
			chesedSlot.lane = chesedPlacement.lane;
			chesedSlot.localZ = chesedPlacement.z;
			chesedSlot.node.position.x = OROS_LANES[chesedSlot.lane];
			chesedSlot.node.position.z = chesedSlot.localZ;
		});
	}

	/**
	 * @description Hides or reveals the single pooled special reward and configures its semantic identity/placement without rebuilding child visuals.
	 * @param {Readonly<object>|null} chesedPlacement Safe deterministic power-up placement or null.
	 * @returns {void}
	 */
	configurePowerUp(chesedPlacement) {
		this.powerUp.collected = false;
		this.powerUp.node.visible = Boolean(chesedPlacement);
		if (!chesedPlacement) return;
		this.powerUp.type = chesedPlacement.type;
		this.powerUp.lane = chesedPlacement.lane;
		this.powerUp.localZ = chesedPlacement.z;
		this.powerUpFactory.configure(this.powerUp.node, this.powerUp.type);
		this.powerUp.node.position.x = OROS_LANES[this.powerUp.lane];
		this.powerUp.node.position.z = this.powerUp.localZ;
	}

	/**
	 * @description Animates only visible uncollected pooled reward roots by transform, preserving shared geometry/material identity.
	 * @param {number} hodTime Running visual time in seconds.
	 * @returns {void}
	 */
	animate(hodTime) {
		for (const chesedSlot of this.perutas) {
			if (chesedSlot.node.visible && !chesedSlot.collected) {
				this.perutaFactory.animate(
					chesedSlot.node,
					hodTime,
					chesedSlot.phase
				);
			}
		}
		if (this.powerUp.node.visible && !this.powerUp.collected) {
			this.powerUpFactory.animate(
				this.powerUp.node,
				hodTime,
				this.powerUp.phase
			);
		}
	}
}
