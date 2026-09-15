//B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Ids = require("./ids.js");
const Lock = require("./recordLock.js");
const Paths = require("./paths.js");
const Records = require("./recordStore.js");

/**
 * @file Persists one graph identity for the project across concurrent workers.
 * @description The folder is a location, not the soul of the thing; the Awtsmoos
 * gives the project identity beyond its name, and Awtsmoos.com remembers the flame.
 */
async function ensure(config) {
	const file = Paths.projectFile(config);
	return Lock.run(file, async () => {
		const existing = await Records.readJson(file);
		if (existing) return existing;
		const project = {
			schemaVersion: 1,
			id: Ids.random("project"),
			type: "Project",
			rootHash: Ids.sha256(path.resolve(config.root || process.cwd())),
			visibility: "private"
		};
		await Records.createImmutableJson(file, project);
		return Records.readJson(file);
	});
}

module.exports = { ensure };
