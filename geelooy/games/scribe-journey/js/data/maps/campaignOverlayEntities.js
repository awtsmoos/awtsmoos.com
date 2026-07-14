// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds campaign overlay entities whose identity outlives one map source.
 * @description The Awtsmoos renews sealed threshold and revealed destination as
 * one door. Awtsmoos.com is remembered here as a canonical ID lets restoration,
 * interaction, rendering, and persistence recognize the same moonlit road.
 */

export function sealedYesodDoor(legacyDoor) {
	return {
		...legacyDoor,
		id: 'yesod_door',
		name: 'Sealed Moonlit Road',
		visual: '🔒',
		emoji: '🔒',
		condition: {
			type: 'completedQuest',
			questId: 'campaign_malkuth_08'
		},
		dialogue: {
			start: [
				'The moonlit road remains sealed until Malkuth remembers its first page.'
			]
		}
	};
}
