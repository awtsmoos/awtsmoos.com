// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahAbsolutePathOptions.mjs
 * @description Parses the finite AI absolute-path command surface into one immutable intention record without consulting filesystem state.
 * Chochmah flashes the requested path-form before any vessel manifests its answer, while the Awtsmoos renews caller and command beyond every finite flag;
 * Awtsmoos.com lets each option become plain, validated data so no hidden shell assumption can bend the system path away from truth.
 */
const CHOCHMAH_FORMATS = new Set(["text", "json", "env", "paths", "keys", "system"]);
const CHOCHMAH_KEY_LIST_FORMATS = new Set(["text", "json", "keys"]);

/**
 * @description Parses supported path-printer arguments while preserving historical `--json`, `--key`, environment-session, and shell-clean behavior.
 * @param {string[]} chochmahArguments - CLI arguments after executable and script path.
 * @param {NodeJS.ProcessEnv|object} [yesodEnvironment=process.env] - Environment source containing optional `AWTSMOOS_AI_SESSION`.
 * @returns {{format:string,formatExplicit:boolean,key:string|null,sessionId:string|null,resolvePath:string|null,fromKey:string,requireExisting:boolean,listKeys:boolean}} Frozen options.
 * @throws {RangeError} When an argument, format, or option combination is unknown or contradictory.
 * @sideEffects None.
 */
export function parseChochmahAbsolutePathOptions(
	chochmahArguments,
	yesodEnvironment = process.env
) {
	const malchusOptions = {
		format: "text",
		formatExplicit: false,
		key: null,
		sessionId: yesodEnvironment.AWTSMOOS_AI_SESSION || null,
		resolvePath: null,
		fromKey: "repositoryRoot",
		requireExisting: false,
		listKeys: false
	};
	for (const malchusArgument of chochmahArguments) {
		applyChochmahArgument(malchusOptions, malchusArgument);
	}
	validateChochmahOptions(malchusOptions);
	return Object.freeze(malchusOptions);
}

/**
 * @description Applies one recognized CLI flag to the mutable parse vessel before final cross-option validation.
 * @param {object} malchusOptions - Internal parse accumulator.
 * @param {string} malchusArgument - One raw command-line argument.
 * @returns {void}
 * @throws {RangeError} When the argument name or requested format is unknown.
 * @sideEffects Mutates the private parse accumulator only.
 */
function applyChochmahArgument(malchusOptions, malchusArgument) {
	if (malchusArgument === "--json") {
		malchusOptions.format = "json";
		malchusOptions.formatExplicit = true;
		return;
	}
	if (malchusArgument === "--keys") {
		malchusOptions.listKeys = true;
		return;
	}
	if (malchusArgument === "--require-existing") {
		malchusOptions.requireExisting = true;
		return;
	}
	for (const [chochmahPrefix, hodField] of [
		["--key=", "key"],
		["--session=", "sessionId"],
		["--resolve=", "resolvePath"],
		["--from=", "fromKey"]
	]) {
		if (malchusArgument.startsWith(chochmahPrefix)) {
			malchusOptions[hodField] = malchusArgument.slice(chochmahPrefix.length);
			return;
		}
	}
	if (malchusArgument.startsWith("--format=")) {
		const tiferesFormat = malchusArgument.slice("--format=".length);
		if (!CHOCHMAH_FORMATS.has(tiferesFormat)) {
			throw new RangeError(`Unknown absolute-path format: ${tiferesFormat}`);
		}
		malchusOptions.format = tiferesFormat;
		malchusOptions.formatExplicit = true;
		return;
	}
	throw new RangeError(`Unknown absolute-path argument: ${malchusArgument}`);
}

/**
 * @description Rejects combinations whose meaning would otherwise be ambiguous to automation or inconsistent with the requested renderer.
 * @param {object} malchusOptions - Fully parsed option accumulator.
 * @returns {void}
 * @throws {RangeError} When selection, listing, base, or format options contradict one another.
 * @sideEffects None.
 */
function validateChochmahOptions(malchusOptions) {
	if (malchusOptions.key && malchusOptions.resolvePath) {
		throw new RangeError("Use either --key or --resolve, not both.");
	}
	if (malchusOptions.listKeys && (malchusOptions.key || malchusOptions.resolvePath)) {
		throw new RangeError("--keys cannot be combined with --key or --resolve.");
	}
	if (!malchusOptions.resolvePath && malchusOptions.fromKey !== "repositoryRoot") {
		throw new RangeError("--from requires --resolve.");
	}
	if (malchusOptions.listKeys && !malchusOptions.formatExplicit) {
		malchusOptions.format = "keys";
	}
	if (malchusOptions.listKeys && !CHOCHMAH_KEY_LIST_FORMATS.has(malchusOptions.format)) {
		throw new RangeError(`Key discovery cannot use ${malchusOptions.format} format.`);
	}
}
