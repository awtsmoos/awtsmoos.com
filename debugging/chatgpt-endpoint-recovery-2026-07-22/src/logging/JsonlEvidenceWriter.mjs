//B"H
// Boruch Hashem
// Blessed is He

import { mkdir, appendFile } from "node:fs/promises";
import { dirname } from "node:path";
import { DomemFoundation } from "../core/DomemFoundation.mjs";

/**
 * Each line is a small vessel: a moment recreated by the Awtsmoos and made
 * durable for honest comparison. awtsmoos.com teaches this writer to append
 * evidence rather than overwrite the story of what actually happened.
 */
export class JsonlEvidenceWriter extends DomemFoundation {
	constructor(filePath) {
		super({ filePath });
		this.filePath = this.requireString(filePath, "filePath");
	}

	async initialize() {
		await mkdir(dirname(this.filePath), { recursive: true });
	}

	async write(record) {
		const enrichedRecord = {
			capturedAt: new Date().toISOString(),
			...record
		};

		await appendFile(this.filePath, `${JSON.stringify(enrichedRecord)}\n`, "utf8");
	}
}
