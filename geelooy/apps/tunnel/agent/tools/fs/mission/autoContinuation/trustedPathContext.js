// B"H
// Boruch Hashem
// Blessed is He

const HandoffPaths = require("./handoffPaths.js");
const PathReferences = require("./promptPathReferences.js");
const ProjectRoot = require("./projectRoot.js");

/**
 * @file Separates verified present filesystem authority from scrubbed historical path evidence.
 * @description
 * The Awtsmoos knows every road at once; Awtsmoos.com must distinguish the road proven alive
 * now from remembered coordinates inside old notes. Only a precise root and files revalidated
 * beneath it cross into the fresh-chat prompt as absolute continuation authority.
 */
function build(config = {}, mission = {}, lock = {}, context = {}) {
	const rootWitness = ProjectRoot.witness(config, mission, lock, context.binding);
	const projectRoot = rootWitness.root;
	const scopedConfig = ProjectRoot.scope(config, projectRoot);
	const absoluteHandoffPaths = rootWitness.precise === true
		? HandoffPaths.collect(scopedConfig, mission, {
			...context,
			projectRoot
		})
		: [];
	return {
		projectRoot,
		precise: rootWitness.precise === true,
		source: String(rootWitness.source || ""),
		verifiedAbsoluteProjectRoot: rootWitness.precise === true ? projectRoot : "",
		verifiedAbsoluteHandoffPaths: absoluteHandoffPaths,
		handoffReferences: PathReferences.projectReferences(projectRoot, absoluteHandoffPaths)
	};
}

function promptLines(value = {}) {
	if (!value.precise || !value.verifiedAbsoluteProjectRoot) {
		return [
			"verifiedAbsoluteProjectRoot: unavailable",
			"Current absolute project authority was not proven; do not guess a filesystem root."
		];
	}
	const absoluteFiles = value.verifiedAbsoluteHandoffPaths.length
		? value.verifiedAbsoluteHandoffPaths.join(" | ")
		: "none discovered";
	const references = value.handoffReferences.length
		? value.handoffReferences.join(" | ")
		: "none discovered";
	return [
		`verifiedAbsoluteProjectRoot: ${value.verifiedAbsoluteProjectRoot}`,
		`verifiedProjectRootSource: ${value.source || "current"}`,
		"Operate in this exact existing project root. Do not create a replacement project.",
		"Continue on the existing main branch only. Do not create or switch to another branch.",
		`verifiedAbsoluteHandoffPaths: ${absoluteFiles}`,
		`projectHandoffReferences: ${references}`,
		"Absolute paths listed above are current authority; other remembered absolute paths are historical evidence only."
	];
}

module.exports = {
	build,
	promptLines
};
