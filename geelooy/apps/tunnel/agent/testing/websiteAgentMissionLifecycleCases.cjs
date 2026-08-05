// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Fixtures = require("./websiteAgentSubmitOnlyFixtures.cjs");

/**
 * @file Holds isolated submit-only mission lifecycle cases.
 * @description
 * The Awtsmoos reveals each lifecycle proof as a separate bounded vessel.
 * Awtsmoos.com tests authentication resume, safe pre-submit recovery, and durable
 * room life without reintroducing conversational answer polling.
 */
function createCases({ Runner, Store, root }) {
	function testConfig(directService) {
		return { root, tunnelName: "website-lifecycle-test",
			websiteMissionSleep: async () => undefined, directService };
	}
	function missionInput(id, prompt) {
		return { websiteMissionId: id, prompt, agentCount: 3,
			collaborationRounds: 1, projectRoot: root };
	}
	async function waitForActive(id) {
		for (let index = 0; index < 200; index += 1) {
			const active = Runner.active.get(id);
			if (active) return active;
			await new Promise(resolve => setTimeout(resolve, 5));
		}
		throw new Error("wait_for_active_timeout");
	}
	async function loginPauseAndResume() {
		let authenticated = false;
		let loginOpens = 0;
		const calls = [];
		const service = Fixtures.authenticatedService(calls);
		service.authenticationStatus = async () => ({
			authenticated,
			status: authenticated ? "authenticated" : "not_logged_in"
		});
		service.requestLogin = async () => {
			loginOpens += 1;
			return { ok: true, opened: true };
		};
		const config = testConfig(service);
		const id = Fixtures.missionId("login-resume");
		const started = await Runner.start(config, missionInput(id, "Authenticate then dispatch."));
		await Runner.active.get(started.mission.id);
		let status = await Runner.status(config, { websiteMissionId: id });
		assert.equal(status.mission.status, "waiting_for_login");
		assert.equal(calls.length, 0);
		assert.equal(loginOpens, 1);
		authenticated = true;
		await Runner.status(config, { websiteMissionId: id, refreshAuthentication: true });
		await waitForActive(id);
		status = await Runner.status(config, { websiteMissionId: id });
		assert.equal(status.mission.status, "running");
		assert.equal(calls.length, 3);
		await Runner.forget(config, { websiteMissionId: id });
	}
	async function orphanedPreSubmitRecovery() {
		const calls = [];
		const config = testConfig(Fixtures.authenticatedService(calls));
		const id = Fixtures.missionId("orphaned-pre-submit");
		const started = await Runner.start(config, missionInput(id, "Recover only pre-submit work."));
		await Runner.active.get(started.mission.id);
		assert.equal(calls.length, 3);
		Store.update(id, record => {
			const target = record.agents[0];
			target.status = "submitting";
			target.submissionAcceptedAt = null;
			target.pendingRound = 1;
			target.round = 0;
			target.lastOutcome = null;
			record.status = "running";
			record.phase = "launching_agents";
			return record;
		});
		await Runner.status(config, { websiteMissionId: id });
		await waitForActive(id);
		const status = await Runner.status(config, { websiteMissionId: id });
		assert.equal(calls.length, 4);
		assert.equal(status.mission.status, "running");
		assert.ok(status.mission.events.some(item =>
			item.type === "orphaned_pre_submit_turn_requeued"));
		await Runner.forget(config, { websiteMissionId: id });
	}
	async function roomMessagePersistsForWorkingAgents() {
		const calls = [];
		const config = testConfig(Fixtures.authenticatedService(calls));
		const id = Fixtures.missionId("room-life");
		const started = await Runner.start(config, missionInput(id, "Continue through shared rooms."));
		await Runner.active.get(started.mission.id);
		const delivered = await Runner.message(config, {
			websiteMissionId: id,
			message: "Publish verified PROGRESS and remaining work.",
			toAgent: "all"
		});
		assert.equal(delivered.delivery.websiteAgents, "next_safe_turn");
		const status = await Runner.status(config, { websiteMissionId: id });
		assert.equal(status.mission.status, "running");
		assert.equal(calls.length, 3);
		assert.ok(status.room.messages.some(item =>
			item.body?.includes("Publish verified PROGRESS")));
		await Runner.forget(config, { websiteMissionId: id });
	}
	return { loginPauseAndResume, orphanedPreSubmitRecovery,
		roomMessagePersistsForWorkingAgents };
}

module.exports = { createCases };
