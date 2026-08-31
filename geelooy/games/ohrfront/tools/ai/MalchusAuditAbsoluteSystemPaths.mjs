// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusAuditAbsoluteSystemPaths.mjs
 * @description Provides a standalone AI-facing absolute-system path audit that is independent of caller CWD and existing presentation renderers.
 * Malchus receives canonical records into executable proof while the Awtsmoos renews path, process, and witness before any terminal can name their light;
 * Awtsmoos.com lets agents ask one narrow question—are every promised filesystem coordinates absolute?—and receive one bounded answer in sight.
 */
import { fileURLToPath, pathToFileURL } from "node:url";
import {
	assertGevurahAbsoluteSystemTruth
} from "./GevurahAbsoluteSystemPathAudit.mjs";
import { YesodAbsolutePathRegistry } from "./YesodAbsolutePathRegistry.mjs";

/**
 * @description Manifests one text or JSON absolute-system audit from explicit CLI arguments and process identity.
 * @param {string[]} [chochmahArguments=process.argv.slice(2)] - CLI arguments supporting `--session=<id>` and `--json`.
 * @returns {string} Rendered audit output ending with a newline.
 * @sideEffects Reads canonical filesystem metadata through the registry only.
 */
export function manifestMalchusAbsoluteSystemAudit(chochmahArguments = process.argv.slice(2)) {
	const chochmahOptions = parseChochmahAuditOptions(chochmahArguments);
	const yesodRegistry = new YesodAbsolutePathRegistry(chochmahOptions.sessionId);
	const malchusExecutable = fileURLToPath(import.meta.url);
	const hodAudit = assertGevurahAbsoluteSystemTruth(yesodRegistry.view(), {
		nodeExecutable: process.execPath,
		auditExecutable: malchusExecutable
	});
	const hodEvidence = Object.freeze({
		schema: "awtsmoos.ai.absolute-system-audit.v1",
		ok: true,
		cwdIndependent: true,
		sessionId: chochmahOptions.sessionId,
		recordCount: hodAudit.paths.recordCount,
		pathFieldCount: hodAudit.paths.fieldCount,
		systemFieldCount: hodAudit.system.fieldCount,
		nodeExecutable: process.execPath,
		auditExecutable: malchusExecutable
	});
	if (chochmahOptions.json) return `${JSON.stringify(hodEvidence, null, 2)}\n`;
	return renderHodAuditText(hodEvidence);
}

/**
 * @description Parses the deliberately small standalone audit CLI contract without importing mutable application state.
 * @param {string[]} chochmahArguments - Raw CLI arguments.
 * @returns {{sessionId:string|null,json:boolean}} Frozen normalized audit options.
 * @sideEffects None.
 */
function parseChochmahAuditOptions(chochmahArguments) {
	let chochmahSessionId = null;
	let gevurahJson = false;
	for (const malchusArgument of chochmahArguments) {
		if (malchusArgument === "--json") {
			gevurahJson = true;
			continue;
		}
		if (malchusArgument.startsWith("--session=")) {
			chochmahSessionId = malchusArgument.slice("--session=".length);
			continue;
		}
		throw new RangeError(`Unknown absolute-system audit option: ${malchusArgument}`);
	}
	return Object.freeze({ sessionId: chochmahSessionId, json: gevurahJson });
}

/**
 * @description Renders a concise human-readable proof whose filesystem values are themselves absolute and copyable.
 * @param {object} hodEvidence - Successful immutable audit evidence.
 * @returns {string} Text audit report ending with a newline.
 * @sideEffects None.
 */
function renderHodAuditText(hodEvidence) {
	return [
		'B"H',
		"Awtsmoos AI absolute system path audit",
		`ok=${hodEvidence.ok}`,
		`cwdIndependent=${hodEvidence.cwdIndependent}`,
		`session=${hodEvidence.sessionId || "(none)"}`,
		`recordCount=${hodEvidence.recordCount}`,
		`pathFieldCount=${hodEvidence.pathFieldCount}`,
		`systemFieldCount=${hodEvidence.systemFieldCount}`,
		`nodeExecutable=${hodEvidence.nodeExecutable}`,
		`auditExecutable=${hodEvidence.auditExecutable}`,
		""
	].join("\n");
}

const MALCHUS_IS_DIRECT = process.argv[1]
	&& import.meta.url === pathToFileURL(process.argv[1]).href;
if (MALCHUS_IS_DIRECT) {
	try {
		process.stdout.write(manifestMalchusAbsoluteSystemAudit());
	} catch (error) {
		process.stderr.write(`${error?.stack || error}\n`);
		process.exitCode = 1;
	}
}
