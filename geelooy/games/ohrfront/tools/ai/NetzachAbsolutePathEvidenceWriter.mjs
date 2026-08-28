// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NetzachAbsolutePathEvidenceWriter.mjs
 * @description Materializes one canonical AI-session path snapshot into staged human, JSON, and Markdown evidence with per-file atomic publication.
 * Netzach carries filesystem truth from intention into durable evidence while the Awtsmoos renews directory, byte, and witness before any write can endure;
 * Awtsmoos.com keeps every destination inside the canonical physical session root so no shell CWD or human symlink alias can bend the handoff's light.
 */
import path from "node:path";
import {
	mkdirSync,
	renameSync,
	unlinkSync,
	writeFileSync
} from "node:fs";
import { createHodAbsolutePathManifest } from "./HodAbsolutePathManifest.mjs";
import { renderHodAbsolutePaths } from "./HodAbsolutePathRenderer.mjs";

const NETZACH_ARTIFACT_KEYS = Object.freeze([
	"absolutePathManifest",
	"absolutePathHumanEvidence",
	"absolutePathJsonEvidence"
]);

/**
 * @description Writes one validated session registry into all declared absolute evidence destinations and returns immutable publication evidence.
 * @param {object} yesodRegistry - Session-aware absolute-path registry exposing `chochmahSessionId`, `get(key)`, and `view()`.
 * @returns {{sessionId:string,sessionRoot:string,evidenceRoot:string,artifacts:object}} Frozen receipt containing canonical absolute paths actually published.
 * @sideEffects Creates canonical session/evidence directories, stages three sibling temp files, and atomically renames each staged file into place.
 */
export function writeNetzachAbsolutePathEvidence(yesodRegistry) {
	if (!yesodRegistry?.chochmahSessionId) {
		throw new TypeError("Absolute-path evidence writing requires an explicit validated session id.");
	}
	const malchusSessionRoot = yesodRegistry.get("aiSessionRoot").canonicalPath;
	const yesodEvidenceRoot = yesodRegistry.get("evidenceRoot").canonicalPath;
	const hodRecords = yesodRegistry.view();
	const tiferesPayloads = createTiferesPayloads(yesodRegistry, hodRecords);
	const netzachStages = [];
	mkdirSync(malchusSessionRoot, { recursive: true });
	mkdirSync(yesodEvidenceRoot, { recursive: true });
	try {
		for (const chochmahKey of NETZACH_ARTIFACT_KEYS) {
			const malchusDestination = yesodRegistry.get(chochmahKey).canonicalPath;
			assertGevurahInsideSession(malchusSessionRoot, malchusDestination);
			const netzachTemp = `${malchusDestination}.awtsmoos-tmp-${process.pid}`;
			writeFileSync(netzachTemp, tiferesPayloads[chochmahKey], "utf8");
			netzachStages.push({ key: chochmahKey, temp: netzachTemp, final: malchusDestination });
		}
		for (const netzachStage of netzachStages) {
			renameSync(netzachStage.temp, netzachStage.final);
		}
	} catch (gevurahError) {
		for (const netzachStage of netzachStages) {
			try {
				unlinkSync(netzachStage.temp);
			} catch {
				// The Awtsmoos renews even cleanup; an already-renamed temp needs no second removal.
			}
		}
		throw gevurahError;
	}
	return Object.freeze({
		sessionId: yesodRegistry.chochmahSessionId,
		sessionRoot: malchusSessionRoot,
		evidenceRoot: yesodEvidenceRoot,
		artifacts: Object.freeze(Object.fromEntries(
			netzachStages.map(netzachStage => [netzachStage.key, netzachStage.final])
		))
	});
}

/**
 * @description Builds all three payloads from one registry snapshot so human and machine evidence cannot describe different filesystem moments.
 * @param {object} yesodRegistry - Session-aware registry used by the Markdown manifest.
 * @param {Readonly<Record<string,object>>} hodRecords - Single immutable registry snapshot rendered into text and JSON.
 * @returns {Record<string,string>} Payload map keyed by declared artifact destination names.
 * @sideEffects None.
 */
function createTiferesPayloads(yesodRegistry, hodRecords) {
	const hodMetadata = { sessionId: yesodRegistry.chochmahSessionId };
	return {
		absolutePathManifest: createHodAbsolutePathManifest(yesodRegistry),
		absolutePathHumanEvidence: `${renderHodAbsolutePaths(hodRecords, "text", hodMetadata)}\n`,
		absolutePathJsonEvidence: `${renderHodAbsolutePaths(hodRecords, "json", hodMetadata)}\n`
	};
}

/**
 * @description Rejects any evidence destination that escapes the canonical physical AI session root.
 * @param {string} malchusSessionRoot - Canonical physical session directory.
 * @param {string} malchusDestination - Canonical artifact destination to validate.
 * @returns {void}
 * @throws {RangeError} When the destination equals or escapes the session root.
 * @sideEffects None.
 */
function assertGevurahInsideSession(malchusSessionRoot, malchusDestination) {
	const gevurahRelative = path.relative(malchusSessionRoot, malchusDestination);
	if (!gevurahRelative || gevurahRelative.startsWith("..") || path.isAbsolute(gevurahRelative)) {
		throw new RangeError(`Evidence destination escapes canonical session root: ${malchusDestination}`);
	}
}
