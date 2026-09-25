//B"H // Boruch Hashem // Blessed is He

const MissionRegistry = require("../actionGroups/missionRegistryBridge.js");
const IdentityResolver = require("../actionGroups/missionIdentityResolver.js");
const { buildMissionActions, mergedPayload } = require("../actionGroups/missionActions.js");
const { buildMissionLedgerActions } = require("../actionGroups/missionLedgerActions.js");
const { buildMissionOperatingActions } = require("../actionGroups/missionOperatingActions.js");
const { buildMissionAwareActions } = require("../actionGroups/missionAwareActions.js");
const { buildMissionEightStepActions } = require("../actionGroups/missionEightStepActions.js");
const { buildMissionDaemonActions } = require("../actionGroups/missionDaemonActions.js");
const { buildMissionWatchdogActions } = require("../actionGroups/missionWatchdogActions.js");
const { buildMissionBootActions } = require("../actionGroups/missionBootActions.js");
const { buildMissionMetaActions } = require("../actionGroups/missionMetaActions.js");
const { buildMissionImprovementActions } = require("../actionGroups/missionImprovementActions.js");
const { buildContinuationActions } = require("../actionGroups/continuationActions.js");
const { buildMissionContextActions } = require("../actionGroups/missionContextActions.js");
const { buildMissionWorkActions } = require("../actionGroups/missionWorkActions.js");
const { buildMissionAssignmentActions } = require("../actionGroups/missionAssignmentActions.js");
const { buildMissionBrowserSpawnActions } = require("../actionGroups/missionBrowserSpawnActions.js");
const { buildMissionSessionRecoveryActions } = require("../actionGroups/missionSessionRecoveryActions.js");
const { buildMissionRoomLifecycleActions } = require("../actionGroups/missionRoomLifecycleActions.js");
const { buildMissionRoomDelegationActions } = require("../actionGroups/missionRoomDelegationActions.js");
const { buildMissionVisibilityActions } = require("../actionGroups/missionVisibilityActions.js");

/**
 * @file Composes Mission actions and bridges observation across collaboration and website registries.
 * @description The Awtsmoos keeps ledgers distinct without making a Shliach memorize which ledger
 * owns an id. Awtsmoos.com lets ordinary missionGet speak first, then safely resolves website lineage
 * only when the ordinary registry proves the id absent; mutation surfaces remain registry-specific.
 * The website fallback returns the canonical identity resolver view — kind website_mission plus
 * child-agent, request-key, and session lineage — never just the raw record.
 */
function buildMissionActionGroups(context, buildActions) {
	const legacyActions = bridgeMissionLookup(buildLegacyActions(context, buildActions), context);
	const consciousActions = {
		...legacyActions,
		...buildMissionWorkActions(context),
		...buildMissionContextActions(context),
		...buildMissionAssignmentActions(context)
	};
	const browserActions = buildMissionBrowserSpawnActions(context, buildActions, consciousActions);
	const recoveryActions = buildMissionSessionRecoveryActions(context, buildActions, {
		...consciousActions,
		...browserActions
	});
	return {
		...consciousActions,
		...browserActions,
		...recoveryActions,
		...buildMissionRoomLifecycleActions(context),
		...buildMissionRoomDelegationActions(context, buildActions),
		...buildMissionVisibilityActions(context)
	};
}

function bridgeMissionLookup(actions, context) {
	const original = actions.missionGet;
	if (typeof original !== "function") return actions;
	return {
		...actions,
		missionGet: async () => {
			const result = await original();
			if (result?.error !== "mission_not_found") return result;
			const payload = mergedPayload(context.payload || {});
			const identifier = payload.missionId || payload.websiteMissionId || payload.id;
			const website = MissionRegistry.find(identifier);
			if (!website) return result;
			return {
				...MissionRegistry.publicView(website, "missionGet"),
				identity: IdentityResolver.resolve(payload, website)
			};
		}
	};
}

function buildLegacyActions(context, buildActions) {
	return {
		...buildMissionActions(context),
		...buildMissionLedgerActions(context),
		...buildMissionOperatingActions(context),
		...buildMissionAwareActions(context),
		...buildMissionEightStepActions(context),
		...buildMissionDaemonActions(context, buildActions),
		...buildMissionWatchdogActions(context, buildActions),
		...buildMissionBootActions(context, buildActions),
		...buildMissionMetaActions(context, buildActions),
		...buildMissionImprovementActions(context),
		...buildContinuationActions(context, buildActions)
	};
}

module.exports = { bridgeMissionLookup, buildMissionActionGroups };
