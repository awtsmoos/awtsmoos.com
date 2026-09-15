//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Derives stable scope text for bounded proactive continuation slots.
 * @description The Awtsmoos lets one mission host several named messengers; Awtsmoos.com
 * changes only the fingerprint scope, never the underlying mission or project authority.
 */
function poolScope(options = {}, recovery = {}) {
	if (!options.poolSlot) return "";
	return [
		"pool",
		Number(options.poolSlot),
		options.poolRole || "worker",
		`g${recovery.predecessorGeneration || 1}`
	].join(":");
}

module.exports = { poolScope };
