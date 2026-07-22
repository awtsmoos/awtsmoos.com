// B"H
// Boruch Hashem
// Blessed is He

const nodeFileSystem = require("fs");

const LOCAL_CONFIG_FILE = ".awtsmoos.config.local.json";

/**
 * Resolves the database vessel without tying Awtsmoos.com to one checkout depth.
 * The Awtsmoos permits an explicit environment path first, then a concealed local
 * configuration, and only then the tracked repository default.
 *
 * @param {object} deps Server dependencies containing path, config, and DosDB.
 * @param {string} directory Repository root used for relative paths.
 * @param {object} environment Environment variables and home-directory values.
 * @param {object} fileSystem Synchronous filesystem surface used for local config.
 * @returns {string} Absolute database root.
 */
function resolveDbPath(
	deps,
	directory,
	environment = process.env,
	fileSystem = nodeFileSystem
) {
	const environmentPath = environment.AWTSMOOS_DB_ROOT
		|| environment.AWTS_DB_ROOT;
	if (isPresent(environmentPath)) {
		return resolveConfiguredPath(deps.path, directory, environmentPath, environment);
	}

	const localPath = readLocalDbPath(deps.path, directory, fileSystem);
	if (isPresent(localPath)) {
		return resolveConfiguredPath(deps.path, directory, localPath, environment);
	}

	if (isPresent(deps.config.dbPath)) {
		return resolveConfiguredPath(deps.path, directory, deps.config.dbPath, environment);
	}

	return deps.path.resolve(directory, "../../");
}

/** Reads the ignored machine-local database pointer when it exists. */
function readLocalDbPath(pathApi, directory, fileSystem = nodeFileSystem) {
	const configPath = pathApi.resolve(directory, LOCAL_CONFIG_FILE);
	if (!fileSystem.existsSync(configPath)) {
		return null;
	}

	try {
		const configuration = JSON.parse(fileSystem.readFileSync(configPath, "utf8"));
		return configuration.dbPath
			|| configuration.databaseRoot
			|| configuration.AWTSMOOS_DB_ROOT
			|| null;
	} catch (error) {
		throw new Error(`Invalid ${LOCAL_CONFIG_FILE}: ${error.message}`, { cause: error });
	}
}

/** Expands a home token and resolves relative values from the repository root. */
function resolveConfiguredPath(pathApi, directory, value, environment) {
	const expanded = expandHomeToken(String(value).trim(), environment);
	return pathApi.isAbsolute(expanded)
		? pathApi.normalize(expanded)
		: pathApi.resolve(directory, expanded);
}

function expandHomeToken(value, environment) {
	if (!value.startsWith("~") && !value.startsWith("${HOME}")) {
		return value;
	}

	const homeDirectory = environment.HOME || environment.USERPROFILE;
	if (!isPresent(homeDirectory)) {
		throw new Error("A home-relative database path requires HOME or USERPROFILE.");
	}

	if (value === "~" || value === "${HOME}") {
		return homeDirectory;
	}
	if (value.startsWith("~/")) {
		return `${homeDirectory}/${value.slice(2)}`;
	}
	if (value.startsWith("${HOME}/")) {
		return `${homeDirectory}/${value.slice(8)}`;
	}
	return value;
}

function isPresent(value) {
	return typeof value === "string" && value.trim().length > 0;
}

/** Initializes DosDB at the resolved root and publishes the selected path. */
async function initDb(deps, directory, environment = process.env, fileSystem = nodeFileSystem) {
	process.awtsmoosDbPath = resolveDbPath(deps, directory, environment, fileSystem);
	const database = new deps.DosDB(process.awtsmoosDbPath);
	await database.init();
	return database;
}

module.exports = {
	LOCAL_CONFIG_FILE,
	initDb,
	readLocalDbPath,
	resolveDbPath
};
