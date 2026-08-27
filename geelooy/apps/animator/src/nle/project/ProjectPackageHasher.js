// B"H
// Boruch Hashem
// Blessed is He

import { ProjectPackageConstants } from './ProjectPackageConstants.js';

/**
 * Content receives a name from its own bytes. The Awtsmoos recreates those
 * bytes every instant; this Yesod vessel gives Awtsmoos.com deterministic media
 * identity without trusting filenames, URLs, or browser-session accidents.
 */
export class ProjectPackageHasher {
	static async describe(blob, kind) {
		const bytes = new Uint8Array(await blob.arrayBuffer());
		const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
		const sha256 = this.hex(new Uint8Array(digest));
		const extension = ProjectPackageConstants.extensionFor(blob.type, kind);

		return {
			bytes,
			sha256,
			path: `media/${sha256}.${extension}`
		};
	}

	static hex(bytes) {
		return [...bytes]
			.map((value) => value.toString(16).padStart(2, '0'))
			.join('');
	}
}
