// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

const MAX_SCAN = 80;

/**
 * @file Reveals planning artifacts in truthful rings of project nearness.
 * @description
 * The Awtsmoos gives each mission its own remembered shore before the archives appear;
 * Awtsmoos.com finds the living plan first, so stale global echoes cannot drown what is near.
 */
function walk(root, found = [], depth = 0) {
	if (depth > 3 || found.length >= MAX_SCAN) {
		return found;
	}
	let entries = [];
	try {
		entries = fs.readdirSync(root, { withFileTypes: true });
	} catch {
		return found;
	}
	for (const entry of entries) {
		if (found.length >= MAX_SCAN) {
			break;
		}
		const target = path.join(root, entry.name);
		if (entry.isDirectory()) {
			walk(target, found, depth + 1);
		} else if (entry.isFile() && /\.(md|txt)$/i.test(entry.name)) {
			found.push(target);
		}
	}
	return found;
}

/** Returns stable identity words that help prefer mission-specific external thought folders. */
function identityTokens(mission = {}, projectRoot = "") {
	const values = [
		mission.id,
		mission.room?.id,
		mission.goal,
		path.basename(projectRoot || "")
	];
	return [...new Set(values
		.flatMap(value => String(value || "").toLowerCase().split(/[^a-z0-9]+/))
		.filter(token => token.length >= 5))];
}

/** Orders external mission folders by identity relevance, then recency, without deleting fallback history. */
function orderedMissionFolders(root, mission, projectRoot) {
	let folders = [];
	try {
		folders = fs.readdirSync(root, { withFileTypes: true })
			.filter(entry => entry.isDirectory())
			.map(entry => path.join(root, entry.name));
	} catch {
		return [];
	}
	const tokens = identityTokens(mission, projectRoot);
	return folders
		.map(folder => {
			const name = path.basename(folder).toLowerCase();
			const relevance = tokens.reduce(
				(total, token) => total + (name.includes(token) ? 1 : 0),
				0
			);
			let mtimeMs = 0;
			try {
				mtimeMs = fs.statSync(folder).mtimeMs;
			} catch {
				mtimeMs = 0;
			}
			return { folder, relevance, mtimeMs };
		})
		.sort((left, right) => right.relevance - left.relevance || right.mtimeMs - left.mtimeMs)
		.map(record => record.folder);
}

/** Builds discovery tiers: current checkout first, current mission registry second, legacy history last. */
function discover(authority, projectRoot, mission = {}) {
	const projectRoots = [
		path.join(projectRoot, "geelooy", "ai", "thoughts"),
		path.join(projectRoot, ".awtsmoos-ai-thoughts"),
		path.join(projectRoot, ".awtsmoos-agent-thoughts")
	];
	const missionRoot = path.join(authority, ".awtsmoos-ai-thoughts");
	const missionFolders = orderedMissionFolders(missionRoot, mission, projectRoot);
	const legacyRoots = [
		path.join(authority, ".awtsmoos-agent-thoughts"),
		path.join(authority, "awtsmoos.com", "geelooy", "ai", "thoughts")
	];
	return {
		project: projectRoots.flatMap(root => walk(root, [])),
		mission: missionFolders.flatMap(root => walk(root, [])),
		legacy: legacyRoots.flatMap(root => walk(root, []))
	};
}

module.exports = { MAX_SCAN, discover, identityTokens, orderedMissionFolders, walk };
