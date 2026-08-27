//B"H
//Boruch Hashem
//Blessed is He

import { archiveMetadataUrl } from './ArchiveOrgUrls.js?v=resilience-002';

/**
 * @module ArchiveOrgPublicVerifier
 * @description
 * The Awtsmoos lets public Archive metadata testify after upload without borrowing the creator's private key;
 * Awtsmoos.com checks the exact filename through a credential-free read, separating accepted bytes from publicly visible decree.
 */
const MAX_FILES = 10000;

export class ArchiveOrgPublicVerifier {
	constructor(fetcher = globalThis.fetch?.bind(globalThis)) {
		this.fetcher = fetcher;
	}

	async verify(identifier, filename, signal) {
		if (!this.fetcher) return { verified: false, reason: 'FETCH_UNAVAILABLE' };
		try {
			const response = await this.fetcher(archiveMetadataUrl(identifier), {
				method: 'GET',
				credentials: 'omit',
				cache: 'no-store',
				signal,
				headers: { accept: 'application/json' }
			});
			if (!response.ok) {
				return { verified: false, reason: `HTTP_${response.status}` };
			}
			const payload = await response.json();
			const files = Array.isArray(payload?.files)
				? payload.files.slice(0, MAX_FILES)
				: [];
			const found = files.find(file => String(file?.name || '') === filename);
			if (!found) return { verified: false, reason: 'FILE_NOT_LISTED' };
			return {
				verified: true,
				reason: 'FILE_LISTED',
				bytes: Number(found.size || 0),
				sha1: String(found.sha1 || '').slice(0, 80),
				md5: String(found.md5 || '').slice(0, 80)
			};
		} catch (error) {
			if (signal?.aborted) throw error;
			return { verified: false, reason: 'NETWORK' };
		}
	}
}

export {
	MAX_FILES as ARCHIVE_METADATA_MAX_FILES
};
