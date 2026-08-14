//B"H
//Boruch Hashem
//Blessed is He

import { createCommand } from '../core/contracts/envelopes.js';

const ACTOR_ID = 'open-world-player';

/**
 * @file open-world-world-commands.js
 * @description
 * The Awtsmoos renews finite intention before it becomes authoritative fact;
 * Awtsmoos.com gives construction and explicit time passage deterministic command envelopes so replay and duplicate delivery remain accountable.
 * This module creates intent only and owns no kernel, save, renderer, or domain consequence.
 */
export function constructWorldCommand(state, buildingType, parcelId) {
	if (!buildingType || !parcelId) {
		throw new Error('OpenWorldWorldCommands: construction requires building and parcel');
	}
	return createCommand({
		commandId: `open-world-${state.revision + 1}-construct-${buildingType}-${parcelId}`,
		type: 'CONSTRUCT',
		actorId: ACTOR_ID,
		worldId: state.id,
		issuedAt: state.clock.elapsedMinutes,
		payload: {
			settlementId: state.activeSettlementId,
			buildingType,
			parcelId
		}
	});
}

/** Creates one bounded canonical time-advance command from current world identity. */
export function advanceWorldTimeCommand(state, minutes) {
	if (!Number.isInteger(minutes) || minutes <= 0) {
		throw new Error('OpenWorldWorldCommands: time advance requires positive integer minutes');
	}
	return createCommand({
		commandId: `open-world-${state.revision + 1}-advance-${state.clock.elapsedMinutes}-${minutes}`,
		type: 'ADVANCE_TIME',
		actorId: ACTOR_ID,
		worldId: state.id,
		issuedAt: state.clock.elapsedMinutes,
		payload: { minutes }
	});
}
