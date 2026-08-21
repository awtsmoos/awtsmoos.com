//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews each zman before sun or moon can mark its created hour;
 * Awtsmoos.com binds existing halachic instants to celestial angles without giving the visual layer calculating power.
 */

import { ZMAN_DEFINITIONS } from "../config/zmanim.js";
import {
	buildCelestialScene,
	solarPosition
} from "../../../libs/awtsmoos-procedural-core/src/core/celestial/index.js";

/** Build display markers from the exact instants already produced by the halachic calculator. */
export function buildCelestialMarkers(times, location) {
	const observer = observerFromLocation(location);
	return ZMAN_DEFINITIONS.flatMap(definition => {
		const time = times?.[definition.id];
		if (!(time instanceof Date) || Number.isNaN(time.getTime())) {
			return [];
		}
		const sun = solarPosition(time, observer);
		return [{
			id: definition.id,
			label: definition.label,
			note: definition.note,
			time,
			sunAltitudeDegrees: sun.altitudeDegrees,
			sunAzimuthDegrees: sun.azimuthDegrees
		}];
	});
}

/** Choose a useful initial celestial instant without creating another zman priority system. */
export function chooseCelestialMarker(markers, status, preferredId) {
	const requested = markers.find(marker => marker.id === preferredId);
	if (requested) {
		return requested;
	}
	const next = markers.find(marker => marker.id === status?.next?.id);
	return next
		|| markers.find(marker => marker.id === "chatzos")
		|| markers.find(marker => marker.id === "sunrise")
		|| markers[0]
		|| null;
}

/** Build one complete sky snapshot at the selected zman's exact instant. */
export function buildZmanimCelestialView(times, status, location, preferredId) {
	const markers = buildCelestialMarkers(times, location);
	const selectedMarker = chooseCelestialMarker(markers, status, preferredId);
	const observer = observerFromLocation(location);
	return {
		markers,
		selectedMarker,
		scene: selectedMarker
			? buildCelestialScene(selectedMarker.time, observer)
			: null
	};
}

/** Reduce a full location record to the observer coordinates needed by astronomy. */
function observerFromLocation(location) {
	return {
		latitude: Number(location?.latitude),
		longitude: Number(location?.longitude)
	};
}
