//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module ResourceQuotePolicy
 * @description
 * Keeps Awtsmoos resource prices server-authored and intentionally generous.
 * Tunnel execution may cost zero compute Perutas because the user's authorized
 * machine supplies the work; hosted Awtsmoos resources remain transparently metered.
 */

const RESOURCE_SCHEDULE = Object.freeze({
	"browser.minute": resource(250, "Remote Browser minute", true),
	"compute.minute": resource(500, "Hosted compute minute", true),
	"relay.minute": resource(50, "Managed relay minute", true),
	"bandwidth.mib": resource(2, "Hosted bandwidth MiB", false),
	"storage.gib-day": resource(100, "Hosted storage GiB-day", false),
	"database.1000-ops": resource(100, "Database 1,000 operations", false)
});

function resource(perUnit, label, tunnelEligible) {
	return Object.freeze({ label, perUnit, tunnelEligible });
}
/**
 * Quotes one bounded resource request without accepting a browser-authored price.
 * @param {object} input Untrusted resource quote request.
 * @returns {Readonly<object>} Server-authored quote testimony.
 */
function quoteResource(input = {}) {
	const resourceId = String(input.resourceId || "").trim();
	const definition = RESOURCE_SCHEDULE[resourceId];
	if (!definition) {
		return Object.freeze({ ok: false, error: "unknown_resource" });
	}
	const units = boundedUnits(input.units);
	if (!units.ok) return units;
	const requestedMode = String(input.executionMode || "hosted").trim();
	const tunnel = requestedMode === "tunnel" && definition.tunnelEligible;
	const perUnit = tunnel ? 0 : definition.perUnit;
	return Object.freeze({
		ok: true,
		executionMode: tunnel ? "tunnel" : "hosted",
		label: definition.label,
		perUnit,
		resourceId,
		tunnelEligible: definition.tunnelEligible,
		units: units.value,
		totalPerutahs: perUnit * units.value
	});
}

function boundedUnits(value) {
	const units = Number(value);
	if (!Number.isInteger(units) || units < 1 || units > 1000000) {
		return Object.freeze({ ok: false, error: "invalid_resource_units" });
	}
	return Object.freeze({ ok: true, value: units });
}

module.exports = {
	RESOURCE_SCHEDULE,
	quoteResource
};
