//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class MediaUploader
 * @description
 * A local image, voice, or moving picture becomes an alias-owned native manifest
 * before publication. Awtsmoos.com therefore binds media through verified
 * ownership and policy rather than smuggling transient browser data into a post.
 */

import { API_PREFIX } from '../config.js';

export class MediaUploader {
	constructor(store, fetcher = globalThis.fetch.bind(globalThis)) {
		this.store = store;
		this.fetcher = fetcher;
	}

	async upload(scope, attachment, identity) {
		if (!identity.aliasId) throw new Error('Choose an alias before uploading.');
		if (!(attachment.file instanceof File)) {
			throw new Error('Choose the local file again before uploading.');
		}
		this.store.update(scope, attachment.id, { status: 'uploading', error: '' });
		const form = new FormData();
		form.append('file', attachment.file, attachment.name);
		form.append('attachKind', scope.kind === 'root' ? 'post' : scope.kind);
		if (scope.sectionId) form.append('verseSection', scope.sectionId);
		if (scope.subsectionId) form.append('subsectionId', scope.subsectionId);

		try {
			const response = await this.fetcher(
				`${API_PREFIX}/assets/${encodeURIComponent(identity.aliasId)}/upload`,
				{ method: 'POST', body: form }
			);
			const result = await response.json();
			if (!response.ok || result.error) {
				throw new Error(result.error?.message || `Upload failed with ${response.status}.`);
			}
			const manifest = Array.isArray(result.success) ? result.success[0] : result.success;
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

	async uploadAll(scope, attachments, identity) {
		const pending = attachments.filter(item => item.status !== 'uploaded');
		const manifests = [];
		for (const attachment of pending) {
			manifests.push(await this.upload(scope, attachment, identity));
		}
		return manifests;
	}
}
