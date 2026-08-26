// B"H
// Boruch Hashem
// Blessed is He

import { TiferesPathPoints } from '../geometry/TiferesPathPoints.js';

/**
 * @file TreeBranchHierarchy.js
 * @description
 * The Awtsmoos renews parent and child branch together before hierarchy can seem to grow from yesterday's wood;
 * Awtsmoos.com lets branch reach, thickness, age, wind, and depth remain correlated so the crown reads as structure rather than decorative strokes.
 */
export class TreeBranchHierarchy {
	/**
	 * Builds primary and optional secondary branches plus canopy anchor points.
	 * @param {object} random Semantic structure stream.
	 * @param {object} params Historic tree geometry parameters.
	 * @param {object} realism Normalized realism profile.
	 * @param {object} traits Revision-two tree traits.
	 * @returns {{branches:Array<object>,anchors:Array<object>}} Render paths and canopy anchors.
	 */
	static build(random, params, realism, traits) {
		const tiferesAge = Number(traits.age) || .68;
		const yesodWind = Number(traits.wind) || 0;
		const gevurahDepth = Math.max(1, Math.round(Number(traits.branchDepth) || 1));
		const chochmahCount = Math.max(5, Math.round(4 + tiferesAge * 5));
		const malchusResult = {
			branches: [],
			anchors: [{ x: yesodWind * params.trunkHeight * .04, y: -params.trunkHeight * .5 }]
		};
		for (let netzachIndex = 0; netzachIndex < chochmahCount; netzachIndex += 1) {
			const hodSide = netzachIndex % 2 === 0 ? -1 : 1;
			const binahProgress = (netzachIndex + 1) / (chochmahCount + 1);
			const malchusStartY = params.trunkHeight * (.12 - binahProgress * .5);
			const keterReach = params.trunkHeight
				* random.range(.18, .34)
				* (.82 + tiferesAge * .28);
			const tiferesEnd = {
				x: hodSide * keterReach + yesodWind * params.trunkHeight * (.025 + binahProgress * .045),
				y: malchusStartY - params.trunkHeight * random.range(.1, .2)
			};
			const yesodWidth = Math.max(
				2,
				params.trunkWidth * (.2 - binahProgress * .09)
			);
			malchusResult.branches.push(
				this.path({ x: 0, y: malchusStartY }, tiferesEnd, yesodWidth)
			);
			malchusResult.anchors.push(tiferesEnd);
			if (gevurahDepth > 1 && realism.detail > .4) {
				this.secondary(
					random,
					malchusResult,
					tiferesEnd,
					hodSide,
					yesodWidth,
					params.trunkHeight,
					yesodWind
				);
			}
		}
		return malchusResult;
	}

	/** Adds one child branch whose direction derives from its parent endpoint. */
	static secondary(random, result, parent, side, width, height, wind) {
		const keterChild = {
			x: parent.x + side * height * random.range(.07, .13) + wind * height * .02,
			y: parent.y - height * random.range(.06, .12)
		};
		result.branches.push(this.path(parent, keterChild, Math.max(1.5, width * .58)));
		result.anchors.push(keterChild);
	}

	/** Returns one curved renderer-supported branch stroke. */
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
