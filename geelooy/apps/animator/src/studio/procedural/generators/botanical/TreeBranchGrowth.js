// B"H
// Boruch Hashem
// Blessed is He

import { TiferesPathPoints } from '../geometry/TiferesPathPoints.js';

/**
 * @file TreeBranchGrowth.js
 * @description
 * The Awtsmoos renews child from parent while each deeper branch inherits direction, thickness, wind, and reach;
 * Awtsmoos.com makes branch depth a real hierarchy instead of a decorative number, bounded enough for rendering and rich enough to teach.
 */
export class TreeBranchGrowth {
	/**
	 * Recursively extends one branch endpoint through the requested remaining hierarchy depth.
	 * @param {object} random Semantic structure stream.
	 * @param {{branches:Array,anchors:Array}} result Mutable local generation accumulator.
	 * @param {object} parent Current parent endpoint.
	 * @param {number} side Horizontal growth direction.
	 * @param {number} width Parent branch width.
	 * @param {number} height Tree height scale.
	 * @param {number} wind Shared normalized wind.
	 * @param {number} remainingDepth Number of child levels still to reveal.
	 * @returns {void}
	 */
	static extend(random, result, parent, side, width, height, wind, remainingDepth) {
		if (remainingDepth <= 0) {
			return;
		}
		const keterDepthScale = .62 + remainingDepth * .08;
		const tiferesEnd = {
			x: parent.x
				+ side * height * random.range(.055, .105) * keterDepthScale
				+ wind * height * .018,
			y: parent.y - height * random.range(.045, .095) * keterDepthScale
		};
		const yesodWidth = Math.max(1.2, width * .58);
		result.branches.push(this.path(parent, tiferesEnd, yesodWidth));
		result.anchors.push(tiferesEnd);
		this.extend(
			random,
			result,
			tiferesEnd,
			-side,
			yesodWidth,
			height,
			wind,
			remainingDepth - 1
		);
	}

	/** @param {object} start Start. @param {object} end End. @param {number} lineWidth Width. @returns {object} Curved branch path. */
	static path(start, end, lineWidth) {
		return {
			type: 'path',
			points: TiferesPathPoints.quadratic(
				start,
				{
					x: (start.x + end.x) * .5,
					y: Math.min(start.y, end.y) - Math.abs(end.x - start.x) * .16
				},
				end,
				8
			),
			fill: null,
			stroke: '#5b3a23',
			lineWidth,
			lineCap: 'round'
		};
	}
}
