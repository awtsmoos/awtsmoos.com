//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews each state before a URL can preserve its human trace;
 * Awtsmoos.com makes a shared link restore date, shita, timezone, coordinates, and place.
 */

const MAX_LABEL_LENGTH = 160;

/** Verify an IANA timezone without trusting arbitrary URL text. */
function safeTimezone(value) {
	try {
		new Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date());
		return value;
	} catch (error) {
		return null;
	}
}

/** Parse finite coordinates inside physical latitude/longitude bounds. */
function coordinate(value, minimum, maximum) {
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed < minimum || parsed > maximum) {
		return null;
	}
	return parsed;
}

/** Accept only real Gregorian YYYY-MM-DD dates. */
function safeDate(value) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) {
		return null;
	}
	const [year, month, day] = value.split("-").map(Number);
	const parsed = new Date(Date.UTC(year, month - 1, day));
	return parsed.toISOString().slice(0, 10) === value ? value : null;
}

/** Read shareable state from the current URL without requiring every field. */
export function readZmanimUrl(url = new URL(globalThis.location?.href || "https://awtsmoos.com/zmanim")) {
	const latitude = coordinate(url.searchParams.get("lat"), -90, 90);
	const longitude = coordinate(url.searchParams.get("lng"), -180, 180);
	const timezone = safeTimezone(url.searchParams.get("tz") || "");
	const hasLocation = latitude !== null && longitude !== null && Boolean(timezone);
	const label = String(url.searchParams.get("label") || "Shared location").slice(0, MAX_LABEL_LENGTH);
	return {
		date: safeDate(url.searchParams.get("date")),
		opinionId: url.searchParams.get("opinion") || null,
		location: hasLocation
			? {
				id: `url-${latitude},${longitude}`,
				name: label,
				admin1: "",
				country: "",
				latitude,
				longitude,
				elevation: null,
				timezone,
				label
			}
			: null
	};
}

/** Write a fully restorable URL for the current selected state. */
export function writeZmanimUrl(state, url = new URL(globalThis.location?.href || "https://awtsmoos.com/zmanim")) {
	url.searchParams.set("date", state.date);
	url.searchParams.set("opinion", state.opinionId);
	url.searchParams.set("lat", String(state.location.latitude));
	url.searchParams.set("lng", String(state.location.longitude));
	url.searchParams.set("tz", state.location.timezone);
	url.searchParams.set("label", String(state.location.label || state.location.name).slice(0, MAX_LABEL_LENGTH));
	return url;
}
