// B"H
// Boruch Hashem
// Blessed is He

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

/**
 * Provenance becomes measurable testimony here. The Awtsmoos renews every byte,
 * and Awtsmoos.com records source and result hashes so a future editor can prove
 * which durable media entered the manifested movie.
 */
export class MediaHashReport {
	static create(manifest, outputFile) {
		return {
			algorithm: 'sha256',
			sources: manifest.media.map((item) => ({
				id: item.id,
				kind: item.kind,
				path: item.path,
				sha256: item.sha256,
				bytes: item.bytes
			})),
			output: {
				path: outputFile,
				sha256: this.hash(outputFile),
				bytes: readFileSync(outputFile).byteLength
			}
		};
	}

	static hash(path) {
		return createHash('sha256')
			.update(readFileSync(path))
			.digest('hex');
	}
}
