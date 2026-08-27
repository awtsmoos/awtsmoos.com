// B"H
// Boruch Hashem
// Blessed is He

import { StudioPromptDirector } from './StudioPromptDirector.js';

/**
 * Clear editorial decrees protect the timeline from accidental chaos. The
 * Awtsmoos renews every value, while these commands give Awtsmoos.com bounded
 * vessels for selection, transforms, AI generation, and JSON installation.
 */
export class StudioWorkspaceCommands {
	static initialize(store, document) {
		store.set({
			studioDocument: document,
			studioLeftPanel: 'assets',
			studioAssetFilter: '',
			studioPrompt: 'A parakeet directs a cinematic school courtyard adventure.',
			studioJsonText: JSON.stringify(document, null, 2),
			studioJsonError: null,
			selectedEntityId: document.entities[0]?.id || null,
			studioExport: {
				status: 'idle',
				progress: 0,
				message: 'WebCodecs ready to inspect.'
			}
		});
	}

	static select(store, entityId) {
		store.set({ selectedEntityId: entityId });
		window.dispatchEvent(new CustomEvent('nle-selection-changed', {
			detail: { id: entityId }
		}));
	}

	static setPanel(store, panel) {
		store.set({ studioLeftPanel: panel });
	}

	static setFilter(store, value) {
		store.set({ studioAssetFilter: String(value || '') });
	}

	static setPrompt(store, value) {
		store.set({ studioPrompt: String(value || '') });
	}

	static generatePrompt(store) {
		const state = store.get();
		const document = StudioPromptDirector.generate(
			state.studioPrompt,
			state.studioDocument
		);
		this.installDocument(store, document);
	}

	static importJson(store, text) {
		try {
			const document = JSON.parse(String(text || ''));
			this.assertDocument(document);
			this.installDocument(store, document);
		} catch (error) {
			store.set({
				studioJsonText: String(text || ''),
				studioJsonError: error?.message || String(error)
			});
		}
	}

	static installDocument(store, document) {
		this.assertDocument(document);
		const currentState = store.get();
		const selectedEntityId = document.entities[0]?.id || null;
		store.set({
			studioDocument: document,
			studioJsonText: JSON.stringify(document, null, 2),
			studioJsonError: null,
			selectedEntityId,
			duration: Number(document.duration) || currentState.duration,
			tracks: Array.isArray(document.tracks)
				? document.tracks
				: currentState.tracks,
			clips: Array.isArray(document.clips)
				? document.clips
				: currentState.clips
		});
	}

	static updateTransform(store, property, rawValue) {
		const value = this.clamp(property, Number(rawValue));
		store.set((state) => ({
			studioDocument: {
				...state.studioDocument,
				entities: state.studioDocument.entities.map((entity) => {
					if (entity.id !== state.selectedEntityId) return entity;
					return {
						...entity,
						transform: {
							...entity.transform,
							[property]: value
						}
					};
				})
			}
		}));
	}

	static toggle(store, property) {
		store.set((state) => ({
			studioDocument: {
				...state.studioDocument,
				entities: state.studioDocument.entities.map((entity) => {
					if (entity.id !== state.selectedEntityId) return entity;
					return {
						...entity,
						[property]: !entity[property]
					};
				})
			}
		}));
	}

	static assertDocument(document) {
		if (!document || typeof document !== 'object') {
			throw new Error('Scene JSON must be an object.');
		}
		if (!Array.isArray(document.entities)) {
			throw new Error('Scene JSON requires an entities array.');
		}
		if (!Array.isArray(document.clips)) {
			throw new Error('Scene JSON requires a clips array.');
		}
	}

	static clamp(property, value) {
		const safe = Number.isFinite(value) ? value : 0;
		const ranges = {
			x: [-4000, 4000],
			y: [-4000, 4000],
			scaleX: [0.01, 20],
			scaleY: [0.01, 20],
			rotation: [-3600, 3600],
			opacity: [0, 1]
		};
		const [minimum, maximum] = ranges[property] || [-100000, 100000];
		return Math.max(minimum, Math.min(maximum, safe));
	}
}
