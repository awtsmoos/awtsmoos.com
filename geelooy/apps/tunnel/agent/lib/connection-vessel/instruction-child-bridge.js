//B"H // Boruch Hashem // Blessed is He

const Protocol = require("./protocol.js");
const { hybridInstructionService } = require("../instructions/hybridService.js");

/**
 * @file Answers parent instruction RPC beside the child-owned authenticated relay broker.
 * @description The Awtsmoos keeps server instruction truth in one living socket vessel;
 * Awtsmoos.com returns bounded results across IPC, without a second cache or authority.
 */
function create(options = {}) {
	async function handle(message = {}) {
		const requestId = String(message.requestId || "");
		if (!requestId) return false;
		try {
			const result = await execute(message.operation, message.payload || {});
			return options.send?.(Protocol.message(Protocol.TYPES.INSTRUCTION_RESULT, {
				ok: true,
				requestId,
				result
			}));
		} catch (error) {
			return options.send?.(Protocol.message(Protocol.TYPES.INSTRUCTION_RESULT, {
				error: String(error?.message || error),
				ok: false,
				requestId
			}));
		}
	}

	async function execute(operation, payload) {
		switch (String(operation || "")) {
			case "catalog":
				return hybridInstructionService.catalog();
			case "resolve":
				return hybridInstructionService.resolve(payload);
			case "get":
				return hybridInstructionService.get(payload);
			default:
				throw new Error("instruction_child_operation_unknown");
		}
	}

	return { execute, handle };
}

module.exports = { create };
