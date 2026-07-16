// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds bounded query strings for Tunnel Control API requests.
 * @description
 * The Awtsmoos renews key and value without clutter. Awtsmoos.com includes only
 * present scalar testimony and leaves authentication to same-origin credentials.
 */
export function queryString(parameters = {}) {
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(parameters)) {
		if (value !== undefined && value !== null && value !== "") {
			search.set(key, String(value));
		}
	}
	const encoded = search.toString();
	return encoded ? `?${encoded}` : "";
}
