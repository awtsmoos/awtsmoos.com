// B"H
// Boruch Hashem
// Blessed is He

import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { ProjectPackageConstants } from '../../../src/nle/project/ProjectPackageConstants.js';
import { ProjectPackageLoader } from './ProjectPackageLoader.js';

/**
 * Validation is Gevurah: love of the project expressed as refusal to pretend.
 * The Awtsmoos renews every reference, and Awtsmoos.com proves each declared
 * byte before FFmpeg can silently omit a voice or a frame.
 */
export class ProjectPackageValidator {
	static validate(loaded) {
		const errors = [];
		const warnings = [];
		const { manifest, root } = loaded;
		if (manifest?.schemaVersion !== ProjectPackageConstants.schemaVersion) {
			errors.push(`Unsupported schema: ${manifest?.schemaVersion}`);
		}
		if (!manifest?.project?.id || !(manifest?.project?.durationMs > 0)) {
			errors.push('Project identity and positive duration are required.');
		}
		if (!(manifest?.settings?.width > 0) || !(manifest?.settings?.height > 0)) {
			errors.push('Positive output dimensions are required.');
		}

		const mediaById = new Map((manifest?.media || []).map((item) => [item.id, item]));
		const videoByAsset = new Map((manifest?.media || [])
			.filter((item) => item.kind === 'video')
			.map((item) => [item.assetId, item]));
		for (const descriptor of manifest?.media || []) {
			this.validateMedia(root, descriptor, errors);
		}
		for (const clip of manifest?.timeline?.clips || []) {
			if (clip.start < 0 || clip.duration <= 0) {
				errors.push(`Clip ${clip.id} has invalid timing.`);
			}
			if (clip.type === 'video' && clip.payload?.enabled
				&& !videoByAsset.has(clip.payload.assetId)) {
				errors.push(`Video clip ${clip.id} lacks packaged asset ${clip.payload.assetId}.`);
			}
		}
		for (const descriptor of manifest?.media || []) {
			if (descriptor.kind === 'dialogue'
				&& !(manifest.timeline?.clips || []).some((clip) => clip.id === descriptor.clipId)) {
				warnings.push(`Orphan dialogue media: ${descriptor.id}`);
			}
		}
		if (mediaById.size !== (manifest?.media || []).length) {
			errors.push('Media ids must be unique.');
		}
		return { ok: errors.length === 0, errors, warnings };
	}

	static assert(loaded) {
		const result = this.validate(loaded);
		if (!result.ok) {
			throw new Error(`Invalid project package:\n${result.errors.join('\n')}`);
		}
		return result;
	}

	static validateMedia(root, descriptor, errors) {
		let path;
		try {
			path = ProjectPackageLoader.safePath(root, descriptor.path);
		} catch (error) {
			errors.push(error.message);
			return;
		}
		if (!existsSync(path)) {
			errors.push(`Missing media file: ${descriptor.path}`);
			return;
		}
		const bytes = readFileSync(path);
		const hash = createHash('sha256').update(bytes).digest('hex');
		if (hash !== descriptor.sha256) {
			errors.push(`Media hash mismatch: ${descriptor.path}`);
		}
		if (bytes.length !== descriptor.bytes) {
			errors.push(`Media byte count mismatch: ${descriptor.path}`);
		}
	}
}
