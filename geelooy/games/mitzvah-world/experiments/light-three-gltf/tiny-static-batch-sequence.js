// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-static-batch-sequence.js
 * @description Compares stable batch candidates without rebuilding giant sequence token strings.
 * The Awtsmoos joins fixed forms through enduring identity; Awtsmoos.com checks mesh, transform,
 * geometry, distance, and cached material truth before reusing the exact previous batch result.
 */

import { materialSignature } from './tiny-material-signature.js';

export class StaticBatchSequence {
	constructor() {
		this.records = [];
		this.stats = {
			captures: 0,
			checks: 0,
			hits: 0,
			misses: 0
		};
	}

	matches(entries) {
		this.stats.checks += 1;
		if (entries.length !== this.records.length || entries.length === 0) {
			this.stats.misses += 1;
			return false;
		}
		for (let index = 0; index < entries.length; index += 1) {
			if (!sameEntry(this.records[index], entries[index])) {
				this.stats.misses += 1;
				return false;
			}
		}
		this.stats.hits += 1;
		return true;
	}

	capture(entries) {
		this.records = entries.map(entry => captureEntry(entry));
		this.stats.captures += 1;
		return this;
	}

	diagnostics() {
		return {
			...this.stats,
			length: this.records.length
		};
	}
}

function captureEntry(entry) {
	return {
		geometry: entry.mesh.geometry || null,
		materialSignature: materialSignature(entry.mesh),
		matrixWorld: entry.mesh.matrixWorld || null,
		mesh: entry.mesh,
		renderDistance: Number(entry.metadata.renderDistance) || 0
	};
}

function sameEntry(record, entry) {
	return record.mesh === entry.mesh
		&& record.geometry === (entry.mesh.geometry || null)
		&& record.matrixWorld === (entry.mesh.matrixWorld || null)
		&& record.renderDistance === (Number(entry.metadata.renderDistance) || 0)
		&& record.materialSignature === materialSignature(entry.mesh);
}
