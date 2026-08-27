// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodAbsolutePathRegistry.mjs
 * @description Builds one immutable registry of canonical absolute filesystem roots for Ohrfront, AI evidence, procedural core, deployment, and this path tool itself.
 * Yesod binds root to branch while the Awtsmoos renews every location before a shell can name its place;
 * Awtsmoos.com lets each AI handoff speak one canonical filesystem language, explicit enough to copy, verify, automate, discover, and trace.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHodAbsolutePathRecord } from "./ChochmahCanonicalPath.mjs";

const YESOD_SESSION_PATTERN = /^[A-Za-z0-9._-]+$/;

export class YesodAbsolutePathRegistry {
	/**
	 * @description Creates canonical path evidence from this tool module's own location, never from caller working-directory assumptions.
	 * @param {string|null} [chochmahSessionId=null] - Explicit AI session directory id; null omits session-specific records.
	 * @sideEffects Reads filesystem metadata while canonicalizing path records.
	 */
	constructor(chochmahSessionId = null) {
		this.chochmahSessionId = validateChochmahSessionId(chochmahSessionId);
		this.yesodRecords = Object.freeze(this.createYesodRecords());
	}

	/**
	 * @description Returns every canonical absolute path record keyed by stable semantic name.
	 * @returns {Readonly<Record<string,{path:string,exists:boolean,kind:string}>>} Frozen registry view.
	 * @sideEffects None.
	 */
	view() {
		return this.yesodRecords;
	}

	/**
	 * @description Resolves one declared path key and fails loudly rather than returning an ambiguous empty value.
	 * @param {string} chochmahKey - Registry key such as `repositoryRoot`, `absolutePathPrinter`, or `remainingWork`.
	 * @returns {{path:string,exists:boolean,kind:string}} Frozen path evidence record.
	 * @throws {RangeError} When the requested key is unknown for the current registry shape.
	 * @sideEffects None.
	 */
	get(chochmahKey) {
		const hodRecord = this.yesodRecords[chochmahKey];
		if (!hodRecord) {
			throw new RangeError(`Unknown absolute path key: ${chochmahKey}`);
		}
		return hodRecord;
	}

	/**
	 * @description Constructs repository, project, tool, AI, evidence, and deployment path relationships as immutable canonical records.
	 * @returns {Record<string,{path:string,exists:boolean,kind:string}>} Newly allocated plain registry record.
	 * @sideEffects Reads filesystem metadata through record construction.
	 */
	createYesodRecords() {
		const malchusToolRoot = path.dirname(fileURLToPath(import.meta.url));
		const tiferesOhrfrontRoot = path.resolve(malchusToolRoot, "../..");
		const keterRepositoryRoot = path.resolve(tiferesOhrfrontRoot, "../../..");
		const netzachWorkRoot = path.resolve(keterRepositoryRoot, "..");
		const chochmahPaths = {
			workRoot: netzachWorkRoot,
			repositoryRoot: keterRepositoryRoot,
			ohrfrontRoot: tiferesOhrfrontRoot,
			proceduralCoreRoot: path.join(keterRepositoryRoot, "geelooy/libs/awtsmoos-procedural-core"),
			dynamicServerRoot: path.join(keterRepositoryRoot, "ayzarim/awtsmoosDynamicServer"),
			gitRoot: path.join(keterRepositoryRoot, ".git"),
			aiThoughtsRoot: path.join(netzachWorkRoot, ".ai-thoughts"),
			absolutePathToolRoot: malchusToolRoot,
			absolutePathPrinter: path.join(malchusToolRoot, "MalchusPrintAbsolutePaths.mjs"),
			absolutePathReadme: path.join(malchusToolRoot, "README.md")
		};
		if (this.chochmahSessionId) {
			const malchusSessionRoot = path.join(chochmahPaths.aiThoughtsRoot, this.chochmahSessionId);
			chochmahPaths.aiSessionRoot = malchusSessionRoot;
			chochmahPaths.evidenceRoot = path.join(malchusSessionRoot, "evidence");
			chochmahPaths.remainingWork = path.join(malchusSessionRoot, "REMAINING_WORK.md");
			chochmahPaths.releaseEvidence = path.join(malchusSessionRoot, "RELEASE_EVIDENCE.md");
		}
		return Object.fromEntries(
			Object.entries(chochmahPaths).map(([chochmahKey, malchusPath]) => [
				chochmahKey,
				createHodAbsolutePathRecord(malchusPath)
			])
		);
	}
}

/**
 * @description Validates an optional AI session id so path composition cannot escape the canonical `.ai-thoughts` root.
 * @param {string|null|undefined} chochmahSessionId - Candidate session directory id.
 * @returns {string|null} Validated session id or null when omitted.
 * @throws {TypeError} When a supplied session id contains separators or unsupported characters.
 * @sideEffects None.
 */
function validateChochmahSessionId(chochmahSessionId) {
	if (chochmahSessionId == null || chochmahSessionId === "") {
		return null;
	}
	const malchusSessionId = String(chochmahSessionId);
	if (!YESOD_SESSION_PATTERN.test(malchusSessionId)) {
		throw new TypeError(`Invalid AI session id: ${malchusSessionId}`);
	}
	return malchusSessionId;
}
