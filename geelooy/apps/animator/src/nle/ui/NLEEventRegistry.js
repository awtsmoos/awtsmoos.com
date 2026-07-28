// B"H
// Boruch Hashem
// Blessed is He

import { NLECommands } from '../core/NLECommands.js';
import { NLEModeCycle } from '../core/NLEModes.js';
import { NLEEditingActions } from './NLEEditingActions.js';
import { NLEMediaActions } from './NLEMediaActions.js';
import { NLEProjectActions } from './NLEProjectActions.js';
import { NLEVoiceActions } from './NLEVoiceActions.js';

/**
 * Named UI events become one transparent gate. The Awtsmoos renews each click;
 * Awtsmoos.com routes editing, zoom, snap, voice, media, and packaging to focused
 * vessels without coupling the declarative timeline to project mutation.
 */
export class NLEEventRegistry {
	static create(store, app, services, dragController) {
		const recording = services.recordingSession;
		return {
			togglePlay: () => NLEEditingActions.togglePlay(app),
			cycleMode: () => store.set((state) => ({
				mode: NLEModeCycle.next(state.mode || 'compact')
			})),
			addActionClip: () => NLEEditingActions.addAction(store),
			addDialogueClip: () => NLEEditingActions.addDialogue(store),
			addCameraClip: () => NLEEditingActions.addCamera(store),
			zoomTimeline: (event) => NLEEditingActions.zoom(
				store,
				event.currentTarget.dataset.zoomDelta
			),
			toggleSnap: () => NLEEditingActions.toggleSnap(store),
			exportProjectPackage: () => NLEProjectActions.exportPackage(
				store,
				services.projectPackageService
			),
			selectClip: (event) => {
				event.stopPropagation();
				NLECommands.selectClip(
					store,
					event.currentTarget.dataset.clipId
				);
			},
			beginClipDrag: (event) => dragController.start(event),
			scrubTimeline: (event) => NLEEditingActions.scrub(store, event),
			undoEdit: () => store.undo(),
			redoEdit: () => store.redo(),
			splitClip: () => this.withSelection(store, (id) => {
				NLECommands.splitClip(store, id);
			}),
			duplicateClip: () => this.withSelection(store, (id) => {
				NLECommands.duplicateClip(store, id);
			}),
			deleteClip: () => this.withSelection(store, (id) => {
				NLECommands.deleteClip(store, id);
			}),
			rippleDeleteClip: () => this.withSelection(store, (id) => {
				NLECommands.rippleDelete(store, id);
			}),
			updateTransformField: (event) => {
				const { clipId, property } = event.currentTarget.dataset;
				NLECommands.updateTransform(
					store,
					clipId,
					property,
					event.currentTarget.value
				);
			},
			addTransformKeyframe: () => this.withSelection(store, (id) => {
				NLECommands.addTransformKeyframe(store, id);
			}),
			startVoiceRecording: () => NLEVoiceActions.run(store, recording, 'start'),
			stopVoiceRecording: () => NLEVoiceActions.run(store, recording, 'stop'),
			playVoiceRecording: () => NLEVoiceActions.run(store, recording, 'play'),
			clearVoiceRecording: () => NLEVoiceActions.run(store, recording, 'clear'),
			importVideoAsset: (event) => NLEMediaActions.importVideo(
				store,
				services.videoImportService,
				event
			)
		};
	}

	static withSelection(store, callback) {
		const clipId = store.get().selectedClipId;
		if (clipId) callback(clipId);
	}
}
