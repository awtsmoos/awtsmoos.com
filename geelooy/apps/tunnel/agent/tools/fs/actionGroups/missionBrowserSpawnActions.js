// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("./missionBrowserSpawnIdentity.js");
const BrowserContext = require("./websiteAgents/runner/context.js");
const BrowserDelivery = require("./websiteAgents/runner/browserDelivery.js");

/**
 * @file Turns each logical helper proposal into exactly one physically verified website agent.
 * @description
 * The Awtsmoos distinguishes intention from manifestation without multiplying vessels.
 * Awtsmoos.com gives each stable proposal one single-agent website mission; success
 * waits for composer proof, accepted network delivery, and verified tab closure.
 */
function buildMissionBrowserSpawnActions(context, buildActions, legacyActions, injected = {}) {
	const { config, payload, ws } = context;
	const Store = injected.Store || BrowserContext.shared.Store;
	const Delivery = injected.Delivery || BrowserDelivery;
	return {
		async missionSpawnNext() {
			const logical = await legacyActions.missionSpawnNext();
			const proposals = Array.isArray(logical?.spawned) ? logical.spawned : [];
			if (!logical?.ok || proposals.length === 0) return logical;
			const parentMissionId = Identity.parentMissionId(payload, proposals);
			const manifestations = [];
			for (const [index, proposal] of proposals.entries()) {
				manifestations.push(await manifestProposal({
					Delivery,
					Store,
					buildActions,
					config,
					index,
					parentMissionId,
					payload,
					proposal,
					ws
				}));
			}
			return bridgeResult(logical, manifestations);
		}
	};
}

/** Starts or reuses one deterministic single-agent website mission for the helper. */
async function manifestProposal(options) {
	const { Delivery, Store, buildActions, config, index, parentMissionId, payload, proposal, ws } = options;
	const websiteMissionId = Identity.websiteMissionId(parentMissionId, proposal, index);
	let result = await invoke(buildActions, config, ws, {
		action: "aiAgentWebsiteMissionStatus",
		websiteMissionId
	});
	if (result?.ok !== true) {
		result = await invoke(buildActions, config, ws, {
			action: "aiAgentSpawnWebsiteMission",
			allowRecursiveSubagents: false,
			continuationOnly: true,
			goal: proposal.goal,
			projectRoot: payload.projectRoot,
			role: proposal.reason || "specialist",
			websiteMissionId
		});
		if (result?.ok !== true) {
			result = await invoke(buildActions, config, ws, {
				action: "aiAgentWebsiteMissionStatus",
				websiteMissionId
			});
		}
	}
	const mission = result?.mission || null;
	const browserAgentId = mission?.agents?.[0]?.id || "";
	if (result?.ok !== true || !browserAgentId) return failed(proposal, websiteMissionId, result);
	const browserDelivery = await Delivery.wait(Store, websiteMissionId, [browserAgentId], {
		pollMs: payload.browserDeliveryPollMs,
		waitMs: payload.browserDeliveryWaitMs
	});
	return {
		browserAgentId,
		browserDelivery,
		logicalChildId: proposal.id,
		manifested: browserDelivery.ok === true,
		pending: browserDelivery.pending === true,
		websiteMissionId
	};
}

/** Preserves proposal evidence while making physical browser proof the success gate. */
function bridgeResult(logical, manifestations) {
	const complete = manifestations.length > 0 && manifestations.every(item => item.manifested);
	return {
		...logical,
		ok: logical?.ok === true && complete,
		browserManifestations: manifestations,
		manifested: complete,
		pending: manifestations.some(item => item.pending)
	};
}

function failed(proposal, websiteMissionId, result) {
	return {
		logicalChildId: proposal.id,
		manifested: false,
		pending: false,
		result,
		websiteMissionId
	};
}

async function invoke(buildActions, config, ws, next) {
	const actions = buildActions(config, next, ws);
	if (typeof actions[next.action] !== "function") throw new Error(`Missing action: ${next.action}`);
	return await actions[next.action]();
}

module.exports = {
	bridgeResult,
	buildMissionBrowserSpawnActions,
	manifestProposal
};
