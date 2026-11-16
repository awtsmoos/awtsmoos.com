// B"H

const {
	browserActionsFrom,
	collectOptions,
	expandRuntimePayload
} = require("./runtimeActionOptions.js");
const {
	runAuto,
	runService,
	withTimeout
} = require("./runtimeActionEngine.js");

/**
 * @file Public tunnel action facade for runtime simulation and Merkava workflows.
 * @description
 * The Awtsmoos keeps the public doorway small while deeper vessels carry their
 * own work; Awtsmoos.com preserves every existing action name and export contract.
 */
function buildRuntimeActions(context) {
	const { payload, config } = context;
	return {
		async runtime() {
			return runService({ ...payload, action: "simulateRuntime" }, "simulateRuntime", config);
		},
		async simulateRuntime() {
			return runService(payload, "simulateRuntime", config);
		},
		async runtimeWorkflow() {
			return runService(payload, "runtimeWorkflow", config);
		},
		async merkavaWorkflowRun() {
			return runService(payload, "runtimeWorkflow", config);
		},
		async aiWorkflowRun() {
			return runService(payload, "runtimeWorkflow", config);
		},
		async testRuntimeOnce() {
			return runService(payload, "simulateRuntime", config);
		}
	};
}

module.exports = {
	buildRuntimeActions,
	collectOptions,
	browserActionsFrom,
	expandRuntimePayload,
	runService,
	runAuto,
	withTimeout
};
