// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Records Mission Room interrupt creation and recovery testimony.
 * @description
 * The Awtsmoos keeps routing and acknowledgement evidence durable while the core
 * interrupt module remains focused on recipient behavior and stays beneath source limits.
 */
function created(mission, input, interrupt, env) {
	meta(env, input, mission, "room_interrupt", {
		agentId: interrupt.fromAgent,
		message: interrupt.reason,
		payload: routePayload(interrupt)
	});
	env.event(mission, "mission_room_interrupt", interrupt.reason, {
		roomId: mission.room?.id,
		...routePayload(interrupt)
	});
}

function recovered(mission, input, target, remainingAgents, env) {
	meta(env, input, mission, "room_interrupt_recovered", {
		agentId: target.recoveredBy,
		message: target.recoveryNote,
		payload: { interruptId: target.id, remainingAgents }
	});
	env.event(mission, "mission_room_interrupt_recovered", target.recoveryNote, {
		roomId: mission.room?.id,
		interruptId: target.id,
		agentId: target.recoveredBy,
		remainingAgents
	});
}

function routePayload(interrupt) {
	return {
		interruptId: interrupt.id,
		messageId: interrupt.messageId,
		toAgent: interrupt.toAgent,
		toAgents: interrupt.toAgents,
		toSpawnGroup: interrupt.toSpawnGroup || undefined
	};
}

function meta(env, input, mission, kind, data) {
	if (!env.MetadataStore || input.disableCentralMetadata === true) return null;
	return env.MetadataStore.record({
		root: input.__configRoot || input.projectRoot,
		metadataRoot: input.__metadataRoot
	}, mission, kind, data);
}

module.exports = { created, recovered };
