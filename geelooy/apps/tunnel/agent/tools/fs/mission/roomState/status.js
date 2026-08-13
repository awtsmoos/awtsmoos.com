// B"H
// Boruch Hashem
// Blessed is He

const InviteLedger = require("../roomInviteLedger.js");
const Runtime = require("../roomRuntime.js");
const WakeGate = require("../roomWakeGate.js");
const Base = require("./base.js");

/**
 * @file Exposes room steering, fanout pressure, and scheduler truth without renewing leases.
 * @description The Awtsmoos reveals unlimited logical possibility while Awtsmoos.com names
 * the bounded physical vessel and duplicate control avoided, so scale remains observable.
 */
function status(mission) {
	const room = Base.ensure(mission);
	const blockingInterrupts = room.interrupts.filter(item => item.status === "blocking");
	const scheduler = Runtime.scheduler(room);
	const fanout = {
		...InviteLedger.stats(room),
		...WakeGate.stats(room),
		physicalExecution: "bounded_by_command_scheduler"
	};
	return {
		roomId: room.id,
		missionId: mission.id,
		name: room.name,
		projectRoot: room.projectRoot,
		agents: Object.values(room.agents),
		messages: room.messages.slice(-50),
		invites: room.invites.slice(-20),
		discoveries: room.discoveries.slice(-20),
		splitProposals: room.splitProposals.slice(-20),
		agreements: room.agreements.slice(-50),
		claims: room.claims.slice(-50),
		heartbeats: room.heartbeats.slice(-50),
		subMissions: room.subMissions,
		mergeReports: room.mergeReports.slice(-10),
		interrupts: room.interrupts.slice(-20),
		blockingInterrupts,
		brainstorms: room.brainstorms.slice(-10),
		currentWork: room.currentWork,
		scheduler,
		missionGraph: scheduler.missionGraph,
		health: scheduler.health,
		fanout,
		nextHighestWork: scheduler.health.nextHighestWork,
		mustCallNext: recoverNext(mission, blockingInterrupts[0]),
		counts: counts(room, blockingInterrupts, fanout)
	};
}

function recoverNext(mission, interrupt) {
	if (!interrupt) return null;
	return {
		action: "missionRoomRecoverInterrupt",
		missionId: mission.id,
		interruptId: interrupt.id,
		agentId: interrupt.recoveryRequiredBy === "any_agent"
			? "agent"
			: interrupt.recoveryRequiredBy
	};
}

function counts(room, blockingInterrupts, fanout) {
	return {
		agents: Object.keys(room.agents).length,
		messages: room.messages.length,
		openSplits: room.splitProposals.filter(item => (
			item.status !== "accepted" && item.status !== "rejected"
		)).length,
		subMissions: room.subMissions.length,
		activeClaims: room.claims.filter(item => item.status === "active").length,
		blockingInterrupts: blockingInterrupts.length,
		openInvites: fanout.openInvites,
		acceptedInvites: fanout.acceptedInvites,
		distinctInviteTargets: fanout.distinctInviteTargets,
		inviteAttempts: fanout.inviteAttempts
	};
}

module.exports = { status };
