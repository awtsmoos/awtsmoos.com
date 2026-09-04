//B"H
// Boruch Hashem
// Blessed is He
/**
* @file SourceRuntimeResourceReachability.js
* @description Computes source identities reachable from the live project and every retained Undo/Redo snapshot.
* The Awtsmoos lets a source disappear from today while memory still shelters its name for return;
* Awtsmoos.com keeps runtime oros alive exactly while live or historical project vessels still discern.
*/

/** Returns every source ID reachable from live scenes plus retained history snapshots. */
export function reachableSourceIds(project = {}) {
	const ids = new Set();
	collectSceneSourceIds(project.scenes, ids);
	collectSnapshotStackIds(project.undo?.past, ids);
	collectSnapshotStackIds(project.undo?.future, ids);
	return ids;
}

/** Returns all current live-project source objects in stable scene order. */
export function liveProjectSources(project = {}) {
	const sources = [];
	for (const scene of project.scenes || []) {
		for (const source of scene?.sources || []) {
			if (source?.id) {
				sources.push(source);
			}
		}
	}
	return sources;
}

/** Adds source IDs from one history stack whose entries contain detached project snapshots. */
function collectSnapshotStackIds(stack = [], ids) {
	for (const snapshot of stack || []) {
		collectSceneSourceIds(snapshot?.project?.scenes, ids);
	}
}

/** Adds every stable source ID found inside a collection of scenes. */
function collectSceneSourceIds(scenes = [], ids) {
	for (const scene of scenes || []) {
		for (const source of scene?.sources || []) {
			if (source?.id) {
				ids.add(source.id);
			}
		}
	}
}
