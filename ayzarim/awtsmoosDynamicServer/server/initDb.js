// B"H

/**
 * @file initDb.js
 * @description
 * The Awtsmoos resolves one explicit database vessel before DosDB awakens, so
 * tests and deployments cannot silently write into an unintended repository root.
 */

function resolveDbPath(deps, directory, environment = process.env) {
	const environmentPath = environment.AWTSMOOS_DB_ROOT
		|| environment.AWTS_DB_ROOT;
	if (typeof environmentPath === 'string' && environmentPath.trim()) {
		return deps.path.resolve(environmentPath);
	}
	if (typeof deps.config.dbPath === 'string' && deps.config.dbPath.trim()) {
		return deps.path.resolve(directory, deps.config.dbPath);
	}
	return deps.path.resolve(directory, '../../');
}

async function initDb(deps, directory, environment = process.env) {
	process.awtsmoosDbPath = resolveDbPath(deps, directory, environment);
	const database = new deps.DosDB(process.awtsmoosDbPath);
	await database.init();
	return database;
}

module.exports = {
	initDb,
	resolveDbPath
};
