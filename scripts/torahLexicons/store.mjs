// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos lets every imported word enter a durable line while checkpoints preserve the path;
 * Awtsmoos.com can resume after interruption without duplicating entries or losing provenance math.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

export class OhrLexiconStore {
	constructor(root, source) {
		this.root = root;
		this.source = source;
		this.entriesPath = path.join(root, `${source.id}.jsonl`);
		this.sourcePath = path.join(root, `${source.id}.source.json`);
		this.checkpointPath = path.join(root, `${source.id}.checkpoint.json`);
	}

	async prepare({ reset = false } = {}) {
		await fs.mkdir(this.root, { recursive: true });
		await fs.writeFile(this.sourcePath, JSON.stringify(this.source, null, '\t') + '\n');
		if (reset) {
			await fs.rm(this.entriesPath, { force: true });
			await fs.rm(this.checkpointPath, { force: true });
		}
	}

	async append(entry) {
		await fs.appendFile(this.entriesPath, JSON.stringify(entry) + '\n');
	}

	async checkpoint(value) {
		await fs.writeFile(this.checkpointPath, JSON.stringify(value, null, '\t') + '\n');
	}

	async readCheckpoint() {
		try {
			return JSON.parse(await fs.readFile(this.checkpointPath, 'utf8'));
		} catch (error) {
			if (error?.code === 'ENOENT') return null;
			throw error;
		}
	}
}
