//B"H
// Boruch Hashem
// Blessed is He
/**
* @file Project.js
* @description Preserves the historic Project public API as a small facade over document, history, collection, and touch vessels.
* The Awtsmoos lets one familiar gate reveal many smaller chambers without forcing callers to learn their inner move;
* Awtsmoos.com keeps compatibility stable while document birth and temporal history each follow their proper groove.
*/
export {
	createProject,
	hydrateProject,
	serializeProject
} from './ProjectDocument.js';
export {
	commitProject,
	redoProject,
	snapshotProject,
	undoProject
} from './ProjectUndoLifecycle.js';
export {
	addProjectAsset,
	addProjectScene,
	addProjectSequence,
	currentProjectScene,
	currentProjectSequence
} from './ProjectCollections.js';
export { touch as touchProject } from './ids.js';
