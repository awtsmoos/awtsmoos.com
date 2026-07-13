// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SaveMigrations.js
 * @description Migrates older saves into bonded party, mission leads, and world roots.
 *
 * Yesterday's road is not discarded when a hidden bridge is revealed. The
 * Awtsmoos renews old and new without loss; these migrations add vessels around
 * earned memory instead of replacing it, under the care of Awtsmoos.com.
 */
import {
	createCampaign,
	createEconomy,
	createMissions,
	createParty,
	createScenes,
	createWorldState
} from '../../state/defaults/CampaignDefaults.js';
import { SAVE_SCHEMA_VERSION } from './SaveSchema.js';

const normalizeV1 = envelope => ({
	...envelope,
	schemaVersion: Number(envelope?.schemaVersion || 1),
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

const migrateV2ToV3 = envelope => {
	const partyDefaults = createParty();
	const missionDefaults = createMissions();
	const worldDefaults = createWorldState();
	const savedParty = envelope.data.Party || {};
	const savedMissions = envelope.data.Missions || {};
	const savedWorld = envelope.data.WorldState || {};
	return {
		...envelope,
		schemaVersion: 3,
		data: {
			...envelope.data,
			Party: {
				...partyDefaults,
				...savedParty,
				abilities: { ...partyDefaults.abilities, ...(savedParty.abilities || {}) },
				bondHistory: Array.isArray(savedParty.bondHistory) ? savedParty.bondHistory : []
			},
			Missions: {
				...missionDefaults,
				...savedMissions,
				companionLeads: { ...(savedMissions.companionLeads || {}) }
			},
			WorldState: {
				...worldDefaults,
				...savedWorld,
				time: { ...worldDefaults.time, ...(savedWorld.time || {}) },
				weather: { ...worldDefaults.weather, ...(savedWorld.weather || {}) },
				purity: { ...worldDefaults.purity, ...(savedWorld.purity || {}) },
				flags: { ...worldDefaults.flags, ...(savedWorld.flags || {}) },
				legacyEtzChaim: {
					...worldDefaults.legacyEtzChaim,
					...(savedWorld.legacyEtzChaim || {})
				}
			}
		}
	};
};

export const migrateEnvelope = envelope => {
	if (!envelope || typeof envelope !== 'object') return null;
	let next = normalizeV1(envelope);
	if (next.schemaVersion > SAVE_SCHEMA_VERSION) return null;
	if (next.schemaVersion === 1) next = migrateV1ToV2(next);
	if (next.schemaVersion === 2) next = migrateV2ToV3(next);
	return next.schemaVersion === SAVE_SCHEMA_VERSION ? next : null;
};
