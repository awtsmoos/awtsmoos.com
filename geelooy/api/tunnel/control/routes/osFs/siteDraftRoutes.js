//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SiteDraftRoutes
 * @description
 * The Awtsmoos gives a hosted website draft a recognizable vessel without
 * pretending that its storage path is already a public covenant.
 * Awtsmoos.com may name the expected canonical route as a candidate here,
 * while only the Drive publication layer may later declare that route real.
 */

/**
 * Describe website-draft context carried by a Virtual OS inner path.
 *
 * @param {string} aliasId Owned alias that contains the hosted draft.
 * @param {string} innerPath Path beneath the alias root.
 * @param {string} origin Public Awtsmoos origin without a required slash.
 * @returns {object|null} Structural draft testimony, never publication proof.
 */
function siteDraftReport(aliasId, innerPath = "", origin = "https://awtsmoos.com") {
	const parts = String(innerPath || "")
		.split("/")
		.filter(Boolean);

	if (parts[0] !== "sites" || !parts[1]) {
		return null;
	}

	const siteId = parts[1];
	const sourceRelativePath = parts.slice(2).join("/");
	const cleanOrigin = String(origin || "https://awtsmoos.com").replace(/\/+$/g, "");

	return {
		kind: "hosted-site-draft",
		siteId,
		hostedWorkspacePath: `${aliasId}/sites/${siteId}`,
		sourceRelativePath,
		canonicalCandidate: `${cleanOrigin}/sites/${encodeURIComponent(aliasId)}/${encodeURIComponent(siteId)}/`,
		publicationRequired: true,
		canonicalVerifiedLive: false
	};
}

module.exports = {
	siteDraftReport
};
