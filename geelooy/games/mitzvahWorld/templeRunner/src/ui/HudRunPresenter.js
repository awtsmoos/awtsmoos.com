//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HudRunPresenter.js
 * @description Presents hot-path run metrics, tiered streak intensity, transient reward moments, contextual power, turn guidance, and cached missions without owning gameplay state.
 * The Awtsmoos renews score and gift while Tiferes lets only the needed words remain in sight;
 * Awtsmoos.com lets streak and Chesed flash with meaning, then yields the center back to the runner and road of light.
 */

import { HodHudMomentPresenter } from "./HudMomentPresenter.js";
import { ChesedHudPowerLabel } from "./HudPowerLabel.js";
import { HodMissionView } from "./MissionView.js";

export class TiferesHudRunPresenter {
	/** @param {object} elements Bound HUD elements. @param {object} metrics Change-aware metric animator. */
	constructor(elements, metrics) {
		this.elements = elements;
		this.metrics = metrics;
		this.missions = new HodMissionView(elements.missionList);
		this.powerLabel = new ChesedHudPowerLabel();
		this.moments = new HodHudMomentPresenter();
		this.previousMultiplier = null;
	}

	/** @param {object} snapshot Unified run snapshot. @param {string|null} turnDirection Required turn direction. */
	render(snapshot, turnDirection = null) {
		const moment = this.moments.observe(snapshot);
		const multiplierRaised = this.previousMultiplier !== null
			&& snapshot.multiplier > this.previousMultiplier;
		this.metrics.set(this.elements.score, snapshot.score);
		this.metrics.set(this.elements.best, snapshot.best);
		this.metrics.set(this.elements.perutas, snapshot.perutas, true);
		this.metrics.set(
			this.elements.multiplier,
			`×${snapshot.multiplier}`,
			multiplierRaised
		);
		this.elements.multiplier.dataset.tier = String(
			Math.min(4, Math.max(1, Number(snapshot.multiplier) || 1))
		);
		this.previousMultiplier = Number(snapshot.multiplier) || 1;
		this.metrics.set(this.elements.speed, `${snapshot.speed.toFixed(1)} m/s`);
		this.metrics.set(
			this.elements.district,
			this.districtName(snapshot.district)
		);
		this.renderStatus(snapshot.status, moment);
		this.renderPower(snapshot, moment);
		this.renderTurn(turnDirection);
		this.missions.render(snapshot.missions);
	}

	/** @param {string} status Run lifecycle status. @param {object} moment Transient presentation moment. */
	renderStatus(status, moment) {
		const paused = status === "paused";
		const showMoment = !paused && moment.active;
		this.elements.status.hidden = !paused && !showMoment;
		if (paused) {
			delete this.elements.status.dataset.moment;
			this.metrics.set(this.elements.status, "Paused");
			return;
		}
		if (!showMoment) {
			delete this.elements.status.dataset.moment;
			return;
		}
		this.elements.status.dataset.moment = moment.kind;
		this.metrics.set(this.elements.status, moment.label, moment.started);
	}

	/** @param {object} snapshot Unified run snapshot. @param {object} moment Transient presentation moment. */
	renderPower(snapshot, moment) {
		const label = this.powerLabel.compose(snapshot);
		const kind = this.powerLabel.kind(snapshot);
		this.elements.powerUp.hidden = !label;
		if (!label) {
			delete this.elements.powerUp.dataset.power;
			return;
		}
		this.elements.powerUp.dataset.power = kind;
		const powerMoment = moment.started && moment.kind !== "streak";
		this.metrics.set(this.elements.powerUp, label, powerMoment);
	}

	/** @param {string|null} direction Current turn direction. */
	renderTurn(direction) {
		this.elements.turnPrompt.hidden = !direction;
		if (!direction) {
			delete this.elements.turnPrompt.dataset.direction;
			return;
		}
		this.elements.turnPrompt.dataset.direction = direction;
		this.metrics.set(
			this.elements.turnPrompt,
			direction === "left" ? "← Turn left" : "Turn right →"
		);
	}

	/** @param {string|object|null} district Active district identity. @returns {string} */
	districtName(district) {
		if (typeof district === "string") return district;
		return district?.label
			|| district?.name
			|| district?.id
			|| "Jerusalem";
	}
}
