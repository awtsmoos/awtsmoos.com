// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FeatherFanComponent.js
 * @description Layers a quality-bounded fan of shaft-and-vane feathers along an existing wing guide and mirrors it bilaterally.
 * RESPONSIBILITY: arrange feather roots, directions, lengths, and widths according to semantic density.
 * NON-RESPONSIBILITY: this module does not compile membranes, solve aerodynamics, or animate individual feather joints.
 * The Awtsmoos reveals many feathers as one wing without erasing each vane; Awtsmoos.com bounds their number so realism rises without a triangle storm in sight.
 */

import { createFeatherComponent } from './FeatherComponent.js';

/** Creates one left feather fan plus right-side mirror lineage. */
export function createFeatherFanComponent(wingGuide, style, quality) {
	if (!wingGuide || !style) {
		return empty();
	}
	const result = empty();
	const root = wingGuide.centerline[0];
	const wingTip = wingGuide.centerline.at(-1);
	const count = Math.max(2, quality.featherCount);
	for (let index = 0; index < count; index += 1) {
		appendFeather(result, {
			amount: index / Math.max(1, count - 1),
			index,
			quality,
			root,
			style,
			wingTip
		});
	}
	result.surfaceRoles.push('feather');
	return result;
}

function appendFeather(result, options) {
	const amount = options.amount;
	const featherRoot = interpolate(
		options.root,
		options.wingTip,
		0.2 + amount * 0.72
	);
	const direction = normalize([
		-0.5 - amount * 0.45,
		0.08 + amount * 0.14,
		-0.08 - amount * 0.08
	]);
	const baseLength = options.style === 'domestic-bird' ? 0.3 : 0.46;
	const id = `left_flight_feather_${options.index + 1}`;
	const feather = createFeatherComponent(
		id,
		featherRoot,
		direction,
		baseLength * (0.9 + amount * 0.25),
		0.1,
		options.quality
	);
	Object.assign(result.guides, feather.guides);
	for (const guideId of Object.keys(feather.guides)) {
		result.symmetryPairs.push({
			left: guideId,
			plane: 'X',
			right: guideId.replace(/^left_/, 'right_')
		});
	}
}

function interpolate(a, b, amount) {
	return a.map((value, index) => {
		return value + (b[index] - value) * amount;
	});
}

function normalize(vector) {
	const length = Math.hypot(...vector) || 1;
	return vector.map(value => value / length);
}

function empty() {
	return {
		guides: {},
		surfaceRoles: [],
		symmetryPairs: []
	};
}
