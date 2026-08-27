// B"H
// Boruch Hashem
// Blessed is He

import { MoviePerformanceTrackResolver } from './MoviePerformanceTrackResolver.js';

/**
 * Every edit event receives the same transform vessel here. The Awtsmoos joins
 * camera, dialogue, bubbles, poses, props, performances, and media while
 * Awtsmoos.com routes every clip to an existing editable track.
 */
export class MovieClipFactory {
	static clip(clip) {
		return {
			entityId: null,
			transform: {
				x: 0,
				y: 0,
				scale: 1,
				rotation: 0,
				opacity: 1,
				anchor: [0.5, 0.5]
			},
			...clip
		};
	}

	static sequence(sequence) {
		return this.clip({
			id: `composition_${sequence.id}`,
			trackId: 'track_composition',
			start: sequence.start,
			duration: sequence.duration,
			type: 'composition',
			name: sequence.name,
			payload: {
				sequenceId: sequence.id,
				transition: sequence.transition,
				nested: true
			}
		});
	}

	static shot(shot) {
		return this.clip({
			id: `camera_${shot.id}`,
			trackId: 'track_camera',
			start: shot.start,
			duration: shot.duration,
			type: 'camera',
			name: `${shot.camera.size} ${shot.camera.angle}`,
			payload: {
				...shot.camera,
				sequenceId: shot.sequenceId,
				transition: shot.transition,
				continuity: shot.continuity
			}
		});
	}

	static dialogue(line) {
		return this.clip({
			id: `dialogue_${line.id}`,
			trackId: 'track_dialogue',
			entityId: line.speakerId,
			start: line.start,
			duration: line.duration,
			type: 'dialogue',
			name: `${line.speakerName}: ${line.text.slice(0, 28)}`,
			payload: { ...line }
		});
	}

	static bubble(line) {
		return this.clip({
			id: `bubble_${line.id}`,
			trackId: 'track_titles',
			entityId: line.speakerId,
			start: line.start,
			duration: line.duration,
			type: 'bubble',
			name: `Bubble: ${line.text.slice(0, 24)}`,
			payload: {
				text: line.text,
				speakerId: line.speakerId,
				sequenceId: line.sequenceId,
				displayMode: line.displayMode
			}
		});
	}

	static performance(performance) {
		return this.clip({
			id: performance.id,
			trackId: MoviePerformanceTrackResolver.resolve(
				performance.type
			),
			entityId: performance.characterId,
			start: performance.start,
			duration: performance.duration,
			type: performance.type,
			name: performance.name,
			payload: {
				...performance.payload,
				sequenceId: performance.sequenceId
			}
		});
	}

	static asset(asset) {
		return this.clip({
			id: asset.id,
			trackId: asset.trackId,
			start: asset.start,
			duration: asset.duration,
			type: asset.type,
			name: asset.name,
			payload: asset.payload
		});
	}
}
