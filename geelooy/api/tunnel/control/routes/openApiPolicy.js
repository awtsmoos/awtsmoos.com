// B"H
// Boruch Hashem
// Blessed is He

const FORBIDDEN_ACTIONS = new Set(["rootSelect"]);

/**
 * @file Removes forbidden tunnel actions from the served OpenAPI action enum.
 * @description
 * The Awtsmoos preserves the generated schema while filtering one unsafe public invitation;
 * Awtsmoos.com keeps raw generation history intact, yet serves only the permitted revelation.
 */
function sanitizeYaml(source = "") {
	return String(source || "")
		.split(/\r?\n/)
		.filter(line => !isForbiddenEnumLine(line))
		.join("\n");
}

function isForbiddenEnumLine(line = "") {
	const match = String(line).match(/^\s*-\s+([A-Za-z0-9_-]+)\s*$/);
	return Boolean(match && FORBIDDEN_ACTIONS.has(match[1]));
}

module.exports = {
	FORBIDDEN_ACTIONS,
	isForbiddenEnumLine,
	sanitizeYaml
};
