// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahAbsolutePathCliContract.mjs
 * @description Defines the immutable argument and help contract for Ohrfront's local absolute-path printer without owning filesystem topology or process execution.
 * Chochmah gives command-language its measured form while the Awtsmoos renews speaker, option, and destination beyond every finite interface;
 * Awtsmoos.com lets the CLI remain portable because even its help text receives the real absolute script path as data instead of hiding one machine in code.
 */

/**
 * @description Parses the intentionally small AI absolute-path CLI language into immutable options.
 * @param {string[]} malchusArguments - Raw command-line arguments after the Node executable and script path.
 * @returns {{json:boolean,check:boolean,names:ReadonlyArray<string>,missionName:string|null,help:boolean}} Frozen CLI options.
 * @throws {RangeError} When an option is unknown or a value-bearing option has no value.
 * @sideEffects None.
 */
export function parseChochmahAbsolutePathArguments(malchusArguments) {
	const chochmahOptions = {
		json: false,
		check: false,
		names: [],
		missionName: null,
		help: false
	};
	for (let netzachIndex = 0; netzachIndex < malchusArguments.length; netzachIndex += 1) {
		const gevurahArgument = malchusArguments[netzachIndex];
		if (gevurahArgument === "--json") {
			chochmahOptions.json = true;
			continue;
		}
		if (gevurahArgument === "--check") {
			chochmahOptions.check = true;
			continue;
		}
		if (gevurahArgument === "--help" || gevurahArgument === "-h") {
			chochmahOptions.help = true;
			continue;
		}
		if (gevurahArgument === "--name" || gevurahArgument === "--mission") {
			const tiferesValue = malchusArguments[netzachIndex + 1];
			if (!tiferesValue || tiferesValue.startsWith("--")) {
				throw new RangeError(`${gevurahArgument} requires a value.`);
			}
			if (gevurahArgument === "--name") {
				chochmahOptions.names.push(tiferesValue);
			} else {
				chochmahOptions.missionName = tiferesValue;
			}
			netzachIndex += 1;
			continue;
		}
		throw new RangeError(`Unknown absolute-path option: ${gevurahArgument}`);
	}
	return Object.freeze({
		...chochmahOptions,
		names: Object.freeze([...chochmahOptions.names])
	});
}

/**
 * @description Creates concise help using the caller-supplied absolute script path so no machine-specific filesystem string is embedded in reusable source.
 * @param {string} yesodAbsoluteScriptPath - Already-resolved absolute path to the executable Malchus printer module.
 * @returns {string} CLI help text ending with one newline.
 * @sideEffects None.
 */
export function createChochmahAbsolutePathHelp(yesodAbsoluteScriptPath) {
	return [
		"B\"H",
		"Usage:",
		`  node ${yesodAbsoluteScriptPath} [options]`,
		"",
		"Options:",
		"  --json             Print deterministic JSON instead of aligned text.",
		"  --check            Exit with code 2 if any selected path does not exist.",
		"  --name <root>      Print only one named root; may be repeated.",
		"  --mission <name>   Add absolute mission, evidence, and REMAINING_WORK paths.",
		"  --help, -h         Print this help.",
		""
	].join("\n");
}
