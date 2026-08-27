// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusPrintAbsolutePaths.mjs
 * @description Prints Ohrfront and AI development roots as canonical absolute system paths in human, JSON, or single-key form.
 * Malchus receives hidden filesystem relation into visible speech while the Awtsmoos renews every place beyond the string that names its way;
 * Awtsmoos.com lets an AI copy one exact path, inspect all paths, or feed JSON into tooling without relative ambiguity entering the day.
 */
import { YesodAbsolutePathRegistry } from "./YesodAbsolutePathRegistry.mjs";

/**
 * @description Parses the deliberately small absolute-path CLI contract without mutating environment state.
 * @param {string[]} chochmahArguments - Command-line arguments following the executable and script path.
 * @returns {{json:boolean,key:string|null,sessionId:string|null}} Frozen normalized CLI options.
 * @throws {RangeError} When an unknown argument is supplied.
 * @sideEffects None.
 */
function parseChochmahArguments(chochmahArguments) {
	let gevurahJson = false;
	let hodKey = null;
	let tiferesSessionId = process.env.AWTSMOOS_AI_SESSION || null;
	for (const malchusArgument of chochmahArguments) {
		if (malchusArgument === "--json") {
			gevurahJson = true;
			continue;
		}
		if (malchusArgument.startsWith("--key=")) {
			hodKey = malchusArgument.slice("--key=".length);
			continue;
		}
		if (malchusArgument.startsWith("--session=")) {
			tiferesSessionId = malchusArgument.slice("--session=".length);
			continue;
		}
		throw new RangeError(`Unknown absolute-path argument: ${malchusArgument}`);
	}
	return Object.freeze({
		json: gevurahJson,
		key: hodKey,
		sessionId: tiferesSessionId
	});
}

/**
 * @description Renders the complete registry as readable path lines containing only canonical absolute path values plus existence evidence.
 * @param {Readonly<Record<string,{path:string,exists:boolean,kind:string}>>} yesodRecords - Frozen absolute-path registry view.
 * @returns {string} Human-readable multiline path manifest.
 * @sideEffects None.
 */
function renderHodText(yesodRecords) {
	const malchusLines = ["B\"H", "Awtsmoos AI absolute system paths"];
	for (const [chochmahKey, hodRecord] of Object.entries(yesodRecords)) {
		malchusLines.push(
			`${chochmahKey} = ${hodRecord.path} [${hodRecord.kind}; exists=${hodRecord.exists}]`
		);
	}
	return malchusLines.join("\n");
}

/**
 * @description Executes the printer contract and keeps single-key mode shell-clean by emitting only one canonical absolute path.
 * @param {string[]} chochmahArguments - CLI arguments after the script path.
 * @returns {void}
 * @sideEffects Writes exactly one result to stdout or one failure to stderr before setting process exit code.
 */
function manifestMalchusAbsolutePaths(chochmahArguments) {
	try {
		const chochmahOptions = parseChochmahArguments(chochmahArguments);
		const yesodRegistry = new YesodAbsolutePathRegistry(chochmahOptions.sessionId);
		if (chochmahOptions.key) {
			console.log(yesodRegistry.get(chochmahOptions.key).path);
			return;
		}
		if (chochmahOptions.json) {
			console.log(JSON.stringify({
				sessionId: chochmahOptions.sessionId,
				paths: yesodRegistry.view()
			}, null, 2));
			return;
		}
		console.log(renderHodText(yesodRegistry.view()));
	} catch (gevurahError) {
		console.error(gevurahError instanceof Error ? gevurahError.message : String(gevurahError));
		process.exitCode = 1;
	}
}

manifestMalchusAbsolutePaths(process.argv.slice(2));
