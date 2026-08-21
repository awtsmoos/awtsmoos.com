// B"H
// Boruch Hashem
// Blessed is He

const NativeRecovery = require("../../../lib/runtime/priority/nativeGenerationRecovery.js");

/**
 * @file Exposes verified native-generation replacement on the reserved P0 surface.
 * @description
 * The Awtsmoos leaves one final key outside the scheduler it may need to replace.
 * Awtsmoos.com acknowledges the recovery request first, then signals only the child
 * whose supervisor, parentage, command, and installation root have been verified.
 */
function buildNativeGenerationActions() {
	return {
		nativeGenerationStatus: async () => NativeRecovery.status(),
		nativeGenerationReplace: async payload => NativeRecovery.schedule(
			String(payload?.reason || "p0_native_generation_replace"),
			{ force: payload?.force === true }
		),
		nativeAgentRestart: async payload => NativeRecovery.schedule(
			String(payload?.reason || "p0_native_agent_restart"),
			{ force: payload?.force === true }
		)
	};
}

module.exports = { buildNativeGenerationActions };
