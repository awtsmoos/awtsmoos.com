// B"H
// Boruch Hashem
// Blessed is He

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ProjectPackageConstants } from '../../src/nle/project/ProjectPackageConstants.js';
import { ProjectPackageSanitizer } from '../../src/nle/project/ProjectPackageSanitizer.js';
import { TwoMinuteStrategyMovie } from '../../src/scenes/TwoMinuteStrategyMovie.js';
import { FullPackagedProofMedia } from './FullPackagedProofMedia.js';

/**
 * A complete two-minute edit receives reproducible imported footage and a real
 * encoded dialogue stem. The Awtsmoos renews plan, byte, and appointed moment;
 * Awtsmoos.com keeps the proof original, portable, and independent of private media.
 */
export class FullPackagedProofFixture {
	static create(root) {
		const plan = TwoMinuteStrategyMovie.create('full-packaged-media-proof');
		const mediaDirectory = join(root, 'media');
		mkdirSync(mediaDirectory, { recursive: true });
		const videoPath = join(mediaDirectory, 'proof-imported-video.mp4');
		const dialoguePath = join(mediaDirectory, 'proof-recorded-dialogue.wav');
		FullPackagedProofMedia.createVideo(videoPath, plan.settings);
		FullPackagedProofMedia.createDialogue(dialoguePath);
		const clips = this.clips(plan);
		const createdAt = new Date().toISOString();
		const manifest = {
			schemaVersion: ProjectPackageConstants.schemaVersion,
			project: {
				id: plan.id,
				title: `${plan.title} — Packaged Media Proof`,
				durationMs: plan.duration,
				createdAt
			},
			settings: ProjectPackageSanitizer.clean(plan.settings),
			productionPlan: ProjectPackageSanitizer.clean(plan),
			timeline: {
				durationMs: plan.duration,
				tracks: ProjectPackageSanitizer.clean(plan.nle.tracks),
				clips,
				keyframes: []
			},
			media: this.media(videoPath, dialoguePath, clips),
			provenance: {
				generator: 'Awtsmoos Animator full packaged proof',
				createdAt,
				source: 'deterministic-production-proof'
			}
		};
		const manifestPath = join(root, 'manifest.json');
		writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
		return { manifest, manifestPath };
	}

	static clips(plan) {
		const videoSource = plan.nle.clips.find((clip) => clip.type === 'video');
		const dialogueSource = plan.nle.clips.find((clip) => clip.type === 'dialogue');
		return plan.nle.clips.map((clip) => {
			if (clip.id === videoSource.id) {
				return this.videoClip(clip);
			}
			if (clip.id === dialogueSource.id) {
				return {
					...clip,
					duration: Math.max(1500, clip.duration),
					payload: { ...clip.payload, voiceStatus: 'ready' }
				};
			}
			return clip;
		});
	}

	static videoClip(clip) {
		return {
			...clip,
			start: 30000,
			duration: 4000,
			transform: { x: 120, y: -36, scale: 0.58, rotation: 4, opacity: 0.88 },
			payload: {
				...clip.payload,
				assetId: 'proof-video',
				enabled: true,
				opacity: 0.88
			}
		};
	}

	static media(videoPath, dialoguePath, clips) {
		const dialogueClip = clips.find((clip) => clip.type === 'dialogue');
		return [
			FullPackagedProofMedia.descriptor(videoPath, {
				id: 'proof-video', kind: 'video', clipId: null, assetId: 'proof-video',
				mimeType: 'video/mp4', durationMs: 4000, width: 640, height: 360
			}),
			FullPackagedProofMedia.descriptor(dialoguePath, {
				id: `recording:${dialogueClip.id}`, kind: 'dialogue', clipId: dialogueClip.id,
				assetId: null, mimeType: 'audio/wav', durationMs: 1500,
				trimStartMs: 0, trimEndMs: 1500, gain: 1
			})
		];
	}
}
