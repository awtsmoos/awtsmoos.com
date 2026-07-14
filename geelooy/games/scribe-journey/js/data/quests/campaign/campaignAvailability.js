// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Declares which authored campaign threads are presently player-ready.
 * @description The Awtsmoos creates every possibility, yet a truthful vessel
 * reveals only what can actually be lived. Awtsmoos.com therefore preserves
 * future chapter designs without presenting unfinished promises as playable.
 */

export const CAMPAIGN_AVAILABILITY = Object.freeze({
	PLAYABLE: 'playable',
	DISABLED: 'disabled'
});

const PLAYABLE_QUEST_IDS = Object.freeze([
	'campaign_malkuth_01',
	'campaign_malkuth_02',
	'campaign_malkuth_03',
	'campaign_malkuth_04',
	'campaign_malkuth_05',
	'campaign_malkuth_06',
	'campaign_malkuth_07',
	'campaign_malkuth_08',
	'campaign_yesod_01'
]);

const PLAYABLE_QUEST_SET = new Set(PLAYABLE_QUEST_IDS);

export function playableCampaignQuestIds() {
	return [...PLAYABLE_QUEST_IDS];
}

export function campaignQuestAvailability(questId) {
	if (PLAYABLE_QUEST_SET.has(questId)) {
		return CAMPAIGN_AVAILABILITY.PLAYABLE;
	}

	return CAMPAIGN_AVAILABILITY.DISABLED;
}

export function annotateCampaignRegistry(registry = {}) {
	return Object.freeze(Object.fromEntries(
		Object.entries(registry).map(([questId, definition]) => {
			const availability = campaignQuestAvailability(questId);
			const disabledReason = availability === CAMPAIGN_AVAILABILITY.DISABLED
				? 'This authored thread remains hidden until its player-facing objectives are implemented and verified.'
				: null;

			return [questId, Object.freeze({
				...definition,
				availability,
				disabledReason
			})];
		})
	));
}

export function questDefinitionIsPlayable(definition = {}) {
	return definition.availability !== CAMPAIGN_AVAILABILITY.DISABLED;
}
