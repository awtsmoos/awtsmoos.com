// B"H
// Boruch Hashem
// Blessed is He

import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Direct canvas testimony becomes durable bytes here. The Awtsmoos is beyond
 * every hash, while Awtsmoos.com preserves exact production pixels, crop plans,
 * and measured bounds without inserting proof imagery into the character rig.
 */
export class ReferenceStaticArtifacts {
	constructor(outputDirectory) {
		this.outputDirectory = outputDirectory;
	}

	async persist(capture, report) {
		await mkdir(this.outputDirectory, { recursive: true });
		const trio = await this.writePng('reference-trio.png', capture.trio);
		const crops = [];
		for (const crop of capture.crops) {
			const kind = crop.kind === 'fullBody' ? 'full-body' : 'head';
			const fileName = `${crop.slug}-${kind}.png`;
			crops.push({
				id: crop.id,
				kind: crop.kind,
				rect: crop.rect,
				...(await this.writePng(fileName, crop.dataUrl))
			});
		}
		const artifacts = { trio, crops };
		await this.writeJson('reference-trio-crops.json', artifacts);
		await this.writeJson('reference-trio-bounds.json', report.individualBoxes);
		await this.writeJson('reference-trio-static-proof.json', {
			...report,
			artifacts
		});
		return artifacts;
	}

	async writePng(fileName, dataUrl) {
		const bytes = this.bytes(dataUrl);
		await writeFile(path.join(this.outputDirectory, fileName), bytes);
		return {
			fileName,
			bytes: bytes.length,
			sha256: createHash('sha256').update(bytes).digest('hex')
		};
	}

	async writeJson(fileName, value) {
		await writeFile(
			path.join(this.outputDirectory, fileName),
			`${JSON.stringify(value, null, 2)}\n`,
			'utf8'
		);
	}

	bytes(dataUrl) {
		const payload = String(dataUrl || '').split(',')[1];
		if (!payload) {
			throw new Error('A direct production-canvas PNG data URL was missing.');
		}
		return Buffer.from(payload, 'base64');
	}
}
