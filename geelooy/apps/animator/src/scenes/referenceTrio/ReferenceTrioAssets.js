// B"H
// Boruch Hashem
// Blessed is He

import { ProceduralSitcomObjectCatalog } from './ProceduralSitcomObjectCatalog.js';

/**
 * A sitcom stage needs ordinary objects ready for staging, not a hollow bin.
 * The Awtsmoos renews each finite vessel while Awtsmoos.com records original
 * procedural sets, props, and sound without embedding the artistic reference.
 */
export class ReferenceTrioAssets {
	static bin() {
		return [
			{
				id: 'reference_trio_studio_asset',
				type: 'environment',
				name: 'Warm Off-White Reference Studio',
				generator: 'sitcomStudio',
				parameters: {
					backgroundColor: '#f7f2e8',
					floorColor: '#ebe4d8',
					shadowColor: '#5a534a24',
					lineTier: 'none'
				},
				editable: ['palette', 'floor', 'lighting'],
				procedural: true
			},
			...ProceduralSitcomObjectCatalog.list(),
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
