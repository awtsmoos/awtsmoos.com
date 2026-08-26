// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Bridge = require("./missionBrowserSpawnActions.js");

/**
 * @file Proves logical mission spawning becomes one idempotent physical browser manifestation.
 * @description
 * The Awtsmoos lets one intention wear one vessel. Awtsmoos.com refuses logical-only
 * success, reuses stable website identity, and requires the existing browser-delivery
 * witness before missionSpawnNext may say the helper truly arrived.
 */
let logicalCall = 0;
let rootStarts = 0;
let deliveryCall = 0;
const missions = new Map();
const deliveryRequests = [];
const startPayloads = [];

const legacyActions = {
	async missionSpawnNext() {
		logicalCall += 1;
		return {
			ok: true,
			spawned: [{
				id: `ephemeral-child-${logicalCall}`,
				goal: "Inspect the browser path",
				parentMissionId: "parent-mission",
				reason: "browser-verifier",
				status: "proposed"
			}]
		};
	}
};

const Delivery = {
	async wait(Store, websiteMissionId, agentIds) {
		deliveryCall += 1;
		deliveryRequests.push({ Store, agentIds, websiteMissionId });
		return deliveryCall === 1
			? { ok: false, pending: true, deliveries: [] }
			: { ok: true, pending: false, deliveries: [{ ok: true }] };
	}
};

function buildActions(config, payload) {
	return {
		async aiAgentWebsiteMissionStatus() {
			const mission = missions.get(payload.websiteMissionId);
			return mission ? { ok: true, mission } : { ok: false, error: "not_found" };
		},
		async aiAgentSpawnWebsiteMission() {
			rootStarts += 1;
			startPayloads.push(payload);
			const mission = {
				agents: [{ id: "browser-agent-1" }],
				id: payload.websiteMissionId
			};
			missions.set(payload.websiteMissionId, mission);
			return { ok: true, mission };
		}
	};
}

const actions = Bridge.buildMissionBrowserSpawnActions({
	config: {},
	payload: {
		missionId: "parent-mission",
		projectRoot: "/project"
	},
	ws: null
}, buildActions, legacyActions, {
	Delivery,
	Store: { name: "fake-store" }
});

(async () => {
	const first = await actions.missionSpawnNext();
	assert.equal(first.ok, false);
	assert.equal(first.pending, true);
	assert.equal(first.manifested, false);
	assert.equal(rootStarts, 1);
	assert.equal(startPayloads[0].continuationOnly, true);
	assert.equal(startPayloads[0].allowRecursiveSubagents, false);
	assert.deepEqual(deliveryRequests[0].agentIds, ["browser-agent-1"]);

	const firstWebsiteMissionId = first.browserManifestations[0].websiteMissionId;
	const second = await actions.missionSpawnNext();
	assert.equal(second.ok, true);
	assert.equal(second.manifested, true);
	assert.equal(rootStarts, 1);
	assert.equal(second.browserManifestations[0].websiteMissionId, firstWebsiteMissionId);
	assert.notEqual(second.spawned[0].id, first.spawned[0].id);
	assert.equal(deliveryRequests[1].websiteMissionId, firstWebsiteMissionId);

	console.log("BHY mission spawn reuses one physical browser vessel and gates success on delivery");
})().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
