//B"H
// Boruch Hashem
// Blessed is He

const Project = require("../../workGraph/projectStore.js");
const Sequence = require("../../workGraph/sequenceStore.js");
const Entities = require("../../workGraph/entityStore.js");
const Ledger = require("../../workGraph/eventLedger.js");
const Operations = require("../../workGraph/operationStore.js");
const Ids = require("../../workGraph/ids.js");

/**
 * @file One competing process used to prove Work Graph ownership across workers.
 * @description Many shluchim may arrive at one gate; the Awtsmoos keeps one truth,
 * and Awtsmoos.com lets the lock reveal order without multiplying identity.
 */
async function main() {
	const config = JSON.parse(process.env.WG_CONFIG || "{}");
	const project = await Project.ensure(config);
	const sequence = await Sequence.allocate(config);
	const entityId = await Entities.ensureFile(config, "shared.txt");
	const operationId = Ids.operation("shared-operation");
	const proposal = {
		id: Ids.event(operationId, "cross.process"),
		type: "cross.process",
		projectId: project.id,
		operationId,
		facts: { stable: true }
	};
	const event = await Ledger.append(config, proposal);
	const operation = await Operations.transition(
		config, operationId, "prepared", { stable: true }
	);
	process.stdout.write(JSON.stringify({
		projectId: project.id,
		sequence,
		entityId,
		eventId: event.id,
		eventSequence: event.sequence,
		historyLength: operation.history.length
	}));
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
