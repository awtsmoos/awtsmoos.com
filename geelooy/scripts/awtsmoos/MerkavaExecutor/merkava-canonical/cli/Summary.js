//B"H
//Boruch Hashem
//Blessed be He

const { sectionName } = require("../Format.js");

/** Produces compact JSON-safe verification output for terminals and automation. */
function verificationSummary(report) {
	return {
		errors: report.errors || [],
		manifest: report.manifest || null,
		ok: Boolean(report.ok),
		sections: report.container
			? report.container.sections.map(section => ({
				bytes: section.length,
				name: sectionName(section.type),
				type: section.type
			}))
			: [],
		warnings: report.warnings || []
	};
}

/**
 * Converts arbitrary runtime values to bounded JSON-safe diagnostics. Circular
 * host/browser objects are replaced with markers instead of crashing the CLI.
 */
function safeSummary(value, depth = 0, seen = new WeakSet()) {
	if (value == null || typeof value !== "object") {
		return value;
	}
	if (depth >= 4) {
		return "[depth-limit]";
	}
	if (seen.has(value)) {
		return "[circular]";
	}
	seen.add(value);
	if (Array.isArray(value)) {
		return value.slice(0, 50).map(item => safeSummary(item, depth + 1, seen));
	}
	if (ArrayBuffer.isView(value)) {
		return `[${value.constructor.name}:${value.byteLength}]`;
	}
	const output = Object.create(null);
	for (const key of Object.keys(value).slice(0, 60)) {
		if (typeof value[key] === "function") {
			continue;
		}
		output[key] = safeSummary(value[key], depth + 1, seen);
	}
	return output;
}

module.exports = {
	safeSummary,
	verificationSummary
};
