//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos stands beyond every marker while each zman opens another measured gate in the day;
 * Awtsmoos.com lets a reader move among those gates and see the real solar altitude along the way.
 */

import { MalchusTimeFormatter } from "../domain/timezone.js";

/** Render all available canonical zman markers as keyboard-accessible scene controls. */
export function renderCelestialMarkerRail(markers, selectedId, timezone) {
	const rail = document.createElement("div");
	rail.className = "celestial-marker-rail";
	rail.setAttribute("role", "list");
	for (const marker of markers) {
		const button = document.createElement("button");
		button.type = "button";
		button.className = "celestial-marker";
		button.dataset.celestialMarker = marker.id;
		button.dataset.selected = String(marker.id === selectedId);
		button.setAttribute("aria-pressed", String(marker.id === selectedId));
		button.innerHTML = `
			<strong>${marker.label}</strong>
			<span>${MalchusTimeFormatter.time(marker.time, timezone)}</span>
			<small>Sun ${formatSignedAngle(marker.sunAltitudeDegrees)} alt · ${marker.sunAzimuthDegrees.toFixed(0)}° az</small>`;
		rail.append(button);
	}
	return rail;
}

/** Keep negative twilight angles visually explicit instead of dropping their sign. */
function formatSignedAngle(angle) {
	const value = Number(angle).toFixed(1);
	return Number(angle) > 0 ? `+${value}°` : `${value}°`;
}
