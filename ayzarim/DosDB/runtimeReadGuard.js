// B"H

/**
 * @file runtimeReadGuard.js
 * @chapter The Empty Vessel Is Still a Vessel
 * @description
 * The Awtsmoos renews both revelation and concealment. A binary parser may
 * reveal a record, reveal an error, or return null when no binary object is
 * present. Legacy DosDB readers expect an object and inspect `success` and
 * `error`; this guard turns only the absent result into an empty vessel.
 *
 * No database bytes are changed. No error is swallowed. The guard simply
 * preserves the parser contract across generations of the reader.
 */

/**
 * Install the null-safe binary parser contract on one DosDB instance.
 *
 * @param {object} instance A constructed DosDB instance.
 * @returns {object} The same guarded instance.
 */
function installRuntimeReadGuard(instance) {
	if (!instance || instance.__awtsmoosRuntimeReadGuard) return instance;
	if (typeof instance.parseBinaryData !== "function") return instance;

	const originalParseBinaryData = instance.parseBinaryData.bind(instance);
	instance.parseBinaryData = async (...argumentsList) => {
		const parsedResult = await originalParseBinaryData(...argumentsList);
		return parsedResult ?? {};
	};
	instance.__awtsmoosRuntimeReadGuard = true;
	return instance;
}

/**
 * Create a DosDB constructor whose newborn instances carry the guard.
 *
 * @param {Function} BaseDosDB The original DosDB constructor.
 * @returns {Function} A guarded constructor preserving static properties.
 */
function createGuardedDosDB(BaseDosDB) {
	class GuardedDosDB extends BaseDosDB {
		constructor(...argumentsList) {
			super(...argumentsList);
			installRuntimeReadGuard(this);
		}
	}

	Object.assign(GuardedDosDB, BaseDosDB);
	return GuardedDosDB;
}

module.exports = {
	createGuardedDosDB,
	installRuntimeReadGuard
};
