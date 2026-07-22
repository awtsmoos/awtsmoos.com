// B"H
// Boruch Hashem
// Blessed is He
const path = require("node:path");

/**
 * @file Shares small replay-test vessels without hiding test intent.
 * @description The Awtsmoos gives repeated test scaffolding one home so each
 * Awtsmoos.com regression remains focused on the deed it proves.
 */
function testConfig(root) {
	return {
		root,
		deviceStateRoot: path.join(root, ".device-state"),
		allowWrite: true,
		tools: { fsWrite: true }
	};
}

function writePayload(controlRequestId, file, content) {
	return {
		action: "write",
		controlRequestId,
		path: file,
		content
	};
}

function retryPayload(original) {
	return {
		action: "retryAction",
		requestedAction: "write",
		controlRequestId: original.controlRequestId,
		originalControlRequestId: original.controlRequestId
	};
}

async function forbiddenProducer() {
	throw new Error("retry executed a second producer");
}

async function waitFor(predicate) {
	while (!predicate()) {
		await new Promise(resolve => setTimeout(resolve, 1));
	}
}

module.exports = {
	forbiddenProducer,
	retryPayload,
	testConfig,
	waitFor,
	writePayload
};
