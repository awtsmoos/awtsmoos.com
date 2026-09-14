//B"H
//Boruch Hashem
//Blessed be He

/**
 * Parses the deliberately small Merkava CLI grammar without dependencies.
 * Flags may be `--name value`, `--name=value`, or boolean `--name`; positional
 * values remain ordered so every command is deterministic and script-friendly.
 * @param {string[]} argv Raw command arguments after node/script names.
 * @returns {{command:string,flags:object,positionals:string[]}} Parsed request.
 */
function parseArguments(argv = []) {
	const input = [...argv];
	const command = String(input.shift() || "help");
	const flags = Object.create(null);
	const positionals = [];
	for (let index = 0; index < input.length; index += 1) {
		const token = input[index];
		if (!token.startsWith("--")) {
			positionals.push(token);
			continue;
		}
		const equals = token.indexOf("=");
		if (equals > 2) {
			flags[token.slice(2, equals)] = token.slice(equals + 1);
			continue;
		}
		const name = token.slice(2);
		const next = input[index + 1];
		if (next != null && !next.startsWith("--")) {
			flags[name] = next;
			index += 1;
		} else {
			flags[name] = true;
		}
	}
	return { command, flags, positionals };
}

/** Converts a comma-separated flag into unique trimmed values. */
function listFlag(value) {
	if (value == null || value === false) {
		return [];
	}
	return [...new Set(String(value).split(",").map(item => item.trim()).filter(Boolean))];
}

module.exports = {
	listFlag,
	parseArguments
};
