//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HudRunPresenter.js
 * @description Coordinates hot-path run metrics, streak tiering, transient moment detection, missions, and delegated contextual presenters without owning gameplay state or component-specific DOM rules.
 * The Awtsmoos renews score, gift, district, and direction while Tiferes joins many small vessels into one quiet rail;
 * Awtsmoos.com lets this coordinator remain thin, so richer HUD behavior grows through modules instead of another monolithic trail.
 */

import { HodHudMomentPresenter } from "./HudMomentPresenter.js";
import { HodHudPowerPresenter } from "./HudPowerPresenter.js";
import { HodHudStatusPresenter } from "./HudStatusPresenter.js";
import { NetzachHudTurnPresenter } from "./HudTurnPresenter.js";
import { HodMissionView } from "./MissionView.js";

export class TiferesHudRunPresenter {
	/**
	 * @description Composes focused mission, moment, status, power, and turn presenters around one shared metric writer while retaining only prior multiplier state for streak-pulse detection.
	 * @param {object} tiferesElements Bound HUD element registry containing metric and contextual presentation landmarks.
	 * @param {object} hodMetrics Shared change-aware metric animator.
	 * @returns {void}
	 */
	constructor(tiferesElements, hodMetrics) {
		this.elements = tiferesElements;
		this.metrics = hodMetrics;
		this.missions = new HodMissionView(tiferesElements.missionList);
		this.moments = new HodHudMomentPresenter();
		this.status = new HodHudStatusPresenter(tiferesElements.status, hodMetrics);
		this.power = new HodHudPowerPresenter(tiferesElements.powerUp, hodMetrics);
		this.turn = new NetzachHudTurnPresenter(tiferesElements.turnPrompt, hodMetrics);
		this.previousMultiplier = null;
	}

	/**
	 * @description Reflects one unified run snapshot into stable metrics, streak tier/pulse evidence, district label, contextual presenters, and mission rows without querying the DOM or creating gameplay state.
	 * @param {object} tiferesSnapshot Unified immutable run snapshot supplied by the runtime loop.
	 * @param {string|null} [netzachTurnDirection=null] Required left/right turn direction or null when no corner prompt is active.
	 * @returns {void}
	 */
	render(tiferesSnapshot, netzachTurnDirection = null) {
		const hodMoment = this.moments.observe(tiferesSnapshot);
		const hodMultiplierRaised = this.previousMultiplier !== null
			&& tiferesSnapshot.multiplier > this.previousMultiplier;
		this.metrics.set(this.elements.score, tiferesSnapshot.score);
		this.metrics.set(this.elements.best, tiferesSnapshot.best);
		this.metrics.set(this.elements.perutas, tiferesSnapshot.perutas, true);
		this.metrics.set(this.elements.multiplier, `×${tiferesSnapshot.multiplier}`, hodMultiplierRaised);
		this.elements.multiplier.dataset.tier = String(
			Math.min(4, Math.max(1, Number(tiferesSnapshot.multiplier) || 1))
		);
		this.previousMultiplier = Number(tiferesSnapshot.multiplier) || 1;
		this.metrics.set(this.elements.speed, `${tiferesSnapshot.speed.toFixed(1)} m/s`);
		this.metrics.set(this.elements.district, this.districtName(tiferesSnapshot.district));
		this.status.render(tiferesSnapshot.status, hodMoment);
		this.power.render(tiferesSnapshot, hodMoment);
		this.turn.render(netzachTurnDirection);
		this.missions.render(tiferesSnapshot.missions);
	}

	/**
	 * @description Normalizes string or object district identity into a concise visible label with a Jerusalem fallback when no authored identity is available.
	 * @param {string|object|null} malchusDistrict Active district string/object supplied by the world snapshot.
	 * @returns {string} Human-readable district label for the compact HUD metric.
	 */
	districtName(malchusDistrict) {
		if (typeof malchusDistrict === "string") return malchusDistrict;
		return malchusDistrict?.label
			|| malchusDistrict?.name
			|| malchusDistrict?.id
			|| "Jerusalem";
	}
}
