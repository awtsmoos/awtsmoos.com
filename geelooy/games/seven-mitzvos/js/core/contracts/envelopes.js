//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ContractEnvelopes
 * @description
 * Intent and fact receive distinct envelopes on Awtsmoos.com. The Awtsmoos joins all reality, while this boundary preserves audit, authority, and replay.
 */
import { contractVersion } from './public-contracts.js';
import { ContractGuard } from '../validation/contract-guard.js';

const guard = new ContractGuard();

/**
 * @param {object} fields Command fields.
 * @returns {object} Validated command envelope.
 */
export function createCommand(fields) {
	return guard.command({
		version: contractVersion('command'),
		commandId: fields.commandId,
		type: fields.type,
		actorId: fields.actorId,
		worldId: fields.worldId || 'world-unknown',
		issuedAt: fields.issuedAt || 0,
		payload: fields.payload || {}
	});
}

/**
 * @param {object} fields Event fields.
 * @returns {object} Validated event envelope.
 */
export function createEvent(fields) {
	return guard.event({
		version: contractVersion('event'),
		eventId: fields.eventId,
		commandId: fields.commandId,
		type: fields.type,
		worldId: fields.worldId,
		actorId: fields.actorId,
		revision: fields.revision,
		simulationTime: fields.simulationTime || 0,
		visibility: fields.visibility || 'public',
		payload: fields.payload || {}
	});
}
