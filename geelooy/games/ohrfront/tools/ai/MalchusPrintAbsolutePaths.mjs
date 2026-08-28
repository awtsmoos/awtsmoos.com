// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusPrintAbsolutePaths.mjs
 * @description Manifests canonical AI filesystem truth as a pure importable API while a focused runtime boundary owns direct terminal side effects.
 * Malchus reveals the finite system path while the Awtsmoos renews root, shell, process, and every place before a byte can appear;
 * Awtsmoos.com lets imported code remain silent while direct invocation reveals repository, evidence, tool, or arbitrary target truth without relative prayer.
 */
import { pathToFileURL } from "node:url";
import { parseChochmahAbsolutePathOptions } from "./ChochmahAbsolutePathOptions.mjs";
import {
	assertGevurahAbsolutePathExists,
	assertGevurahAbsoluteRegistryExists
} from "./GevurahAbsolutePathExistence.mjs";
import {
	renderHodAbsolutePaths,
	renderHodSelectedPath
} from "./HodAbsolutePathRenderer.mjs";
import { runMalchusAbsolutePathRuntime } from "./MalchusAbsolutePathRuntime.mjs";
import { YesodAbsolutePathRegistry } from "./YesodAbsolutePathRegistry.mjs";

/**
 * @description Resolves explicit absolute-path arguments into one canonical representation without writing stdout or mutating process state.
 * @param {string[]} [chochmahArguments=process.argv.slice(2)] - CLI-shaped arguments after executable and script path.
 * @param {NodeJS.ProcessEnv|object} [yesodEnvironment=process.env] - Environment carrying optional AI session identity.
 * @returns {string} Rendered canonical output.
 * @throws {Error} When option, registry, strict-existence, or rendering validation fails.
 * @sideEffects Reads filesystem metadata through the registry but never writes terminal streams or files.
 */
export function manifestMalchusAbsolutePaths(
	chochmahArguments = process.argv.slice(2),
	yesodEnvironment = process.env
) {
	const chochmahOptions = parseChochmahAbsolutePathOptions(
		chochmahArguments,
		yesodEnvironment
	);
	const yesodRegistry = new YesodAbsolutePathRegistry(chochmahOptions.sessionId);
	if (chochmahOptions.listKeys) {
		return manifestMalchusKeyList(yesodRegistry, chochmahOptions);
	}
	if (chochmahOptions.key) {
		return manifestMalchusSelected(
			chochmahOptions.key,
			yesodRegistry.get(chochmahOptions.key),
			chochmahOptions
		);
	}
	if (chochmahOptions.resolvePath) {
		const hodRecord = yesodRegistry.resolve(
			chochmahOptions.resolvePath,
			chochmahOptions.fromKey
		);
		return manifestMalchusSelected("resolvedTarget", hodRecord, chochmahOptions);
	}
	assertGevurahAbsoluteRegistryExists(
		yesodRegistry.view(),
		chochmahOptions.requireExisting
	);
	return renderHodAbsolutePaths(
		yesodRegistry.view(),
		chochmahOptions.format,
		{ sessionId: yesodRegistry.chochmahSessionId }
	);
}

/**
 * @description Renders one selected path after applying optional release-grade existence requirements.
 * @param {string} chochmahKey - Semantic record key or synthetic target label.
 * @param {object} hodRecord - Canonical absolute-path evidence.
 * @param {object} chochmahOptions - Parsed immutable CLI intention.
 * @returns {string} Selected path output in shell-clean or explicitly requested rich form.
 * @sideEffects None.
 */
function manifestMalchusSelected(chochmahKey, hodRecord, chochmahOptions) {
	assertGevurahAbsolutePathExists(
		chochmahKey,
		hodRecord,
		chochmahOptions.requireExisting
	);
	return renderHodSelectedPath(
		chochmahKey,
		hodRecord,
		chochmahOptions.format,
		chochmahOptions.formatExplicit
	);
}

/**
 * @description Renders semantic key discovery as newline text or machine-readable JSON without inventing relative path data.
 * @param {YesodAbsolutePathRegistry} yesodRegistry - Active canonical registry.
 * @param {object} chochmahOptions - Parsed immutable CLI intention.
 * @returns {string} Key discovery output.
 * @sideEffects None.
 */
function manifestMalchusKeyList(yesodRegistry, chochmahOptions) {
	const netzachKeys = yesodRegistry.keys();
	if (chochmahOptions.format === "json") {
		return JSON.stringify({ keys: netzachKeys }, null, 2);
	}
	return netzachKeys.join("\n");
}

/**
 * @description Reports whether this module is the directly invoked Node entrypoint rather than an imported API dependency.
 * @returns {boolean} True only when Node is executing this exact canonical script entry.
 * @sideEffects None.
 */
function isMalchusDirectExecution() {
	if (!process.argv[1]) {
		return false;
	}
	return pathToFileURL(process.argv[1]).href === import.meta.url;
}

if (isMalchusDirectExecution()) {
	runMalchusAbsolutePathRuntime(() => manifestMalchusAbsolutePaths());
}
