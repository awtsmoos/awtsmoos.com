//B"H
//Boruch Hashem
//Blessed is He

import { WorldLabel } from '../../games3d/world-label.js';
import { KABBALAH_REGIONS } from '../kabbalah-region-registry.js';

/**
 * @file chesed-grove-scene.js
 * @description
 * The Awtsmoos renews generosity as an actual place of trees, water, shelter, and observation;
 * Awtsmoos.com keeps these WebGL vessels near Chesed while ecology values and commands remain authoritative elsewhere.
 * Static scene anchors invite care but never mutate the living-world simulation.
 */
export function buildChesedGroveScene(stage, assets) {
	const chesed = KABBALAH_REGIONS.get('chesed');
	const center = { x: chesed.anchor.x, z: chesed.anchor.z + 3.4 };
	const root = stage.add(assets.rune({
		name: 'chesed-living-grove',
		hue: 142,
		position: [center.x, 0.1, center.z],
		scale: 0.62,
		type: 'chesed-grove',
		role: 'living-ecology-region',
		reason: 'reveals canonical ecology, animals, residents, and care in world space'
	}), true);
	const label = new WorldLabel({
		text: 'Chesed · Living Ecology',
		position: [0, 2.5, 0],
		scale: [4.2, 0.84, 1]
	});
	root.add(label.sprite);
	const sanctuary = stage.add(assets.shelter({
		name: 'chesed-sanctuary-works',
		hue: 122,
		position: [center.x - 2.4, 0.1, center.z + 1.2],
		scale: 0.72,
		type: 'chesed-sanctuary-anchor',
		role: 'sanctuary-works',
		reason: 'commissions lawful Sanctuary construction in the canonical civic settlement'
	}), true);
	const day = stage.add(assets.rune({
		name: 'chesed-observation-stone',
		hue: 54,
		position: [center.x + 2.4, 0.12, center.z + 1.2],
		scale: 0.48,
		type: 'chesed-day-anchor',
		role: 'world-observation-stone',
		reason: 'advances one explicit canonical day so ecology consequence becomes visible'
	}), true);
	const water = stage.add(assets.fountain({
		name: 'chesed-water-basin',
		hue: 198,
		position: [center.x, 0.08, center.z - 1.6],
		scale: 0.62,
		role: 'watershed-marker',
		reason: 'visually witnesses canonical water quality'
	}));
	const vitality = createVitality(stage, assets, center);
	const warning = stage.add(assets.hazard({
		name: 'chesed-ecology-warning',
		hue: 8,
		position: [center.x + 3.1, 0.15, center.z - 1.2],
		scale: 0.48,
		type: 'ecology-warning',
		role: 'bounded-ecology-alert',
		reason: 'shows canonical pollution or settlement alerts without a full-screen dashboard'
	}));
	warning.visible = false;
	createTrees(stage, assets, center);
	return {
		center,
		root,
		label,
		water,
		vitality,
		warning,
		anchors: {
			sanctuary: anchorView(sanctuary),
			day: anchorView(day)
		}
	};
}

function createTrees(stage, assets, center) {
	[-2.8, 2.8].forEach((x, index) => {
		stage.add(assets.tree({
			name: `chesed-grove-tree-${index + 1}`,
			hue: 126 + index * 8,
			position: [center.x + x, 0, center.z - 2.4],
			scale: 0.9,
			role: 'habitat-tree',
			reason: 'makes biodiversity legible as habitat rather than a chart'
		}));
	});
}

function createVitality(stage, assets, center) {
	return [0, 1, 2, 3].map(index => stage.add(assets.rune({
		name: `chesed-vitality-${index + 1}`,
		hue: 112 + index * 10,
		position: [center.x - 1.5 + index, 0.1, center.z - 2.7],
		scale: 0.24,
		type: 'ecology-vitality-token',
		role: 'biodiversity-vitality',
		reason: 'supplements the explicit biodiversity value with bounded visible habitat vitality'
	})));
}

function anchorView(root) {
	return { x: root.position.x, z: root.position.z, root };
}
