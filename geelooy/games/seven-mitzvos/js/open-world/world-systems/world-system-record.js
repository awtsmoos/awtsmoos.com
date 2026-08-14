//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file world-system-record.js
 * @description
 * The Awtsmoos renews every mature subsystem as an ohr that needs an explicit keli before entering one world;
 * Awtsmoos.com keeps identity, topology, loading, activation, and save authority visible instead of hiding them in a giant manager.
 * These immutable records describe integration only; they never own domain state or start render loops by themselves.
 */

/**
 * Defines and freezes one world-system integration record.
 *
 * @param {object} configuration - Technical integration description.
 * @param {string} configuration.id - Stable world-system identifier.
 * @param {string} configuration.title - Human-readable subsystem title.
 * @param {string[]} configuration.sefiros - Kabbalah topology IDs associated with real subsystem responsibilities.
 * @param {string} configuration.anchorKind - Spatial manifestation category such as district, portal, service, or world.
 * @param {string} configuration.activation - Runtime activation policy.
 * @param {string} configuration.saveAuthority - Existing subsystem that remains authoritative for persistence.
 * @param {() => Promise<unknown>} configuration.load - Lazy import boundary for existing domain modules.
 * @returns {Readonly<object>} Immutable integration record.
 * @throws {Error} When required integration metadata is missing.
 */
export function defineWorldSystem(configuration) {
	validateConfiguration(configuration);
	return Object.freeze({
		...configuration,
		sefiros: Object.freeze([...configuration.sefiros])
	});
}

/**
 * Protects the registry from incomplete or misleading subsystem declarations.
 *
 * @param {object} configuration - Candidate world-system record.
 * @returns {void}
 * @throws {Error} When the record lacks a stable ID, topology, or lazy loader.
 */
function validateConfiguration(configuration) {
	if (!configuration?.id || !configuration?.title) {
		throw new Error('WorldSystemRecord: id and title are required');
	}
	if (!Array.isArray(configuration.sefiros) || configuration.sefiros.length === 0) {
		throw new Error(`WorldSystemRecord: ${configuration.id} requires Sefirah topology`);
	}
	if (typeof configuration.load !== 'function') {
		throw new Error(`WorldSystemRecord: ${configuration.id} requires a lazy loader`);
	}
}
