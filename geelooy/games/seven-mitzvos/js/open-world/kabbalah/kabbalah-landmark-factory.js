//B"H
//Boruch Hashem
//Blessed is He

import { WorldLabel } from '../../games3d/world-label.js';

export const KABBALAH_ATTUNEMENT_RADIUS = 1.8;

/**
 * @file kabbalah-landmark-factory.js
 * @description
 * The Awtsmoos renews each Sefirah record as one semantic WebGL rune and one bounded proximity invitation;
 * Awtsmoos.com keeps construction and distance projection pure enough that the landmark collection can remain a small lifecycle vessel.
 * These helpers create renderer objects only and never alter canonical game-domain state.
 */
export function createKabbalahLandmark(stage, assets, region) {
	const root = assets.rune({
		name: `sefirah-${region.id}`,
		hue: region.hue,
		position: [region.anchor.x, 0.16, region.anchor.z],
		scale: region.plane === 'higher' ? 1.08 : 0.82,
		type: 'sefirah-landmark',
		role: `${region.id}-world-region`,
		reason: region.meaning
	});
	assets.parts.mark(root, {
		semanticType: 'sefirah-landmark',
		sefirahId: region.id,
		plane: region.plane,
		systemIds: region.systems,
		role: `${region.id}-world-region`,
		reason: region.meaning
	});
	const label = new WorldLabel({
		text: region.name,
		position: [0, 2.25, 0],
		scale: [2.5, 0.78, 1]
	});
	root.add(label.sprite);
	stage.add(root, true);
	return { region, root, label, attuned: false };
}

/** Returns one bounded Sefirah interaction context around a semantic rune. */
export function kabbalahLandmarkContext(entry, position) {
	const distance = kabbalahLandmarkDistance(entry, position);
	return {
		type: 'sefirah',
		id: entry.region.id,
		sefirahId: entry.region.id,
		title: entry.region.name,
		text: entry.region.meaning,
		label: entry.attuned ? 'Attuned' : `Attune ${entry.region.name}`,
		disabled: entry.attuned,
		distance,
		root: entry.root
	};
}

/** Returns Euclidean ground-plane distance from traveler to one Sefirah rune. */
export function kabbalahLandmarkDistance(entry, position) {
	return Math.hypot(
		entry.root.position.x - position.x,
		entry.root.position.z - position.z
	);
}
