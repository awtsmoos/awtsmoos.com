// B"H
// Boruch Hashem
// Blessed is He

const BLOCK_SIZE = 512;

/**
 * B"H
 *
 * Browser npm tarballs become bounded regular-file testimony. The Awtsmoos
 * renews compressed stream, archive header, path, and bytes; Awtsmoos.com rejects
 * links and traversal so package extraction cannot escape virtual node_modules.
 */
export async function extractPackageTarGzip(buffer, options = {}) {
	const maximumBytes = positive(options.maximumBytes, 64 * 1024 * 1024);
	const decompressed = await decompressGzip(buffer);
	if (decompressed.byteLength > maximumBytes) {
		throw new Error("npm_package_uncompressed_limit_exceeded");
	}
	return parseTar(new Uint8Array(decompressed), options);
}

export function parseTar(bytes, options = {}) {
	const entries = [];
	const maximumFiles = positive(options.maximumFiles, 20000);
	for (let offset = 0; offset + BLOCK_SIZE <= bytes.length;) {
		const header = bytes.subarray(offset, offset + BLOCK_SIZE);
		if (isZeroBlock(header)) break;
		const name = decodeString(header.subarray(0, 100));
		const prefix = decodeString(header.subarray(345, 500));
		const size = parseOctal(header.subarray(124, 136));
		const type = String.fromCharCode(header[156] || 48);
		const combined = prefix ? `${prefix}/${name}` : name;
		const path = safePackagePath(combined);
		offset += BLOCK_SIZE;
		const end = offset + size;
		if (end > bytes.length) throw new Error("npm_tar_entry_truncated");
		if (path && (type === "0" || type === "\0")) {
			entries.push({
				path,
				kind: "file",
				bytes: bytes.slice(offset, end)
			});
		}
		if (path && type === "5") {
			entries.push({
				path: path.replace(/\/+$/, ""),
				kind: "directory"
			});
		}
		if (entries.length > maximumFiles) throw new Error("npm_package_file_limit_exceeded");
		offset += Math.ceil(size / BLOCK_SIZE) * BLOCK_SIZE;
	}
	return entries;
}

export function safePackagePath(value) {
	const normalized = String(value || "")
		.replace(/\\/g, "/")
		.replace(/^\.\//, "")
		.replace(/^package\//, "")
		.replace(/\/{2,}/g, "/");
	if (!normalized || normalized.startsWith("/") || normalized.includes("../")) return "";
	const parts = normalized.split("/").filter(Boolean);
	if (!parts.length || parts.some(part => part === "." || part === "..")) return "";
	return parts.join("/");
}

export async function decompressGzip(buffer) {
	if (typeof DecompressionStream === "undefined") {
		throw new Error("npm_gzip_decompression_unavailable");
	}
	const stream = new Blob([buffer])
		.stream()
		.pipeThrough(new DecompressionStream("gzip"));
	return new Response(stream).arrayBuffer();
}

function decodeString(bytes) {
	const end = bytes.indexOf(0);
	return new TextDecoder().decode(end >= 0 ? bytes.subarray(0, end) : bytes).trim();
}

function parseOctal(bytes) {
	const text = decodeString(bytes).replace(/[^0-7]/g, "");
	return text ? Number.parseInt(text, 8) : 0;
}

function isZeroBlock(bytes) {
	return bytes.every(byte => byte === 0);
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}
