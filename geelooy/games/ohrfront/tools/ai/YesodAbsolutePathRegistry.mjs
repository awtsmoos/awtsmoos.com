// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodAbsolutePathRegistry.mjs
 * @description Exposes immutable canonical filesystem records enriched with semantic provenance while declaration, validation, rendering, and publication remain separate vessels.
 * Yesod binds semantic key to physical ground while the Awtsmoos renews root, scope, alias, and every filesystem relation before process or agent can call it place;
 * Awtsmoos.com lets lookup remain simple and cwd-independent while richer records explain ownership, role, URI identity, and equivalent physical names.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHodAbsolutePathRecord } from "./ChochmahCanonicalPath.mjs";
import {
	addChochmahAbsoluteSessionPaths,
	createChochmahAbsolutePathDeclarations
} from "./ChochmahAbsolutePathDeclarations.mjs";
import { validateGevurahAbsolutePathSession } from "./GevurahAbsolutePathSession.mjs";
import {
	createTiferesAbsolutePathProvenance,
	enrichTiferesAbsolutePathRecords
} from "./TiferesAbsolutePathProvenance.mjs";

export class YesodAbsolutePathRegistry {
	/**
	 * @description Creates canonical path evidence from this module's own location rather than caller working-directory assumptions.
	 * @param {string|null} [chochmahSessionId=null] - Explicit AI session directory id; null omits session-specific records.
	 * @sideEffects Reads filesystem metadata while canonicalizing declared paths and deriving immutable provenance.
	 */
	constructor(chochmahSessionId = null) {
		this.chochmahSessionId = validateGevurahAbsolutePathSession(chochmahSessionId);
		this.yesodRecords = Object.freeze(this.createYesodRecords());
	}

	/**
	 * @description Returns every declared enriched canonical absolute path record keyed by stable semantic name.
	 * @returns {Readonly<Record<string,object>>} Frozen registry view.
	 * @sideEffects None.
	 */
	view() {
		return this.yesodRecords;
	}

	/**
	 * @description Returns an immutable list of currently available semantic path keys.
	 * @returns {ReadonlyArray<string>} Frozen registry-key list.
	 * @sideEffects None.
	 */
	keys() {
		return Object.freeze(Object.keys(this.yesodRecords));
	}

	/**
	 * @description Resolves one declared path key and fails loudly rather than returning an ambiguous empty value.
	 * @param {string} chochmahKey - Registry key such as `repositoryRoot`, `aiSessionRoot`, or `remainingWork`.
	 * @returns {object} Frozen enriched canonical path evidence record.
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
	 * @description Canonicalizes an arbitrary target relative to one explicit registered root and adds the same provenance shape as declared paths.
	 * @param {string} chochmahTargetPath - Relative or absolute target requested by AI tooling.
	 * @param {string} [yesodBaseKey="repositoryRoot"] - Registered semantic base key used only for relative targets.
	 * @returns {object} Frozen enriched canonical target evidence.
	 * @sideEffects Reads filesystem metadata only.
	 */
	resolve(chochmahTargetPath, yesodBaseKey = "repositoryRoot") {
		const hodRecord = createHodAbsolutePathRecord(
			chochmahTargetPath,
			this.get(yesodBaseKey).canonicalPath
		);
		return createTiferesAbsolutePathProvenance("resolvedTarget", hodRecord, this.yesodRecords);
	}

	/**
	 * @description Discovers repository relations, adds optional session declarations, canonicalizes every record, then derives role and containment provenance.
	 * @returns {Record<string,object>} Newly allocated enriched canonical registry record.
	 * @sideEffects Reads filesystem metadata through canonical path-record construction.
	 */
	createYesodRecords() {
		const malchusToolRoot = path.dirname(fileURLToPath(import.meta.url));
		const tiferesOhrfrontRoot = path.resolve(malchusToolRoot, "../..");
		const keterRepositoryRoot = path.resolve(tiferesOhrfrontRoot, "../../..");
		const netzachWorkRoot = path.resolve(keterRepositoryRoot, "..");
		const chochmahPaths = createChochmahAbsolutePathDeclarations(
			malchusToolRoot,
			tiferesOhrfrontRoot,
			keterRepositoryRoot,
			netzachWorkRoot
		);
		if (this.chochmahSessionId) {
			addChochmahAbsoluteSessionPaths(chochmahPaths, this.chochmahSessionId);
		}
		const hodBaseRecords = Object.fromEntries(
			Object.entries(chochmahPaths).map(([chochmahKey, malchusPath]) => [
				chochmahKey,
				createHodAbsolutePathRecord(malchusPath)
			])
		);
		return enrichTiferesAbsolutePathRecords(hodBaseRecords);
	}
}
