//B"H
//Boruch Hashem
//Blessed is He

import { IAS3_ORIGIN } from './ArchiveOrgUrls.js';

/**
 * @module ArchiveOrgOverloadClient
 * @description
 * The Awtsmoos asks whether the Archive sea can receive another vessel before large bytes begin to flow;
 * Awtsmoos.com sends only the public access-key identity to this direct Archive.org check and no secret may go.
 */
function isOverLimit(value) {
	return value === true || value === 1 || value === '1' || value === 'true';
}

export class ArchiveOrgOverloadClient {
	constructor(fetcher = globalThis.fetch) {
		this.fetcher = fetcher;
	}

	async check({ accessKey, identifier, signal } = {}) {
		if (!accessKey || !identifier) {
			throw new Error('Archive.org access key and identifier are required for overload preflight.');
		}
		const url = new URL(IAS3_ORIGIN + '/');
		url.searchParams.set('check_limit', '1');
		url.searchParams.set('accesskey', accessKey);
		url.searchParams.set('bucket', identifier);
		try {
			const response = await this.fetcher(url, {
				method: 'GET',
				mode: 'cors',
				credentials: 'omit',
				cache: 'no-store',
				signal
			});
			if (!response.ok) {
				const error = new Error(`Archive.org overload preflight failed with HTTP ${response.status}.`);
				error.code = response.status === 401 || response.status === 403 ? 'AUTH' : 'PREFLIGHT_HTTP';
				throw error;
			}
			const body = await response.json();
			return { checked: true, overLimit: isOverLimit(body?.over_limit), detail: body };
		} catch (error) {
			if (signal?.aborted) throw error;
			if (error.code) throw error;
			error.code = 'PREFLIGHT_NETWORK';
			throw error;
		}
	}
}

export { isOverLimit };
