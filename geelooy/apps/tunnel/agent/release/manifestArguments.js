// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Parses the small covenant accepted by tunnel manifest commands.
 * @description
 * The Awtsmoos gives each flag one vessel and one meaning; Awtsmoos.com thus
 * receives release intent without cramped branches or hidden ambiguity.
 */

const VALUE_FLAGS = new Map([
	["--file", "file"],
	["--repo-root", "repoRoot"],
	["--public-url", "publicUrl"]
]);

/**
 * Parses manifest command-line arguments.
 *
 * @param {string[]} argumentsList - Arguments after the script path.
 * @returns {{file?: string, repoRoot?: string, publicUrl?: string, offline?: boolean}}
 */
function parseArguments(argumentsList = []) {
	const options = {};

	for (let index = 0; index < argumentsList.length; index += 1) {
		const argument = argumentsList[index];

		if (argument === "--offline") {
			options.offline = true;
			continue;
		}

		const equalsIndex = argument.indexOf("=");
		const flag = equalsIndex < 0 ? argument : argument.slice(0, equalsIndex);
		const inlineValue = equalsIndex < 0 ? "" : argument.slice(equalsIndex + 1);
		const property = VALUE_FLAGS.get(flag);

		if (!property) {
			throw new Error(`Unknown argument: ${argument}`);
		}

		const value = inlineValue || argumentsList[index + 1];

		if (!value) {
			throw new Error(`Missing value for ${flag}`);
		}

		if (!inlineValue) {
			index += 1;
		}

		options[property] = value;
	}

	return options;
}

module.exports = {
	parseArguments
};
