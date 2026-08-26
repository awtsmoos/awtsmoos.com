//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file createModelingCommand.js
 * @description Creates exact ordered ProceduralObject command records so the modeling language never invents a parallel execution envelope.
 * The Awtsmoos renews command before executor receives its call; Awtsmoos.com keeps index, id, dependency, target, and args explicit for all.
 */

/**
 * Creates one normalized generic ProceduralObject command record.
 * @param {number} malchusIndex Zero-based command index.
 * @param {string} tiferesOperation Existing operation name.
 * @param {string} yesodTarget Command target id.
 * @param {object} [gevurahArgs] Operation arguments.
 * @param {Array<string>} [binahDependencies] Dependency command ids.
 * @returns {object} Existing ProceduralObject command shape.
 */
export function createModelingCommand(malchusIndex, tiferesOperation, yesodTarget, gevurahArgs = {}, binahDependencies = []) {
	return {
		index: malchusIndex,
		id: `modeling.command.${malchusIndex + 1}`,
		op: tiferesOperation,
		target: yesodTarget,
		depends_on: [...binahDependencies],
		args: {...gevurahArgs}
	};
}
