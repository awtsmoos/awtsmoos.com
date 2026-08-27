//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond disclosure and statistic while each visible datum receives a measured place;
 * Awtsmoos.com renders the celestial panel's summary and living facts as small semantic vessels with futuristic grace.
 */

import { MalchusTimeFormatter } from "../domain/timezone.js";
import { renderCelestialMarkerRail } from "./celestial-marker-rail.js";
import { renderCelestialScene } from "./celestial-scene-renderer.js";

/** Build the disclosure summary with current zman time and a visible retract affordance. */
export function renderCelestialSummary(view, timezone) {
	const summary = document.createElement("summary");
	const marker = view.selectedMarker;
	summary.className = "celestial-summary";
	summary.innerHTML = `
		<span class="celestial-summary-copy">
			<small>Live astronomical geometry</small>
			<strong>Sky of this day</strong>
		</span>
		<span class="celestial-summary-state">
			<b>${marker ? MalchusTimeFormatter.time(marker.time, timezone) : "—"}</b>
			<i aria-hidden="true"></i>
		</span>`;
	return summary;
}

/** Build the complete body while keeping controls ordinary DOM above optional GPU rendering. */
export function renderCelestialBody(view, timezone) {
	const body = document.createElement("div");
	body.className = "celestial-panel-body";
	body.append(
		renderCelestialScene(view.scene),
		renderCelestialStats(view),
		renderCelestialMarkerRail(view.markers, view.selectedMarker?.id, timezone)
	);
	return body;
}

/** Build compact facts for the selected zman, sun, and moon. */
function renderCelestialStats(view) {
	const stats = document.createElement("div");
	stats.className = "celestial-stats";
	if (!view.scene || !view.selectedMarker) {
		stats.textContent = "No celestial event is available for this date.";
		return stats;
	}

	const { sun, moon } = view.scene;
	stats.innerHTML = `
		<span><small>Selected gate</small><strong>${view.selectedMarker.label}</strong></span>
		<span><small>Solar vector</small><strong>${signedAngle(sun.altitudeDegrees)} alt · ${sun.azimuthDegrees.toFixed(1)}° az</strong></span>
		<span><small>Lunar light</small><strong>${moon.phase.name} · ${(moon.phase.illuminatedFraction * 100).toFixed(0)}%</strong></span>`;
	return stats;
}

/** Format altitude with an explicit sign so twilight geometry reads instantly. */
function signedAngle(value) {
	const formatted = Number(value).toFixed(1);
	return Number(value) > 0 ? `+${formatted}°` : `${formatted}°`;
}
