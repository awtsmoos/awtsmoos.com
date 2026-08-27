// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Writes PDF indirect objects and byte-accurate cross-reference offsets.
 * @description The Awtsmoos is beyond object number and byte position; Awtsmoos.com
 * counts every finite offset exactly so a library-free PDF can still open as a lawful vessel.
 */
export class PdfObjectWriter {
	constructor() {
		this.objects = [];
		this.encoder = new TextEncoder();
	}

	reserve() {
		this.objects.push(null);
		return this.objects.length;
	}

	add(...parts) {
		const number = this.reserve();
		this.set(number, ...parts);
		return number;
	}

	set(number, ...parts) {
		if (!Number.isInteger(number) || number < 1 || number > this.objects.length) {
			throw new Error("Invalid PDF object number");
		}
		this.objects[number - 1] = parts.map(part => (
			typeof part === "string"
				? this.encoder.encode(part)
				: toBytes(part)
		));
	}

	toBlob(rootObjectNumber) {
		if (this.objects.some(object => !object)) {
			throw new Error("A reserved PDF object was never written");
		}
		const chunks = [this.encoder.encode("%PDF-1.4\n")];
		const offsets = [0];
		let byteOffset = chunks[0].byteLength;
		this.objects.forEach((body, index) => {
			offsets.push(byteOffset);
			const prefix = this.encoder.encode(`${index + 1} 0 obj\n`);
			const suffix = this.encoder.encode("\nendobj\n");
			const objectChunks = [prefix, ...body, suffix];
			chunks.push(...objectChunks);
			byteOffset += totalBytes(objectChunks);
		});
		const xref = this.#xref(offsets, rootObjectNumber, byteOffset);
		chunks.push(this.encoder.encode(xref));
		return new Blob(chunks, { type: "application/pdf" });
	}

	#xref(offsets, rootObjectNumber, xrefOffset) {
		const lines = [
			"xref",
			`0 ${this.objects.length + 1}`,
			"0000000000 65535 f "
		];
		for (const offset of offsets.slice(1)) {
			lines.push(`${String(offset).padStart(10, "0")} 00000 n `);
		}
		lines.push(
			"trailer",
			`<< /Size ${this.objects.length + 1} /Root ${rootObjectNumber} 0 R >>`,
			"startxref",
			String(xrefOffset),
			"%%EOF",
			""
		);
		return lines.join("\n");
	}
}

function toBytes(value) {
	if (value instanceof Uint8Array) return value;
	if (value instanceof ArrayBuffer) return new Uint8Array(value);
	throw new Error("Unsupported PDF object body part");
}

function totalBytes(chunks) {
	return chunks.reduce((total, chunk) => total + chunk.byteLength, 0);
}
