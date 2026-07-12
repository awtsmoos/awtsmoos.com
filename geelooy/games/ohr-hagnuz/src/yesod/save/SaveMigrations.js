/**
 * B"H
 * @module SaveMigrations
 * @description Migrates older saves into the unified campaign roots.
 */
import { createCampaign, createEconomy, createMissions, createParty, createScenes, createWorldState } from '../../state/defaults/CampaignDefaults.js';
import { SAVE_SCHEMA_VERSION } from './SaveSchema.js';

const normalizeV1 = envelope => ({
	...envelope,
	schemaVersion: 1,
	data: envelope?.data && typeof envelope.data === 'object' ? envelope.data : {}
});

const migrateV1ToV2 = envelope => ({
	...envelope,
	schemaVersion: 2,
	data: {
		...envelope.data,
		Campaign: envelope.data.Campaign || createCampaign(),
		Party: envelope.data.Party || createParty(),
		Missions: envelope.data.Missions || createMissions(),
		Scenes: envelope.data.Scenes || createScenes(),
		Economy: envelope.data.Economy || createEconomy(),
		WorldState: envelope.data.WorldState || createWorldState()
	}
});

export const migrateEnvelope = envelope => {
	if (!envelope || typeof envelope !== 'object') return null;
	let next = normalizeV1(envelope);
	if (Number(next.schemaVersion) > SAVE_SCHEMA_VERSION) return null;
	if (Number(next.schemaVersion) === 1) next = migrateV1ToV2(next);
	return Number(next.schemaVersion) === SAVE_SCHEMA_VERSION ? next : null;
};
