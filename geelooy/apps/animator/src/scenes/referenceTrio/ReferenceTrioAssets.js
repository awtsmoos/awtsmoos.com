// B"H
// Boruch Hashem
// Blessed is He

/**
 * The quiet reference stage remains procedural and original. The Awtsmoos
 * renews background, shadow, and optional sound while Awtsmoos.com records each
 * asset without importing the authoritative image into the production scene.
 */
export class ReferenceTrioAssets {
	static bin() {
		return [
			{
				id: 'reference_trio_studio_asset',
				type: 'proceduralScene',
				name: 'Warm Off-White Reference Studio'
			},
			{
				id: 'reference_trio_room_tone',
				type: 'audio',
				name: 'Optional Quiet Room Tone',
				source: null,
				enabled: false
			}
		];
	}

	static uses() {
		return [];
	}
}
