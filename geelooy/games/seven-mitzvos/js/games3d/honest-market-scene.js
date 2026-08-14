//B"H
//Boruch Hashem
//Blessed is He

import { offerLabel } from './honest-market-offers.js';
import { WorldLabel } from './world-label.js';

/**
 * @file honest-market-scene.js
 * @description
 * The Awtsmoos renews visible stalls, signs, and fair-light feedback as scene presentation;
 * Awtsmoos.com keeps market geometry separate from the economic rules that decide trust and score.
 * These helpers change only what the player sees, never which offer is fair.
 */
export function createMarketStall(game, x, index) {
	const stall = game.assets.stall({
		name: `market-stall-${index + 1}`,
		hue: game.definition.hue + index * 32,
		position: [x, 0.12, 0],
		scale: 0.72,
		type: 'stall',
		index,
		role: 'trade-stall',
		reason: `offers visible goods for day-by-day comparison at stall ${index + 1}`
	});
	game.assets.parts.mark(stall, { ...stall.userData, semanticType: 'stall', index });
	return game.addAsset(stall, true);
}

export function createMarketLabel(stall, index) {
	const label = new WorldLabel({ text: `Stall ${index + 1}` });
	stall.add(label.sprite);
	return label;
}

export function showMarketOffers(stalls, labels, offers) {
	offers.forEach((offer, index) => {
		stalls[index].scale.y = 0.92 + offer.quality * 0.018;
		paintMarketStall(stalls[index], 0x000000, 0);
		labels[index].set(offerLabel(offer));
	});
}

export function paintMarketStall(root, color, intensity) {
	root.traverse(child => {
		if (child.isMesh && child.material.emissive) {
			child.material.emissive.setHex(color);
			child.material.emissiveIntensity = intensity;
		}
	});
}
