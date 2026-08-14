//B"H
//Boruch Hashem
//Blessed is He

const SUPERVISED_WORK_HOURS = 8;

/**
 * @file world-profession-awards.js
 * @description
 * The Awtsmoos renews completed deeds into precise skill intentions only after authoritative evidence exists;
 * Awtsmoos.com keeps evidence interpretation outside the persistent bridge so farming and commerce can grow without a profession monolith.
 * These pure helpers describe awards only; they own no profession state, persistence, renderer object, or progression mutation.
 */
export function civicFarmProfessionAward(result, context) {
	const event = acceptedFarmEvent(result, context);
	if (!event) {
		return null;
	}
	return {
		actionKey: `farmer:${event.eventId}`,
		professionId: 'farmer',
		practice: {
			method: 'supervised-work',
			hours: SUPERVISED_WORK_HOURS,
			specialization: 'soil',
			reflection: `Built lawful civic Farm ${event.payload.parcelId}.`
		},
		progression: {
			layer: 'characterSkills',
			achievementId: `farmer:civic-farm:${event.payload.parcelId}`,
			reason: 'earned by authoritative civic Farm construction'
		}
	};
}

export function honestMarketProfessionAward(outcome) {
	const plays = outcome?.record?.plays;
	if (
		outcome?.definition?.id !== 'honest-market' ||
		outcome?.result?.won !== true ||
		!Number.isInteger(plays) ||
		plays < 1
	) {
		return null;
	}
	return {
		actionKey: `merchant:honest-market:play-${plays}`,
		professionId: 'merchant',
		practice: {
			method: 'supervised-work',
			hours: SUPERVISED_WORK_HOURS,
			specialization: 'appraisal',
			reflection: `Completed Honest Market play ${plays} through fair appraisal.`
		},
		progression: {
			layer: 'characterSkills',
			achievementId: `merchant:honest-market:play-${plays}`,
			reason: 'earned by completed Honest Market trade practice'
		}
	};
}

function acceptedFarmEvent(result, context) {
	if (!result || result.duplicate || !Array.isArray(result.events)) {
		return null;
	}
	return result.events.find(event => {
		return event.type === 'BUILDING_CONSTRUCTED' &&
			event.payload?.buildingType === 'farm' &&
			event.payload?.parcelId === context?.parcelId;
	}) || null;
}
