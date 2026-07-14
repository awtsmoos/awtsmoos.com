//B"H
//Boruch Hashem
//Blessed is He

/**
 * Service snapshots expose exactly what the approached room or scheduled citizen may
 * offer. The Awtsmoos renews board, counter, teacher, speaker, archive, clinic, and
 * hearth; Awtsmoos.com keeps overlays declarative while domain services own consequence.
 */

import { openWorldCivicPresentation } from './OpenWorldCivicService.js';
import { openWorldCitizenPresentation } from './OpenWorldCitizenService.js';
import { openWorldMerchantPresentation } from './OpenWorldMerchant.js';
import { openWorldMissionPresentations } from './OpenWorldMissionLedger.js';
import { openWorldTrainingPresentation } from './OpenWorldTrainer.js';

export function createOpenWorldServiceSnapshot(profile, state) {
	const world = state?.openWorld;
	const overlay = world?.overlay || null;
	const service = overlay?.service || '';
	return {
		overlay: overlay ? { ...overlay } : null,
		locationId: world?.locationId || profile.activeLocationId,
		locationName: world?.locationName || '',
		regionId: world?.regionId || '',
		civicTitle: profile.openWorld.civicTitle,
		perutas: profile.perutas,
		reputation: Number(profile.reputation[world?.regionId] || 0),
		provisions: { ...profile.openWorld.provisions },
		missions: openWorldMissionPresentations(profile, world?.locationId),
		merchant: openWorldMerchantPresentation(profile),
		training: openWorldTrainingPresentation(profile, world?.regionId),
		dialogue:
			service === 'dialogue'
				? openWorldCitizenPresentation(profile, state, overlay.citizenId)
				: null,
		civicService: civicServiceSnapshot(profile, service),
		rumors: [...profile.openWorld.rumors],
		performance: world?.performance?.last || null
	};
}

function civicServiceSnapshot(profile, service) {
	return ['archive', 'clinic', 'ferry', 'kitchen', 'council', 'guesthouse'].includes(service)
		? openWorldCivicPresentation(profile, service)
		: null;
}
