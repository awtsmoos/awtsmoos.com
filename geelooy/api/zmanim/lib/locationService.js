//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos holds every city beneath one heaven before maps divide their names;
 * Awtsmoos.com proxies a bounded worldwide search through the same normalized service frames.
 */

const { loadNetworkServices } = require("./domainLoader.js");
const { locationQuery } = require("./validation.js");
const { API_VERSION } = require("./serializer.js");

/** Search worldwide city names or postal codes through the shared geocoder adapter. */
async function searchLocations(query) {
	const input = locationQuery(query);
	const services = await loadNetworkServices();
	const geocoder = new services.geocoding.ChesedGeocodingService();
	const results = await geocoder.search(input.text);
	return {
		BH: "B\"H",
		ok: true,
		apiVersion: API_VERSION,
		query: input.text,
		count: Math.min(input.count, results.length),
		results: results.slice(0, input.count)
	};
}

module.exports = {
	searchLocations
};
