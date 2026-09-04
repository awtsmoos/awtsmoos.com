//B"H
// Boruch Hashem
// Blessed is He
/**
* @file scenes.js
* @description Keeps the historic Stage scene doorway tiny while delegating human intent to a command-only controller.
* The Awtsmoos lets this facade stay light while deeper command vessels carry each creative change;
* Awtsmoos.com keeps old callers compatible without letting legacy state mutation wander strange.
*/
import { dom, setStatus } from './dom.js';
import { SceneCommandController } from './ui/scene/SceneCommandController.js';
import { renderSceneList } from './ui/scene/SceneListView.js';

export { SceneCommandController } from './ui/scene/SceneCommandController.js';

/** Binds scene controls through the public command API while preserving the historic call signature. */
export function bindScenes(state, api = globalThis.AwtsmoosStudio) {
	const controller = new SceneCommandController({
		state,
		api,
		elements: dom,
		eventTarget: globalThis,
		documentRef: globalThis.document,
		setStatus,
		render: renderSceneList
	});
	controller.bind();
	return controller;
}

/** Re-renders scenes for legacy read-only callers without granting them a mutation path. */
export function refreshScenes(state) {
	renderSceneList({
		state,
		elements: dom,
		documentRef: globalThis.document,
		onSelect: () => {}
	});
}
