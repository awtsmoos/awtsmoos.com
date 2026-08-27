// B"H

/**
 * B"H — This doorway exports only the isolated reference kernel. Nothing here
 * registers a live action, changes a route, starts a socket, or replaces the
 * connected tunnel whose present breath remains untouched.
 */
module.exports = {
	canonical: require("./protocol/canonical.js"),
	identity: require("./protocol/identity.js"),
	lifecycle: require("./protocol/lifecycle.js"),
	createMemoryOperationStore: require("./transport/memoryOperationStore.js").createMemoryOperationStore,
	createOperationCoordinator: require("./transport/operationCoordinator.js").createOperationCoordinator,
	createQuarantineLedger: require("./transport/quarantineLedger.js").createQuarantineLedger,
	createKeyedSerial: require("./scheduler/keyedSerial.js").createKeyedSerial,
	createPriorityLanes: require("./scheduler/priorityLanes.js").createPriorityLanes,
	missionGraph: require("./mission/graph.js"),
	agentRuntime: require("./mission/agentRuntime.js"),
	createResourceLedger: require("./resources/resourceLedger.js").createResourceLedger
};
