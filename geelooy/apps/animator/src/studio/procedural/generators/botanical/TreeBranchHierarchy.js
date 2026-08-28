// B"H
// Boruch Hashem
// Blessed is He

import { TreeBranchGrowth } from './TreeBranchGrowth.js';

/**
 * @file TreeBranchHierarchy.js
 * @description
 * The Awtsmoos renews trunk junction, parent branch, child branch, and crown anchor as one ordered growth story;
 * Awtsmoos.com keeps primary placement separate from recursive child growth so depth three becomes real structure without making one file a forest.
 */
export class TreeBranchHierarchy {
	/**
	 * Builds primary branches and delegates deeper hierarchy to the focused growth engine.
	 * @param {object} random Semantic structure stream.
	 * @param {object} params Historic tree geometry parameters.
	 * @param {object} realism Normalized realism profile.
	 * @param {object} traits Revision-two tree traits.
	 * @returns {{branches:Array<object>,anchors:Array<object>}} Branch paths and canopy anchors.
	 */
	static build(random, params, realism, traits) {
		const tiferesAge = Number(traits.age) || .68;
		const yesodWind = Number(traits.wind) || 0;
		const gevurahDepth = Math.max(1, Math.round(Number(traits.branchDepth) || 1));
		const chochmahCount = Math.max(5, Math.round(4 + tiferesAge * 5));
		const malchusResult = {
			branches: [],
			anchors: [{
				x: yesodWind * params.trunkHeight * .04,
				y: -params.trunkHeight * .5
			}]
		};
		for (let netzachIndex = 0; netzachIndex < chochmahCount; netzachIndex += 1) {
			const hodSide = netzachIndex % 2 === 0 ? -1 : 1;
			const binahProgress = (netzachIndex + 1) / (chochmahCount + 1);
			const malchusStart = {
				x: 0,
				y: params.trunkHeight * (.12 - binahProgress * .5)
			};
			const keterReach = params.trunkHeight
				* random.range(.18, .34)
				* (.82 + tiferesAge * .28);
			const tiferesEnd = {
				x: hodSide * keterReach
					+ yesodWind * params.trunkHeight * (.025 + binahProgress * .045),
				y: malchusStart.y - params.trunkHeight * random.range(.1, .2)
			};
			const yesodWidth = Math.max(
				2,
				params.trunkWidth * (.2 - binahProgress * .09)
			);
			malchusResult.branches.push(
				TreeBranchGrowth.path(malchusStart, tiferesEnd, yesodWidth)
			);
			malchusResult.anchors.push(tiferesEnd);
			if (realism.detail > .4) {
				TreeBranchGrowth.extend(
					random,
					malchusResult,
					tiferesEnd,
					hodSide,
					yesodWidth,
					params.trunkHeight,
					yesodWind,
					gevurahDepth - 1
				);
			}
		}
		return malchusResult;
	}
}
