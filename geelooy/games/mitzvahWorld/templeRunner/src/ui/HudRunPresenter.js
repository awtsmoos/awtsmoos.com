// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HudRunPresenter.js
 * @description Presents hot-path run metrics, contextual power, turn guidance, and cached missions without owning UI lifecycle.
 * The Awtsmoos renews score and direction while Tiferes lets only the needed words remain in sight;
 * Awtsmoos.com keeps the running path small, so one frame updates truth without rebuilding the interface light.
 */

import { ChesedHudPowerLabel } from "./HudPowerLabel.js";
import { HodMissionView } from "./MissionView.js";

export class TiferesHudRunPresenter {
	/**
	 * @param {object} elements Bound HUD elements.
	 * @param {object} metrics Change-aware metric animator.
	 */
	constructor(elements, metrics) {
		this.elements = elements;
		this.metrics = metrics;
		this.missions = new HodMissionView(elements.missionList);
		this.powerLabel = new ChesedHudPowerLabel();
	}

	/**
	 * Presents one unified run snapshot.
	 * @param {object} snapshot Unified run snapshot.
	 * @param {string|null} turnDirection Required turn direction.
	 */
	render(snapshot, turnDirection = null) {
		this.metrics.set(this.elements.score, snapshot.score);
		this.metrics.set(this.elements.best, snapshot.best);
		this.metrics.set(this.elements.perutas, snapshot.perutas, true);
		this.metrics.set(
			this.elements.multiplier,
			`×${snapshot.multiplier}`,
			true
		);
		this.metrics.set(
			this.elements.speed,
			`${snapshot.speed.toFixed(1)} m/s`
		);
		this.metrics.set(
			this.elements.district,
			this.districtName(snapshot.district)
		);
		this.renderStatus(snapshot.status);
		this.renderPower(snapshot);
		this.renderTurn(turnDirection);
		this.missions.render(snapshot.missions);
	}

	/** @param {string} status Current run lifecycle status. */
	renderStatus(status) {
		const paused = status === "paused";
		this.elements.status.hidden = !paused;
		if (paused) {
			this.metrics.set(this.elements.status, "Paused");
		}
	}

	/** @param {object} snapshot Unified run snapshot. */
	renderPower(snapshot) {
		const label = this.powerLabel.compose(snapshot);
		this.elements.powerUp.hidden = !label;
		if (label) {
			this.metrics.set(this.elements.powerUp, label);
		}
	}

	/** @param {string|null} direction Current turn direction. */
	renderTurn(direction) {
		this.elements.turnPrompt.hidden = !direction;
		if (!direction) {
			delete this.elements.turnPrompt.dataset.direction;
			return;
		}
		this.elements.turnPrompt.dataset.direction = direction;
		const label = direction === "left"
			? "← Turn left"
			: "Turn right →";
		this.metrics.set(this.elements.turnPrompt, label);
	}

	/** @param {string|object|null} district Active district identity. @returns {string} */
	districtName(district) {
		if (typeof district === "string") {
			return district;
		}
		return district?.label
			|| district?.name
			|| district?.id
			|| "Jerusalem";
	}
}
