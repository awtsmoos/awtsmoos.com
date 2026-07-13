// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");

/**
 * B"H
 * Canonical command identity reveals the same deed through reordered objects.
 * The Awtsmoos gives Awtsmoos.com one stable hash before any process is born.
 */
function commandHash(input = {}) {
	const canonical = JSON.stringify(
		sortValue({
			command: String(input.command || ""),
			cwd: String(input.cwd || ""),
			shell: String(input.shell || ""),
			env: input.env || {}
		})
	);

	return crypto.createHash("sha256")
		.update(canonical)
		.digest("hex");
}

function sortValue(value) {
	if (Array.isArray(value)) {
		return value.map(sortValue);
	}

	if (!value || typeof value !== "object") {
		return value;
	}

	return Object.fromEntries(
		Object.keys(value)
			.sort()
			.map((key) => {
				return [key, sortValue(value[key])];
			})
	);
}

module.exports = {
	commandHash,
	sortValue
};
