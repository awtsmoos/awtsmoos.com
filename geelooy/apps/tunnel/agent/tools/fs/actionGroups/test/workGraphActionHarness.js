//B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { loadConfig } = require("../../../../lib/config.js");
const Actions = require("../../actions.js");
const Entities = require("../../workGraph/entityStore.js");
const Ledger = require("../../workGraph/eventLedger.js");
const Harness = require("./workGraphHarness.js");

/**
 * @file Drives real public filesystem actions inside a sealed provenance sandbox.
 * @description The Awtsmoos proves each public deed through its actual action vessel;
 * Awtsmoos.com can test the executing child separately from the parent's async receipt.
 */
function create() {
	const sandbox = Harness.createSandbox();
	return {
		...sandbox,
		config: { ...loadConfig(), ...sandbox.config },
		requestNumber: 0
	};
}

function payload(context, action, values = {}) {
	context.requestNumber += 1;
	return {
		...values,
		action,
		controlRequestId: `matrix-${action}-${context.requestNumber}`,
		normalized: true,
		sync: true,
		noAutoAsync: true
	};
}

async function run(context, action, values = {}) {
	const previous = process.env.AWTSMOOS_ASYNC_CHILD;
	process.env.AWTSMOOS_ASYNC_CHILD = "1";
	try {
		return await Actions.runPlain(context.config, payload(context, action, values), null);
	} finally {
		if (previous === undefined) delete process.env.AWTSMOOS_ASYNC_CHILD;
		else process.env.AWTSMOOS_ASYNC_CHILD = previous;
	}
}

async function runParent(context, action, values = {}) {
	return Actions.runPlain(context.config, payload(context, action, values), null);
}

async function events(context, type = "") {
	const all = await Ledger.list(context.config);
	return type ? all.filter(event => event.type === type) : all;
}

function sha256(context, file) {
	return crypto.createHash("sha256")
		.update(fs.readFileSync(path.join(context.projectRoot, file)))
		.digest("hex");
}

function read(context, file) {
	return fs.readFileSync(path.join(context.projectRoot, file), "utf8");
}

function cleanup(context) {
	Harness.cleanupSandbox(context);
}

module.exports = {
	cleanup,
	create,
	entity: Entities.lookup,
	events,
	read,
	run,
	runParent,
	sha256
};
