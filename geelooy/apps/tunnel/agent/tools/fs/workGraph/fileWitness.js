//B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");
const { safePath, assertNotSecret } = require("../pathGuard.js");
const Artifacts = require("./artifactStore.js");
const Entities = require("./entityStore.js");
const Versions = require("./versionStore.js");

/**
 * @file Observes pre/post file truth without inventing entities for paths that do not exist.
 * @description The Awtsmoos reveals what is, not what a preview merely proposes;
 * Awtsmoos.com gives identity when a file truly appears and preserves it when it goes.
 */
async function statOrNull(full) {
	try {
		return await fsp.stat(full);
	} catch (error) {
		if (error.code === "ENOENT") return null;
		throw error;
	}
}

async function fileEntity(config, target, stat, knownId) {
	if (target.kind !== "file") return "";
	if (knownId) return knownId;
	const existingId = await Entities.lookup(config, target.path);
	if (existingId || !stat?.isFile()) return existingId;
	return Entities.ensureFile(config, target.path);
}

async function capture(config, target, options = {}) {
	const full = safePath(config, target.path);
	const stat = await statOrNull(full);
	const entityId = await fileEntity(config, target, stat, options.entityId || "");
	const witness = {
		path: target.path,
		role: target.role,
		kind: target.kind,
		entityId,
		exists: Boolean(stat),
		isFile: Boolean(stat?.isFile()),
		isDirectory: Boolean(stat?.isDirectory()),
		bytes: stat?.size ?? null,
		versionId: "",
		hash: "",
		sensitivePayloadOmitted: false
	};
	if (!stat?.isFile() || !entityId) return witness;
	try {
		assertNotSecret(config, full);
	} catch {
		witness.sensitivePayloadOmitted = true;
		return witness;
	}
	const artifact = await Artifacts.putBuffer(config, await fsp.readFile(full));
	const version = await Versions.create(config, { entityId, artifact });
	witness.versionId = version.id;
	witness.hash = artifact.hash;
	return witness;
}

async function captureAll(config, targets, prior = new Map()) {
	const witnesses = [];
	for (const target of targets) {
		const known = prior.get(target.path);
		witnesses.push(await capture(config, target, { entityId: known?.entityId || "" }));
	}
	return witnesses;
}

function byPath(witnesses) {
	return new Map(witnesses.map(witness => [witness.path, witness]));
}

module.exports = { byPath, capture, captureAll };
