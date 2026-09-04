//B"H
// Boruch Hashem
// Blessed is He
/**
* @file SceneOperations.js
* @description Owns deterministic scene lifecycle rules without knowing about DOM, AI, or any particular human surface.
* The Awtsmoos gives every scene one rooted identity while copies receive a newly kindled name;
* Awtsmoos.com keeps selection, duplication, renaming, and removal inside one project flame.
*/
import { cloneSourceNode } from '../graph/sourceNode.js';
import { clonePlain, makeId, touch } from './ids.js';
import { createSceneModel, touchScene } from './Scene.js';

/** Reveals one exact scene or rejects an operation aimed at a vanished vessel. */
export function requireProjectScene(project, sceneId) {
	const scene = project.scenes.find((candidate) => candidate.id === sceneId);
	if (!scene) {
		throw new Error(`Scene not found: ${sceneId}`);
	}
	return scene;
}

/** Makes one scene the canonical editing context without creating creative undo history by itself. */
export function selectProjectScene(project, sceneId) {
	const scene = requireProjectScene(project, sceneId);
	project.currentSceneId = scene.id;
	project.selection.sceneId = scene.id;
	project.selection.sourceId = null;
	touch(project);
	return scene;
}

/** Creates a detached editable scene copy with fresh source identities and the familiar visual offset. */
export function duplicateProjectScene(project, sceneId) {
	const sourceScene = requireProjectScene(project, sceneId);
	const sources = sourceScene.sources.map((source) => cloneSourceNode(source, {
		id: makeId(source.type || 'source'),
		x: Number(source.x || 0) + 24,
		y: Number(source.y || 0) + 24
	}));
	const scene = createSceneModel({
		name: `${sourceScene.name} Copy`,
		sources,
		audioBus: sourceScene.audioBus,
		filters: clonePlain(sourceScene.filters) || [],
		transitions: clonePlain(sourceScene.transitions) || [],
		parentSceneId: sourceScene.parentSceneId
	});
	project.scenes.push(scene);
	selectProjectScene(project, scene.id);
	return scene;
}

/** Renames one scene while preserving its stable identity and all creative descendants. */
export function renameProjectScene(project, sceneId, name) {
	const scene = requireProjectScene(project, sceneId);
	const nextName = String(name || '').trim();
	if (!nextName) {
		throw new Error('Scene name is required.');
	}
	scene.name = nextName;
	touchScene(scene);
	touch(project);
	return scene;
}

/** Removes one scene while preserving the invariant that every project retains a living scene. */
export function deleteProjectScene(project, sceneId) {
	if (project.scenes.length <= 1) {
		throw new Error('A project must keep at least one scene.');
	}
	const scene = requireProjectScene(project, sceneId);
	const index = project.scenes.indexOf(scene);
	project.scenes.splice(index, 1);
	const selectionWasRemoved = project.selection.sceneId === scene.id;
	if (project.currentSceneId === scene.id || selectionWasRemoved) {
		const fallbackIndex = Math.min(index, project.scenes.length - 1);
		selectProjectScene(project, project.scenes[fallbackIndex].id);
	} else {
		touch(project);
	}
	return {
		id: scene.id,
		name: scene.name,
		currentSceneId: project.currentSceneId
	};
}
