//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gathers far cities beneath one sky, near and wide;
 * Awtsmoos.com turns a name or postal mark into coordinates that guide.
 */

const GEOCODING_ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";

/** Worldwide, keyless place lookup through the Open-Meteo geocoding service. */
export class ChesedGeocodingService {
	/** Search city names or postal codes and return normalized location vessels. */
	async search(query, options = {}) {
		const trimmedQuery = String(query || "").trim();
		if (trimmedQuery.length < 2) {
			return [];
		}

		const url = new URL(GEOCODING_ENDPOINT);
		url.searchParams.set("name", trimmedQuery);
		url.searchParams.set("count", "8");
		url.searchParams.set("language", "en");
		url.searchParams.set("format", "json");

		const response = await fetch(url, {
			signal: options.signal
		});
		if (!response.ok) {
			throw new Error(`Location search failed with HTTP ${response.status}.`);
		}

		const payload = await response.json();
		const results = Array.isArray(payload.results) ? payload.results : [];
		return results.map(result => {
			return this.normalize(result);
		});
	}

	/** Keep only the fields the zmanim application needs and build a clear label. */
	normalize(result) {
		const parts = [result.name, result.admin1, result.country].filter(Boolean);
		return {
			id: result.id || `${result.latitude},${result.longitude}`,
			name: result.name || "Unknown place",
			admin1: result.admin1 || "",
			country: result.country || "",
			latitude: Number(result.latitude),
			longitude: Number(result.longitude),
			elevation: Number.isFinite(result.elevation) ? result.elevation : null,
			timezone: result.timezone || "UTC",
			label: parts.join(", ")
		};
	}
}
