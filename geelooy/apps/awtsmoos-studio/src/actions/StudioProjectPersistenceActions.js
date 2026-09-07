//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioProjectPersistenceActions.js
 * @description Makes New, Save, Save As, Open, and recovery real against canonical MovieDocument JSON in browser-local Studio storage.
 * The Awtsmoos renews the movie while Awtsmoos.com lets the maker intentionally preserve, reopen, duplicate, or recover the revealed vessel;
 * project metadata stays outside MovieDocument, while the saved movie remains the same canonical truth used by preview, timeline, and export level.
 */

import { commitStudioEditorMovie } from '../editor/StudioEditorCommit.js';
import { createStudioBlankMovie } from '../projects/StudioBlankMovie.js';

export function createStudioProjectPersistenceActions(session) {
	return {
		updateProjectTitle({ event, store }) {
			store.set('projectTitleDraft', event.currentTarget.value);
		},
		newStudioMovie({ store }) {
			if (!confirmReset()) return;
			const movie = createStudioBlankMovie(store.get('movie'), { title: store.get('projectTitleDraft') || 'Untitled Movie' });
			session.loadMovie(movie, 'New movie created.');
			projectTransient(store, session, null, movie.title, true);
		},
		saveStudioProject({ store }) {
			saveProject(session, store, false);
		},
		saveStudioProjectAs({ store }) {
			saveProject(session, store, true);
		},
		openStudioProject({ event, store }) {
			try {
				const id = event.currentTarget.dataset.projectId;
				const movie = session.project.load(id);
				session.loadMovie(movie, 'Saved movie reopened.');
				projectTransient(store, session, id, movie.title, false);
			} catch (error) {
				store.set('status', `Open failed: ${error.message}`);
			}
		},
		restoreStudioRecovery({ store }) {
			try {
				const movie = session.project.recover();
				if (!movie) return store.set('status', 'No recovery movie is available.');
				session.loadMovie(movie, 'Recovered the latest local Studio movie.');
				projectTransient(store, session, null, movie.title, true);
			} catch (error) {
				store.set('status', `Recovery failed: ${error.message}`);
			}
		}
	};
}

function saveProject(session, store, saveAs) {
	try {
		const title = String(store.get('projectTitleDraft') || store.get('movie.title') || 'Untitled Movie').trim() || 'Untitled Movie';
		const movie = structuredClone(store.get('movie'));
		if (movie.title !== title) {
			movie.title = title;
			commitStudioEditorMovie(session, store, movie, { historyLabel: 'Project renamed.', status: 'Project renamed.' });
		}
		const entry = session.project.save(store.get('movie'), {
			id: saveAs ? null : store.get('projectId'),
			title
		});
		projectTransient(store, session, entry.id, title, false);
		store.set('status', saveAs ? 'Movie saved as a new project.' : 'Movie saved.');
	} catch (error) {
		store.set('status', `Save failed: ${error.message}`);
	}
}

function projectTransient(store, session, id, title, dirty) {
	store.update(state => {
		state.projectId = id;
		state.projectTitleDraft = title;
		state.dirty = dirty;
		state.savedProjects = session.project.list();
		state.recoveryAvailable = session.project.hasRecovery();
		state.canUndo = session.project.canUndo();
		state.canRedo = session.project.canRedo();
	});
}

function confirmReset() {
	return typeof globalThis.confirm !== 'function' || globalThis.confirm('Create a new movie? Unsaved changes remain recoverable locally.');
}
