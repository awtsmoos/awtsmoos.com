// B"H
// Boruch Hashem
// Blessed is He

import { NLECommands } from '../core/NLECommands.js';
import { NLETemplate } from './NLETemplate.js';

/**
 * Small editing gestures receive their own vessel. The Awtsmoos joins adding,
 * scrubbing, camera choices, and selected entities without crowding the mount.
 */
export class NLEEditingActions {
	static togglePlay(app) {
		if (app?.director?.isPlaying && app.director.pause) app.director.pause();
		else app?.director?.resume?.();
	}

	static addAction(store) {
		NLECommands.addClip(store, {
			trackId: 'track_action',
			entityId: store.get().selectedEntityId,
			start: store.get().playhead,
			type: 'action',
			name: 'Walk + Wave + Talk',
			duration: 1600,
			payload: { action: 'walk', gesture: 'wave', speech: true, sequenceId: null }
		});
	}

	static addDialogue(store) {
		const clip = NLECommands.addClip(store, {
			trackId: 'track_dialogue',
			entityId: store.get().selectedEntityId,
			start: store.get().playhead,
			type: 'dialogue',
			name: 'New Dialogue',
			duration: 2200,
			payload: {
				text: 'B"H, this line is ready for your voice.',
				voiceStatus: 'empty',
				sequenceId: null
			}
		});
		NLECommands.selectClip(store, clip.id);
	}

	static addCamera(store) {
		NLECommands.addClip(store, {
			trackId: 'track_camera',
			start: store.get().playhead,
			type: 'camera',
			name: 'Close Up',
			duration: 1400,
			payload: {
				size: 'closeUp',
				angle: 'eyeLevel',
				transition: 'cut',
				sequenceId: null
			}
		});
	}

	static scrub(store, event) {
		if (!event.currentTarget.classList.contains('aw-nle-clips')) return;
		const rectangle = event.currentTarget.getBoundingClientRect();
		const pixelsPerMs = NLETemplate.pixelsPerMs(store.get());
		const timeMs = (event.clientX - rectangle.left) / Math.max(0.0001, pixelsPerMs);
		NLECommands.scrub(store, timeMs);
	}
}
