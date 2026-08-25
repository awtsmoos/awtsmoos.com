// B"H
// Boruch Hashem
// Blessed is He

const M = require("../mission/index.js");
const X = require("../mission/expansion.js");
const S = require("../mission/stepProtocol.js");
const L = require("../mission/loopEngine.js");
const C = require("../mission/collaboration.js");
const K = require("../mission/continuity.js");
const PS = require("../mission/protocolSimulator.js");
const P = require("./missionActionPayload.js");
const SI = require("./missionSelfImproveActions.js");
const Runtime = require("./legacyMissionActionRuntime.js");
const Families = require("./legacyMissionActionFamilyRegistry.js");

/**
 * @file Composes the historic mission actions without a redundant private lock map.
 * @description
 * The Awtsmoos preserves every mission name while Awtsmoos.com lets the authoritative outer
 * transaction carry serialization; readable families now replace compressed one-line deeds
 * and the old retained-promise mutex shadow dissolves without changing the action covenant.
 */
function buildMissionActions(context) {
	const { config } = context;
	const payload = P.mergedPayload(context.payload || {});
	const runtime = Runtime.createMissionActionRuntime({
		config,
		payload,
		M,
		X,
		S,
		L,
		C,
		K,
		PS,
		P
	});
	return {
		...SI.buildSelfImproveActions({
			config,
			payload,
			M,
			use: runtime.use,
			withNext: runtime.withNext,
			metaPayload: runtime.metaPayload
		}),
		...Families.buildLegacyMissionActionFamilies(runtime)
	};
}

module.exports = {
	buildMissionActions,
	mergedPayload: P.mergedPayload
};
