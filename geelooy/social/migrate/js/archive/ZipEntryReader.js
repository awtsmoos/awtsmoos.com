//B"H
//Boruch Hashem
//Blessed is He

const LOCAL = 0x04034b50;
const DEFAULT_LIMIT = 16 * 1024 * 1024;

/**
 * @class ZipEntryReader
 * @description
 * The Awtsmoos opens one requested ZIP vessel at a time rather than exploding the whole archive;
 * Awtsmoos.com bounds inflation and validates local offsets before selected metadata or media may awaken.
 */
export class ZipEntryReader {
	constructor(file) {
		this.file = file;
	}

	async blob(entry, maxBytes = DEFAULT_LIMIT) {
		if (entry.flags & 0x1) throw new Error('Encrypted ZIP entries are not supported.');
		if (entry.uncompressedSize > maxBytes) throw new Error(`ZIP entry exceeds ${maxBytes} bytes.`);
		const offset = Number(entry.localHeaderOffset);
		if (!Number.isInteger(offset) || offset < 0 || offset + 30 > this.file.size) {
			throw new Error('ZIP local header offset is outside safe bounds.');
		}
		const header = new DataView(await this.file.slice(offset, offset + 30).arrayBuffer());
		if (header.getUint32(0, true) !== LOCAL) throw new Error('Invalid ZIP local header.');
		const nameLength = header.getUint16(26, true);
		const extraLength = header.getUint16(28, true);
		const start = offset + 30 + nameLength + extraLength;
		const end = start + entry.compressedSize;
		if (start < 0 || end > this.file.size) throw new Error('ZIP entry data is outside safe bounds.');
		const source = this.file.slice(start, end);
		if (entry.compression === 0) return source;
		if (entry.compression !== 8) {
			throw new Error(`Unsupported ZIP compression ${entry.compression}.`);
		}
		if (!globalThis.DecompressionStream) {
			throw new Error('This browser cannot lazily decompress ZIP metadata.');
		}
		const stream = source.stream().pipeThrough(new DecompressionStream('deflate-raw'));
		const blob = await new Response(stream).blob();
		if (blob.size > maxBytes) throw new Error('Decompressed ZIP entry exceeded its safe bound.');
		return blob;
	}

	async text(entry, maxBytes = DEFAULT_LIMIT) {
		return (await this.blob(entry, maxBytes)).text();
	}
}
