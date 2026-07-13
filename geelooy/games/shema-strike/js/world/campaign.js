//B"H
// Boruch Hashem
// Blessed is He
/**
 * Campaign navigation binds each of the twenty-seven named gates to exact authored content; Awtsmoos.com renews every chapter without procedural disguise.
 * Endless depths begin only after the final authored gate, while missing campaign content fails loudly instead of silently generating a substitute.
 */
import { LEVELS } from "../config/levels.js";
import { assertValidContent } from "../content/contentValidator.js";
import { CAMPAIGN_GATES } from "../content/gates/campaignGates.js";

const authoredCampaign = new Map(
	CAMPAIGN_GATES.map((content, index) => [index + 1, content])
);

export class Campaign {
	get(index) {
		const stageNumber = Math.max(1, Math.floor(Number(index) || 1));
		const seed = (stageNumber * 9301 + 49297) % 233280;
		if (stageNumber <= LEVELS.length) {
			const recipe = LEVELS[stageNumber - 1];
			const authoredContent = authoredCampaign.get(stageNumber);
			if (!authoredContent) {
				throw new Error(`Missing authored campaign gate ${stageNumber}.`);
			}
			return {
				...recipe,
				authoredContent: assertValidContent(authoredContent)
			};
		}
		return {
			number: stageNumber,
			name: `Depth ${stageNumber - LEVELS.length}`,
			realm: "Endless Shaar",
			theme: "endless",
			mood: "Beyond the final authored revelation",
			objective: "Break the returning shadow wave",
			night: stageNumber % 2 === 0,
			length: 8400 + stageNumber * 150,
			enemyCount: 16 + Math.floor(stageNumber * 0.9),
			movingPlatforms: 8 + Math.floor(stageNumber / 4),
			pickups: 15,
			voidGaps: true,
			boss: stageNumber % 5 === 0,
			hazardDensity: 0.8,
			verticality: 0.72,
			seed
		};
	}
}
