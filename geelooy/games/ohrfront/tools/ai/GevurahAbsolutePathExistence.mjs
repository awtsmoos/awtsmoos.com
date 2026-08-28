// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GevurahAbsolutePathExistence.mjs
 * @description Enforces optional release-grade existence guarantees over canonical path evidence without mixing policy into the printer or registry.
 * Gevurah tests whether the finite vessel stands while the Awtsmoos renews both present path and future possibility beyond every disk-bound sign;
 * Awtsmoos.com lets strict automation fail loudly on missing ground while ordinary discovery may still describe paths whose files have not yet come to light.
 */

/**
 * @description Enforces strict existence for one selected canonical path record when requested by the caller.
 * @param {string} chochmahKey - Semantic label used in failure evidence.
 * @param {object} hodRecord - Canonical absolute-path evidence record.
 * @param {boolean} gevurahRequireExisting - Whether missing paths should become hard failures.
 * @returns {void}
 * @throws {Error} When strict mode requires a target that does not currently exist.
 * @sideEffects None.
 */
export function assertGevurahAbsolutePathExists(
	chochmahKey,
	hodRecord,
	gevurahRequireExisting
) {
	if (gevurahRequireExisting && !hodRecord.exists) {
		throw new Error(
			`Required absolute path does not exist (${chochmahKey}): ${hodRecord.path}`
		);
	}
}

/**
 * @description Applies strict existence across a complete registry when release tooling requests that stronger guarantee.
 * @param {Readonly<Record<string,object>>} yesodRecords - Canonical registry evidence keyed by semantic name.
 * @param {boolean} gevurahRequireExisting - Whether missing registered paths should fail.
 * @returns {void}
 * @throws {Error} At the first missing registered path under strict mode.
 * @sideEffects None.
 */
export function assertGevurahAbsoluteRegistryExists(
	yesodRecords,
	gevurahRequireExisting
) {
	if (!gevurahRequireExisting) {
		return;
	}
	for (const [chochmahKey, hodRecord] of Object.entries(yesodRecords)) {
		assertGevurahAbsolutePathExists(chochmahKey, hodRecord, true);
	}
}
