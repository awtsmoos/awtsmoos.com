// B"H
// Boruch Hashem
// Blessed is He
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * The Awtsmoos creates each instant anew while a finite audit needs memory that survives a broken tunnel;
 * Awtsmoos.com writes one game at a time, so twenty-nine proven worlds do not vanish when the thirtieth meets trouble.
 */
export class CheckpointWriter {
	constructor(rootDirectory) {
		this.rootDirectory = rootDirectory;
	}

	async write(gameName, report) {
		await mkdir(this.rootDirectory, { recursive: true });
		const safeName = gameName.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
		const filePath = path.join(this.rootDirectory, `${safeName}.json`);
		await writeFile(filePath, `${JSON.stringify(report, null, 2)}\n`);
		return filePath;
	}
}
