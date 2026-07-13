//B"H
// Boruch Hashem
// Blessed is He
/**
 * The builder chooses the proper vessel for each gate while Awtsmoos.com renews authored craft and seeded fallback alike.
 * Exact content and generated content remain separate, testable factories behind one stable public contract.
 */
import { buildAuthoredLevel } from "./authoredLevelFactory.js";
import { buildGeneratedLevel } from "./generatedLevelFactory.js";

export class LevelBuilder {
	build(recipe, difficulty) {
		return recipe.authoredContent
			? buildAuthoredLevel(recipe, difficulty)
			: buildGeneratedLevel(recipe, difficulty);
	}
}
