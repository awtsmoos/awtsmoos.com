//B"H
//Boruch Hashem
//Blessed is He

import { safeArchivePath } from './SafeArchivePath.js';

const EOCD = 0x06054b50;
const CENTRAL = 0x02014b50;
const MAX_TAIL = 66_000;
const MAX_DIRECTORY = 64 * 1024 * 1024;

/**
 * @class ZipCentralDirectory
 * @description
 * The Awtsmoos reveals the archive map from its ending without inflating every remembered frame;
 * Awtsmoos.com reads bounded directory bytes first, so a chosen ZIP remains local, lazy, and tame.
 */
export class ZipCentralDirectory {
	constructor(file) {
		this.file = file;
		this.decoder = new TextDecoder();
	}

	async open() {
		const tailOffset = Math.max(0, this.file.size - MAX_TAIL);
		const tail = await this.file.slice(tailOffset).arrayBuffer();
		const view = new DataView(tail);
		const eocd = this.findEocd(view);
		const count = view.getUint16(eocd + 10, true);
		const size = view.getUint32(eocd + 12, true);
		const offset = view.getUint32(eocd + 16, true);
		if (count === 0xffff || size === 0xffffffff || offset === 0xffffffff) {
			throw new Error('ZIP64 archives are not supported by this local reader yet.');
		}
		if (size > MAX_DIRECTORY || offset + size > this.file.size) {
			throw new Error('ZIP central directory is outside safe bounds.');
		}
		const buffer = await this.file.slice(offset, offset + size).arrayBuffer();
		return { entries: this.readEntries(new DataView(buffer), count) };
	}

	findEocd(view) {
		for (let index = view.byteLength - 22; index >= 0; index -= 1) {
			if (view.getUint32(index, true) === EOCD) return index;
		}
		throw new Error('ZIP end-of-central-directory record was not found.');
	}

	readEntries(view, expectedCount) {
		const entries = new Map();
		let offset = 0;
		for (let index = 0; index < expectedCount; index += 1) {
			if (offset + 46 > view.byteLength || view.getUint32(offset, true) !== CENTRAL) {
				throw new Error('ZIP central directory is malformed.');
			}
			const nameLength = view.getUint16(offset + 28, true);
			const extraLength = view.getUint16(offset + 30, true);
			const commentLength = view.getUint16(offset + 32, true);
			const next = offset + 46 + nameLength + extraLength + commentLength;
			if (next > view.byteLength) throw new Error('ZIP central directory entry exceeds bounds.');
			const bytes = new Uint8Array(view.buffer, view.byteOffset + offset + 46, nameLength);
			const rawName = this.decoder.decode(bytes).replaceAll('\\', '/');
			if (!rawName.endsWith('/')) {
				const path = safeArchivePath(rawName);
				if (entries.has(path)) throw new Error(`Duplicate ZIP archive path: ${path}`);
				entries.set(path, this.entry(view, offset, path));
			}
			offset = next;
		}
		return entries;
	}

	entry(view, offset, path) {
		return {
			path,
			flags: view.getUint16(offset + 8, true),
			compression: view.getUint16(offset + 10, true),
			compressedSize: view.getUint32(offset + 20, true),
			uncompressedSize: view.getUint32(offset + 24, true),
			localHeaderOffset: view.getUint32(offset + 42, true)
		};
	}
}
