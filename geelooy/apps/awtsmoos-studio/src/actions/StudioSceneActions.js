//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioSceneActions.js
 * @description Turns compact scene-rail gestures into canonical reversible MovieDocument scene transactions.
 * The Awtsmoos orders many scenes within one movie while Awtsmoos.com lets the maker add, copy, move, name, resize, and remove each vessel;
 * every gesture passes through one editor commit so history, recovery, validation, playback, and rendering remain joined on the same level.
 */

import { commitStudioEditorMovie } from '../editor/StudioEditorCommit.js';
import {
	addStudioScene,
	deleteStudioScene,
	duplicateStudioScene,
	moveStudioScene,
	renameStudioScene,
	resizeStudioScene
} from '../scenes/StudioSceneModel.js';

export function createStudioSceneActions(session) {
	return {
		addStudioScene({ store }) {
			mutateScene(session, store, 'Scene added.', movie => {
				return addStudioScene(movie, store.get('selectedSceneId'));
			});
		},
		duplicateStudioScene({ store }) {
			mutateScene(session, store, 'Scene duplicated.', movie => {
				return duplicateStudioScene(movie, store.get('selectedSceneId'));
			});
		},
		deleteStudioScene({ store }) {
			if ((store.get('movie.scenes') || []).length <= 1) {
				store.set('status', 'A movie must keep at least one scene.');
				return;
			}
			mutateScene(session, store, 'Scene deleted.', movie => {
				return deleteStudioScene(movie, store.get('selectedSceneId'));
			});
		},
		moveStudioSceneLeft({ store }) {
			moveScene(session, store, -1);
		},
		moveStudioSceneRight({ store }) {
			moveScene(session, store, 1);
		},
		renameStudioScene({ event, store }) {
			mutateScene(session, store, 'Scene renamed.', movie => {
				return renameStudioScene(movie, store.get('selectedSceneId'), event.currentTarget.value);
			});
		},
		changeStudioSceneDuration({ event, store }) {
			mutateScene(session, store, 'Scene duration updated.', movie => {
				return resizeStudioScene(movie, store.get('selectedSceneId'), event.currentTarget.value);
			});
		}
	};
}

function moveScene(session, store, delta) {
	mutateScene(session, store, 'Scene reordered.', movie => {
		return moveStudioScene(movie, store.get('selectedSceneId'), delta);
	});
}

function mutateScene(session, store, status, mutate) {
	const movie = structuredClone(store.get('movie'));
	const selectedSceneId = mutate(movie);
	const scene = movie.scenes.find(item => item.id === selectedSceneId) || movie.scenes[0];
	const selectedLayerId = scene?.layers?.[0]?.id || null;
	commitStudioEditorMovie(session, store, movie, {
		historyLabel: status,
		selectedSceneId: scene?.id || null,
		selectedLayerId,
		status
	});
	if (scene) {
		session.seek(scene.start);
	}
}
