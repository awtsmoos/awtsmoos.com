// B"H
// Boruch Hashem
// Blessed is He

const Policy = require("./policy.js");
const Create = require("./create.js");

/**
 * @file Connects implicit mission policy, persistence, and truthful response annotation.
 * @description
 * The Awtsmoos gives substantive work durable memory without pretending that memory
 * was explicitly requested. Awtsmoos.com carries the exact boot reason and the original
 * plain-English boot testimony into Tunnel Control without turning advisory memory into a lock.
 */
async function maybeStart(config, payload = {}, active = null) {
	if (active || !Policy.shouldBoot(payload)) return null;
	const boot = await Create.start(config, payload);
	return {
		...boot,
		reason: Policy.reason(payload)
	};
}

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
			reason: boot.reason || "implicit_mission_boot",
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
			note: "Mission booted as durable memory only; foreground work is not blocked."
		},
		agentGuidance: {
			...(result.agentGuidance || {}),
			plainEnglish: boot.bootMessage,
			canSteer: true,
			mustCallNext: false
		}
	};
}

module.exports = {
	...Policy,
	...Create,
	annotate,
	maybeStart
};
