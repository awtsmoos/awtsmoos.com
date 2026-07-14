//B"H
//Boruch Hashem
//Blessed is He

/** Malchus reveals a citadel, cedar wilderness, and crown ruin through authored roads. */

import { road } from './mapVariantBuilders.js';

export const MALCHUS_MAP_VARIANTS = Object.freeze([
	road(
		'malchus-citadel',
		'settlement',
		760,
		[
			[-980, 520, 520, 28, 'citadel'],
			[-180, 360, 420, 26, 'market'],
			[560, 540, 520, 28, 'wall'],
			[1440, 300, 620, 30, 'keep'],
			[2500, 500, 520, 28, 'wall'],
			[3400, 260, 620, 30, 'gate']
		],
		{
			serviceNodes: [
				{ id: 'keeper', x: 40, y: 300 },
				{ id: 'smith', x: 1680, y: 230 }
			],
			weatherTags: ['dust', 'afternoon']
		}
	),
	road(
		'cedar-forest',
		'wilderness',
		820,
		[
			[-1080, 590, 500, 24, 'root'],
			[-300, 410, 430, 22, 'branch'],
			[480, 610, 520, 24, 'root'],
			[1320, 320, 520, 22, 'branch'],
			[2240, 560, 560, 24, 'root'],
			[3240, 300, 620, 22, 'branch']
		],
		{ weatherTags: ['leaf-rain', 'morning'] }
	),
	road(
		'crown-ruins',
		'climax',
		780,
		[
			[-1000, 520, 520, 28, 'ruin'],
			[-120, 330, 520, 30, 'arch'],
			[820, 520, 520, 28, 'ruin'],
			[1700, 220, 720, 34, 'crown'],
			[2920, 520, 520, 28, 'ruin'],
			[3800, 330, 520, 30, 'arch']
		],
		{ bossNode: [2060, 110], weatherTags: ['ash', 'sunset'] }
	)
]);
