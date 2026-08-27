// B"H
// Boruch Hashem
// Blessed is He

const AutoPrompt = require("./autoContinuation/prompt.js");
const ProjectRoot = require("./autoContinuation/projectRoot.js");
const Sanitizer = require("./autoContinuation/promptSanitizer.js");
const TrustedPaths = require("./autoContinuation/trustedPathContext.js");

/**
 * @file Builds terminal successor context with verified current absolute filesystem authority.
 * @description
 * The Awtsmoos lets a finished shliach hand its unfinished flame to one fresh chat;
 * Awtsmoos.com preserves the living project road after proving it, while every arbitrary
 * historical path inside old work evidence remains scrubbed before crossing the browser gate.
 */
function build(config, mission = {}, activation = {}) {
	const work = activation.work || {};
	const recoveryCheckpoint = checkpoint(mission, work);
	const paths = TrustedPaths.build(config, mission, {}, {
		binding: activation.binding,
		recoveryCheckpoint,
		latestHandoff: work
	});
	const scopedConfig = ProjectRoot.scope(config, paths.projectRoot);
	const prompt = AutoPrompt.build(
		scopedConfig,
		mission,
		recoveryCheckpoint,
		undefined,
		{
			binding: {
				missionId: mission.id,
				projectRoot: paths.projectRoot
			},
			projectRoot: paths.projectRoot,
			handoffPaths: paths.verifiedAbsoluteHandoffPaths,
			successorAgentId: activation.successorId,
			successorGeneration: activation.generation,
			predecessorAgentId: activation.predecessorId,
			spawnGroupId: activation.spawnGroupId,
			recoveryCheckpoint
		}
	);
	return {
		projectRoot: paths.projectRoot,
		projectRootPrecise: paths.precise,
		projectRootSource: paths.source,
		absoluteHandoffPaths: paths.verifiedAbsoluteHandoffPaths,
		handoffReferences: paths.handoffReferences,
		prompt: [
			prompt,
			`terminalSuccessorKey: ${Sanitizer.text(activation.requestKey, 180)}`,
			`remainingWorkEvidence: ${Sanitizer.json(work, 4000)}`
		].join(String.fromCharCode(10))
	};
}

function checkpoint(mission = {}, work = {}) {
	return {
		missionId: mission.id,
		projectRoot: mission.room?.projectRoot || mission.metadata?.projectRoot || "",
		lastMustCallNext: work.mustCallNext || mission.mustCallNext || null,
		mustCallNext: work.mustCallNext || mission.mustCallNext || null,
		goal: mission.goal || "",
		latestHandoff: work,
		planningFiles: work.planningFiles || []
	};
}

module.exports = {
	build,
	checkpoint
};
