// B"H
// Boruch Hashem
// Blessed is He

import { ProjectPackageConstants } from '../../src/nle/project/ProjectPackageConstants.js';
import { PackagedMediaFixtureFiles } from './PackagedMediaFixtureFiles.js';

/**
 * Reproducible media receives real NLE timing here. The Awtsmoos joins manifest
 * and bytes; Awtsmoos.com can therefore test imported picture and recorded voice
 * through the same references used by a browser-created project.
 */
export class PackagedMediaFixtureManifest {
	static create(paths, settings) {
		const video = PackagedMediaFixtureFiles.descriptor(paths.sourceVideoPath, {
			id: 'fixture-video',
			kind: 'video',
			clipId: null,
			assetId: 'fixture-video',
			mimeType: 'video/mp4',
			durationMs: 2500,
			width: settings.width,
			height: settings.height,
			fileName: 'fixture-video.mp4'
		});
		const dialogue = PackagedMediaFixtureFiles.descriptor(paths.dialoguePath, {
			id: 'recording:dialogue_fixture',
			kind: 'dialogue',
			clipId: 'dialogue_fixture',
			assetId: null,
			mimeType: 'audio/wav',
			durationMs: 1000,
			trimStartMs: 0,
			trimEndMs: 1000,
			gain: 1
		});
		return {
			schemaVersion: ProjectPackageConstants.schemaVersion,
			project: {
				id: 'packaged_media_fixture',
				title: 'Packaged Media Proof',
				durationMs: 6000,
				createdAt: '2026-07-13T15:00:00.000Z'
			},
			settings,
			productionPlan: { id: 'packaged_media_fixture', settings },
			timeline: {
				durationMs: 6000,
				tracks: [
					{ id: 'track_video', type: 'video' },
					{ id: 'track_dialogue', type: 'dialogue' }
				],
				clips: [this.videoClip(), this.dialogueClip()],
				keyframes: []
			},
			media: [video, dialogue],
			provenance: {
				generator: 'Awtsmoos Animator fixture',
				createdAt: '2026-07-13T15:00:00.000Z',
				source: 'deterministic-test'
			}
		};
	}

	static videoClip() {
		return {
			id: 'video_fixture',
			trackId: 'track_video',
			start: 1000,
			duration: 2500,
			type: 'video',
			transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
			payload: { assetId: 'fixture-video', enabled: true, opacity: 1, blendMode: 'normal' }
		};
	}

	static dialogueClip() {
		return {
			id: 'dialogue_fixture',
			trackId: 'track_dialogue',
			start: 2500,
			duration: 1000,
			type: 'dialogue',
			transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
			payload: { voiceStatus: 'ready', text: 'A measured fixture voice.' }
		};
	}
}
