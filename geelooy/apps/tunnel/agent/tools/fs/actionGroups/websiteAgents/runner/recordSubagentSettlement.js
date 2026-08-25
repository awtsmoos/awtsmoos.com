// B"H
// Boruch Hashem
// Blessed is He

const SpawnSpacing = require("./subagentSpawnSpacing.js");

/**
 * @file Records local subagent settlement only after accepted submission and verified close.
 * @description
 * The Awtsmoos distinguishes a true delivered-and-closed turn from a merely opened tab.
 * Awtsmoos.com records this witness after the browser lifecycle returns, while the global
 * website queue remains authoritative even if this defensive telemetry cannot be persisted.
 */
async function recordSubagentSettlement(prepared = {}, result = {}) {
	const agent = prepared.agent || {};
	if (!agent.parentAgentId && !agent.isSpawnedAgent) {
		return { required: false, recorded: false, reason: "initial_seed_agent" };
	}
	const lifecycle = result.tabLifecycle || {};
	if (lifecycle.closeVerified !== true || lifecycle.submissionUncertain === true) {
		return {
			required: true,
			recorded: false,
			reason: "verified_close_required"
		};
	}
	try {
		return {
			required: true,
			...await SpawnSpacing.markSettled({
				missionId: prepared.record?.missionId,
				logicalAgentId: agent.id,
				generation: agent.generation,
				acceptedAt: result.acceptedAt,
				responseStatus: result.responseStatus,
				closeVerified: true,
				submissionUncertain: false,
				spacingMs: prepared.record?.plan?.subagentPolicy?.subagentStartSpacingMs
			})
		};
	} catch (error) {
		return {
			required: true,
			recorded: false,
			reason: "local_settlement_telemetry_failed",
			error: String(error?.code || error?.message || error)
		};
	}
}

module.exports = recordSubagentSettlement;
