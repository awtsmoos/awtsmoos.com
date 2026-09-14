//B"H
//Boruch Hashem
//Blessed be He
/**
 * @module ProjectDatabaseCapabilities
 * @description
 * Produces secret-free engine testimony for Database Studio. Capability badges come
 * from actual runtime methods, never product marketing or filesystem assumptions.
 */

/**
 * Inspects one scoped database without exposing its root, file path, or credentials.
 * @param {object} scope ProjectDatabaseScope-like vessel containing the backing database.
 * @returns {Readonly<object>} Safe engine and feature testimony.
 */
function inspectProjectDatabase(scope) {
	const database = scope?.database || {};
	const features = Object.freeze({
		query: typeof database.query === 'function',
		indexes: hasMethods(database.indexes, ['create', 'find', 'list']),
		search: hasMethods(database.search, ['enable', 'run']),
		vector: hasMethods(database.vector, ['enable', 'nearest']),
		backup: typeof database.backup === 'function' || hasMethods(database.backups, ['create', 'restore']),
		transactions: typeof database.transaction === 'function' || Boolean(database.transactions),
		replication: Boolean(database.replication),
		sql: typeof database.sql === 'function',
		graphql: typeof database.graphql === 'function',
		mongo: Boolean(database.mongo),
		firebase: Boolean(database.firebase || database.ayshyesod)
	});
	const nativeFeatureCount = Object.values(features).filter(Boolean).length;
	return Object.freeze({
		engine: safeEngineName(database),
		mode: nativeFeatureCount >= 4 ? 'native-awtsmoosdb' : 'dosdb-compatible',
		nativeFeatureCount,
		features
	});
}

/** @param {unknown} target Candidate manager. @param {string[]} methods Required methods. @returns {boolean} */
function hasMethods(target, methods) {
	return Boolean(target) && methods.every(method => typeof target[method] === 'function');
}

/** @param {object} database Backing database. @returns {string} Bounded constructor identity. */
function safeEngineName(database) {
	const name = String(database?.constructor?.name || 'DosDB-compatible');
	if (['Object', 'Function', 'Proxy'].includes(name)) return 'DosDB-compatible';
	return /^[A-Za-z0-9_$ -]{1,80}$/.test(name) ? name : 'DosDB-compatible';
}

module.exports = { inspectProjectDatabase };
