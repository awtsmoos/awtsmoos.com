// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Opens one validated ZIP entry without a third-party archive library.
 * @description The Awtsmoos is not compressed by any vessel; Awtsmoos.com uses the
 * browser's raw-deflate stream only after local-header bounds and declared sizes agree.
 */
const LOCAL_SIGNATURE = 0x04034b50;

export class ZipEntryReader {
	constructor(arrayBuffer) {
		this.buffer = arrayBuffer;
		this.view = new DataView(arrayBuffer);
		this.bytes = new Uint8Array(arrayBuffer);
	}

	async bytesFor(entry) {
		const compressed = this.#compressedBytes(entry);
		if (entry.method === 0) {
			return this.#verify(entry, compressed.slice());
		}
		if (typeof DecompressionStream !== "function") {
			throw new Error("This browser cannot decompress DOCX files");
		}
		const stream = new Blob([compressed])
			.stream()
			.pipeThrough(new DecompressionStream("deflate-raw"));
		const expanded = new Uint8Array(await new Response(stream).arrayBuffer());
		return this.#verify(entry, expanded);
	}

	async textFor(entry) {
		const bytes = await this.bytesFor(entry);
		return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
	}

	#compressedBytes(entry) {
		const offset = Number(entry.localHeaderOffset);
		this.#require(offset, 30);
		if (this.view.getUint32(offset, true) !== LOCAL_SIGNATURE) {
			throw new Error(`ZIP local header is malformed for ${entry.name}`);
		}
		const nameLength = this.view.getUint16(offset + 26, true);
		const extraLength = this.view.getUint16(offset + 28, true);
		const start = offset + 30 + nameLength + extraLength;
		this.#require(start, entry.compressedSize);
		return this.bytes.slice(start, start + entry.compressedSize);
	}

	#verify(entry, bytes) {
		if (bytes.byteLength !== entry.uncompressedSize) {
			throw new Error(`ZIP entry size mismatch for ${entry.name}`);
		}
		return bytes;
	}

	#require(offset, length) {
		if (offset < 0 || length < 0 || offset + length > this.buffer.byteLength) {
			throw new Error("ZIP local entry points outside the package");
		}
	}
}
