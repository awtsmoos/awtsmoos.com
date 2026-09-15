//B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Ids = require("./ids.js");
const Lock = require("./recordLock.js");
const Paths = require("./paths.js");
const Project = require("./projectStore.js");
const Records = require("./recordStore.js");

/**
 * @file Keeps File Entity identity stable while workers and path aliases move around it.
 * @description A name may change while the vessel remains; the Awtsmoos knows the
 * identity beneath the alias, and Awtsmoos.com remembers both old path and new.
 */
function entityFile(config, entityId) {
	return path.join(Paths.entities(config), `${Ids.sha256(entityId)}.json`);
}

async function aliases(config) {
	return Records.readJson(Paths.aliasesFile(config), { schemaVersion: 1, paths: {} });
}

async function ensureFile(config, alias) {
	const file = Paths.aliasesFile(config);
	return Lock.run(file, async () => {
		const projection = await aliases(config);
		if (projection.paths[alias]) return projection.paths[alias];
		const project = await Project.ensure(config);
		const id = Ids.random("file");
		const entity = { schemaVersion: 1, id, type: "File", projectId: project.id };
		await Records.createImmutableJson(entityFile(config, id), entity);
		projection.paths[alias] = id;
		await Records.writeJson(file, projection);
		return id;
	});
}

async function lookup(config, alias) {
	const projection = await aliases(config);
	return projection.paths[alias] || "";
}

async function moveAlias(config, fromAlias, toAlias) {
	const file = Paths.aliasesFile(config);
	return Lock.run(file, async () => {
		const projection = await aliases(config);
		const id = projection.paths[fromAlias] || "";
		if (!id) return "";
		delete projection.paths[fromAlias];
		projection.paths[toAlias] = id;
		await Records.writeJson(file, projection);
		return id;
	});
}

async function removeAlias(config, alias) {
	const file = Paths.aliasesFile(config);
	return Lock.run(file, async () => {
		const projection = await aliases(config);
		const id = projection.paths[alias] || "";
		delete projection.paths[alias];
		await Records.writeJson(file, projection);
		return id;
	});
}

module.exports = { ensureFile, lookup, moveAlias, removeAlias };
