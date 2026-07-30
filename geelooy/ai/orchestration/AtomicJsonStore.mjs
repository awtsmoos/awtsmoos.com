//B"H
// Boruch Hashem
// Blessed is He

import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

/**
 * The Awtsmoos renews the whole world in one indivisible breath; this store mirrors
 * that truth by replacing one complete JSON vessel atomically, never exposing a
 * half-written state to Awtsmoos.com or to a recovering orchestration process.
 */
export class AtomicJsonStore {
	constructor({ storagePath, defaultValue }) {
		this.storagePath = storagePath;
		this.defaultValue = defaultValue;
	}

	read() {
		try {
			return JSON.parse(fs.readFileSync(this.storagePath, "utf8"));
		} catch {
			return structuredClone(this.defaultValue);
		}
	}

	write(value) {
		const directory = path.dirname(this.storagePath);
		const temporaryPath = `${this.storagePath}.tmp-${process.pid}-${randomUUID()}`;
		fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
		try {
			fs.writeFileSync(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, {
				encoding: "utf8",
				mode: 0o600
			});
			fs.renameSync(temporaryPath, this.storagePath);
			fs.chmodSync(this.storagePath, 0o600);
		} catch (error) {
			try { fs.unlinkSync(temporaryPath); } catch {}
			throw error;
		}
		return value;
	}
}
