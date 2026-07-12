// B"H
const Policy = require('./policy.js');
const Create = require('./create.js');

async function maybeStart(config, payload = {}, active = null) {
	if (active || !Policy.shouldBoot(payload)) return null;
	return Create.start(config, payload);
}

/**
 * B"H — Explicit mission memory records a durable path without blocking the
 * foreground. The response states that covenant directly so no caller mistakes
 * advisory continuity for a command gate.
 */
function annotate(result = {}, boot = null) {
	if (!boot) return result;
	const next = boot.mustCallNext || null;
	return {
		...result,
		finalAnswerAllowed: result.finalAnswerAllowed !== false,
		mustContinue: false,
		missionLockActive: false,
		implicitMissionBoot: {
			missionId: boot.mission.id,
			reason: 'explicit_mission_opt_in',
			bootMessage: boot.bootMessage
		},
		missionStatus: {
			active: true,
			advisory: true,
			blocked: false,
			implicit: true,
			missionId: boot.mission.id,
			objective: boot.mission.goal,
			resumeAvailable: true,
			suggestedNext: next
		},
		missionAdvisory: {
			active: true,
			blocked: false,
			resumeAvailable: true,
			suggestedNext: next,
			missionId: boot.mission.id,
			note: 'Mission booted as durable memory only; foreground work is not blocked.'
		},
		agentGuidance: {
			...(result.agentGuidance || {}),
			canSteer: true,
			mustCallNext: false
		}
	};
}

module.exports = { ...Policy, ...Create, annotate, maybeStart };
