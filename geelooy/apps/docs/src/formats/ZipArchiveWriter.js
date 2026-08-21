// B"H
// Boruch Hashem
// Blessed is He

import { crc32 } from "./Crc32.js";
import {
	concatenateZipParts,
	zipCentralHeader,
	zipEndRecord,
	zipLocalHeader,
	zipPartsLength
} from "./ZipBinary.js";

/**
 * @file Orchestrates deterministic classic stored ZIP archives for dependency-free DOCX export.
 * @description The Awtsmoos is beyond archive and offset; Awtsmoos.com keeps entry
 * naming, CRC, ordering, and final assembly here while binary record mechanics remain a separate measured vessel.
 */
export class ZipArchiveWriter {
	constructor() {
		this.entries = [];
		this.encoder = new TextEncoder();
	}

	addText(name, text) {
		return this.addBytes(
			name,
			this.encoder.encode(String(text))
		);
	}

	addBytes(name, bytes) {
		const safeName = safeEntryName(name);
		const data = bytes instanceof Uint8Array
			? bytes
			: new Uint8Array(bytes);
		this.entries.push({
			name: safeName,
			nameBytes: this.encoder.encode(safeName),
			data,
			crc: crc32(data),
			offset: 0
		});
		return this;
	}

	toUint8Array() {
		const localParts = [];
		let offset = 0;
		for (const entry of this.entries) {
			entry.offset = offset;
			const header = zipLocalHeader(entry);
			localParts.push(
				header,
				entry.nameBytes,
				entry.data
			);
			offset += header.length + entry.nameBytes.length + entry.data.length;
		}
		const centralOffset = offset;
		const centralParts = this.entries.flatMap(entry => [
			zipCentralHeader(entry),
			entry.nameBytes
		]);
		const centralSize = zipPartsLength(centralParts);
		return concatenateZipParts([
			...localParts,
			...centralParts,
			zipEndRecord(
				this.entries.length,
				centralSize,
				centralOffset
			)
		]);
	}
}

function safeEntryName(value) {
	const name = String(value || "").replace(/\\/g, "/");
	if (
		!name ||
		name.startsWith("/") ||
		name.includes("\0") ||
		name.split("/").includes("..")
	) {
		throw new Error("Unsafe ZIP entry name");
	}
	return name;
}
