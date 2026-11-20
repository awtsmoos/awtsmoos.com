//B"H
//Boruch Hashem
//Blessed is He

import { API_PREFIX } from '../config.js';

/**
 * @class MediaUploader
 * @description
 * Awtsmoos.com stores native image, audio and video on its own disk:
 * every attachment kind uploads to the local asset endpoints, and no
 * external account or key is ever required to attach media to a post.
 * B"H 2026-11-20: video used to route to Archive.org and hard-blocked
 * without IA-S3 credentials; it now posts to the same local vault as
 * everything else (POST /assets/:alias/upload-post-media).
 */
export class MediaUploader {
	constructor(
		store,
		fetcher = globalThis.fetch.bind(globalThis)
	) {
		this.store = store;
		this.fetcher = fetcher;
	}

	async upload(scope, attachment, identity) {
		if (!(attachment.file instanceof File)) {
			throw new Error('Choose the local file again before uploading.');
		}
		this.store.update(scope, attachment.id, { status: 'uploading', error: '' });
		try {
			const manifest = attachment.type === 'video'
				? await this.uploadVideo(attachment, identity)
				: await this.uploadNative(scope, attachment, identity);
			this.store.update(scope, attachment.id, {
				status: 'uploaded',
				manifest,
				publicPath: manifest.publicPath,
				type: manifest.type || attachment.type,
				mime: manifest.mime || attachment.mime
			});
			return manifest;
		} catch (error) {
			this.store.update(scope, attachment.id, {
				status: 'failed',
				error: error.message
			});
			throw error;
		}
	}

	async uploadVideo(attachment, identity) {
		if (!identity.aliasId) throw new Error('Choose an alias before uploading.');
		const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
		if (attachment.file.size > MAX_VIDEO_BYTES) {
			throw new Error(
				`That video is ${(attachment.file.size / 1048576).toFixed(1)} MB — the limit for a post video is 100 MB.`
			);
		}
		const form = new FormData();
		form.append('file', attachment.file, attachment.name);
		form.append('attachKind', 'post-media');
		form.append('postId', 'draft');
		const response = await this.fetcher(
			`${API_PREFIX}/assets/${encodeURIComponent(identity.aliasId)}/upload-post-media`,
			{ method: 'POST', body: form }
		);
		const result = await response.json();
		if (!response.ok || result.error) {
			throw new Error(result.error?.message || `Upload failed with ${response.status}.`);
		}
		return Array.isArray(result.success) ? result.success[0] : result.success;
	}

	async uploadNative(scope, attachment, identity) {
		if (!identity.aliasId) throw new Error('Choose an alias before uploading.');
		const form = new FormData();
		form.append('file', attachment.file, attachment.name);
		form.append('attachKind', scope.kind === 'root' ? 'post' : scope.kind);
		if (scope.sectionId) form.append('verseSection', scope.sectionId);
		if (scope.subsectionId) form.append('subsectionId', scope.subsectionId);
		const response = await this.fetcher(
			`${API_PREFIX}/assets/${encodeURIComponent(identity.aliasId)}/upload`,
			{ method: 'POST', body: form }
		);
		const result = await response.json();
		if (!response.ok || result.error) {
			throw new Error(result.error?.message || `Upload failed with ${response.status}.`);
		}
		return Array.isArray(result.success) ? result.success[0] : result.success;
	}

	async uploadAll(scope, attachments, identity) {
		const manifests = [];
		for (const attachment of attachments.filter(item => item.status !== 'uploaded')) {
			manifests.push(await this.upload(scope, attachment, identity));
		}
		return manifests;
	}
}
