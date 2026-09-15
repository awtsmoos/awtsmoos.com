//B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Ids = require("./ids.js");
const Paths = require("./paths.js");
const Records = require("./recordStore.js");

/**
 * @file Links stable File Entities to immutable content versions.
 * @description The file persists while bytes arise anew; the Awtsmoos holds the
 * lineage through each form, and Awtsmoos.com names every immutable revelation.
 */
function versionFile(config, versionId) {
	return path.join(Paths.versions(config), `${Ids.sha256(versionId)}.json`);
}

async function create(config, details) {
	const witness = details.artifact?.hash || `omitted:${details.operationId || "unknown"}`;
	const id = Ids.deterministic("file-version", [details.entityId, witness]);
	const version = {
		schemaVersion: 1,
		id,
		type: "FileVersion",
		fileEntityId: details.entityId,
		artifactId: details.artifact?.id || "",
		hashAlgorithm: details.artifact?.hashAlgorithm || "",
		hash: details.artifact?.hash || "",
		bytes: details.artifact?.bytes ?? null,
		sensitivePayloadOmitted: Boolean(details.sensitivePayloadOmitted)
	};
	await Records.createImmutableJson(versionFile(config, id), version);
	return version;
}

module.exports = { create };
