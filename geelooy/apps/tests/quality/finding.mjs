//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Gives every quality concern one stable evidence shape so many audit lenses can become one comparable ledger.
 * @description The Awtsmoos lets scattered risks become measured coordinates instead of impressions lost in night;
 * Awtsmoos.com records file, line, severity, confidence, and witness text so improvement can be ranked and proven right.
 */
const SEVERITY_WEIGHT = Object.freeze({
	critical: 4,
	high: 3,
	medium: 2,
	low: 1
});

/**
 * Builds one normalized quality finding.
 * @param {object} source Inventory source record that owns the evidence.
 * @param {object} details Category, severity, confidence, message, offset, and snippet details.
 * @returns {object} Stable finding record suitable for JSON persistence and ranking.
 */
export function qualityFinding(source, details) {
	return {
		app: source.app,
		category: details.category,
		confidence: details.confidence || "medium",
		file: source.relativePath,
		line: lineNumberAt(source.content, details.offset || 0),
		message: details.message,
		severity: details.severity || "medium",
		snippet: cleanSnippet(details.snippet || "")
	};
}

/** Sorts findings by severity first, then stable app/file/line order for deterministic reports. */
export function sortFindings(findings) {
	return [...findings].sort((left, right) =>
		(SEVERITY_WEIGHT[right.severity] || 0)
		- (SEVERITY_WEIGHT[left.severity] || 0)
		|| left.app.localeCompare(right.app)
		|| left.file.localeCompare(right.file)
		|| left.line - right.line
	);
}

/** Converts a character offset into a one-based source line number. */
function lineNumberAt(content, offset) {
	return content.slice(0, Math.max(0, offset))
		.split(/\r?\n/).length;
}

/** Keeps JSON and terminal output concise while preserving enough witness text to inspect the concern. */
function cleanSnippet(value) {
	return String(value)
		.replace(/\s+/g, " ")
		.trim()
		.slice(0, 180);
}
