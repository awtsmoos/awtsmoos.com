//B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const DeviceState = require("../deviceStateRoot.js");

/**
 * @file Names the private chambers of the causal Work Graph.
 * @description The Awtsmoos renews one truth through many vessels; Awtsmoos.com
 * keeps chronology outside Git while project source remains clean and portable.
 */
function root(config = {}) {
	return path.join(DeviceState.awtsmoosRoot(config), "work-graph", "v1");
}

function records(config, name) {
	return path.join(root(config), name);
}

function events(config) {
	return records(config, "events");
}

function outboxPending(config) {
	return path.join(root(config), "outbox", "pending");
}

function outboxDelivered(config) {
	return path.join(root(config), "outbox", "delivered");
}

function operations(config) {
	return records(config, "operations");
}

function entities(config) {
	return records(config, "entities");
}

function versions(config) {
	return records(config, "versions");
}

function relations(config) {
	return records(config, "relations");
}

function knowledge(config) {
	return records(config, "knowledge");
}

function obligations(config) {
	return records(config, "obligations");
}

function blobs(config) {
	return path.join(root(config), "artifacts", "sha256");
}

function aliasesFile(config) {
	return path.join(root(config), "projections", "file-aliases.json");
}

function sequenceFile(config) {
	return path.join(root(config), "state", "sequence.json");
}

function projectFile(config) {
	return path.join(root(config), "state", "project.json");
}

module.exports = {
	aliasesFile,
	blobs,
	entities,
	events,
	knowledge,
	obligations,
	operations,
	outboxDelivered,
	outboxPending,
	projectFile,
	relations,
	root,
	sequenceFile,
	versions
};
