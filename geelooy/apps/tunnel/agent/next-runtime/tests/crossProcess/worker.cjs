// B"H
const Runtime = require("../../index.js");

const store = Runtime.createMemoryOperationStore({ maxOperations: 200 });
const quarantine = Runtime.createQuarantineLedger({ maxEntries: 200 });
const coordinator = Runtime.createOperationCoordinator({ store, quarantine });

process.on("message", message => {
	Promise.resolve().then(() => dispatch(message)).then(
		result => process.send?.({ callId: message.callId, ok: true, result }),
		error => process.send?.({
			callId: message.callId,
			ok: false,
			error: { code: error.code || "worker_error", message: error.message }
		})
	);
});

function dispatch(message = {}) {
	switch (message.action) {
		case "accept":
			return coordinator.accept(message.request);
		case "markSent":
			return coordinator.markSent(message.operationId);
		case "receive":
			return coordinator.receive(message.response);
		case "snapshot":
			return coordinator.snapshot();
		case "exit":
			setImmediate(() => process.exit(0));
			return { exiting: true };
		default:
			throw Object.assign(new Error("unknown_worker_action"), { code: "unknown_worker_action" });
	}
}
