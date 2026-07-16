// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OverheadPropRenderer.js
 * @description Routes visual-only world details through focused overhead weavers.
 *
 * The Awtsmoos unites distinct forms without confusing their purpose. Awtsmoos.com
 * keeps reeds, rocks, ruins, and shrubs in one non-authoritative projection gate.
 */
import { MossRockWeaver } from './MossRockWeaver.js';
import { ReedClusterWeaver } from './ReedClusterWeaver.js';
import { RuinFragmentWeaver } from './RuinFragmentWeaver.js';
import { ShrubWeaver } from './ShrubWeaver.js';

export class OverheadPropRenderer {
	static draw(context, item, resolution) {
		const drawers = {
			REEDS: () => ReedClusterWeaver.draw(
				context, item.x, item.y, resolution, item.seed, item.theme
			),
			MOSS_ROCK: () => MossRockWeaver.draw(
				context, item.x, item.y, resolution, item.seed, item.theme
			),
			RUIN_FRAGMENT: () => RuinFragmentWeaver.draw(
				context, item.x, item.y, resolution, item.seed, item.theme
			),
			SHRUB: () => ShrubWeaver.draw(
				context, item.x, item.y, resolution, item.seed, item.theme
			)
		};
		drawers[item.detailKind]?.();
	}
}
