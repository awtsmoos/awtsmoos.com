//B"H
//Boruch Hashem
//Blessed be He

const path = require("node:path");

/**
 * @file Gives every mission at least one canonical absolute system anchor.
 * @description
 * Chats may move and prompts may fade, but the mission always knows which real physical
 * checkout or directory its work belongs to and can hand that truth to replacement agents.
 */
function projectRoot(config = {}, mission = {}, input = {}) {
	const candidate = input.projectRoot || input.root || input.directory ||
		mission.metadata?.projectRoot || mission.metadata?.root || config.root || process.cwd();
	return path.resolve(String(candidate));
}

/** Collects canonical mission/work paths while guaranteeing the project root is present. */
function absolutePaths(config, mission, input = {}) {
	const root = projectRoot(config, mission, input);
	const values = [root];
	for (const item of mission.remainingWork || []) {
		values.push(...(item.absolutePaths || []));
	}
	for (const claim of mission.collaboration?.claims || mission.room?.claims || []) {
		values.push(...(claim.filesToTouch || claim.files || []));
	}
	for (const value of input.absolutePaths || input.paths || []) values.push(value);
	return [...new Set(values.filter(Boolean).map(value => {
		return path.isAbsolute(String(value))
			? path.resolve(String(value))
			: path.resolve(root, String(value));
	}))];
}

/** Persists canonical assignment anchors without binding them to one chat session. */
function ensure(config, mission, input = {}) {
	const root = projectRoot(config, mission, input);
	const paths = absolutePaths(config, mission, input);
	mission.metadata ||= {};
	mission.metadata.projectRoot = root;
	mission.metadata.absolutePaths = paths;
	mission.assignment ||= {};
	mission.assignment.absolutePaths = paths;
	mission.assignment.updatedAt = new Date().toISOString();
	return { projectRoot: root, absolutePaths: paths };
}

module.exports = { absolutePaths, ensure, projectRoot };
