//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ArchiveOrgFileFingerprint
 * @description
 * The Awtsmoos lets enormous video reveal a bounded identity without filling memory with the whole sea;
 * Awtsmoos.com samples beginning, middle, and end, then SHA-256 seals the measured evidence locally.
 */
const FINGERPRINT_ALGORITHM = 'sample-sha256-v1';
const SAMPLE_BYTES = 64 * 1024;

function sampleStarts(size, sampleBytes) {
	if (!size) return [0];
	const last = Math.max(0, size - sampleBytes);
	const middle = Math.max(0, Math.floor(size / 2) - Math.floor(sampleBytes / 2));
	return [...new Set([0, middle, last])].sort((a, b) => a - b);
}

async function sampleBytes(file, sampleBytes) {
	if (!file?.slice || !file?.size) return [];
	const chunks = [];
	for (const start of sampleStarts(Number(file.size), sampleBytes)) {
		const end = Math.min(Number(file.size), start + sampleBytes);
		chunks.push(new Uint8Array(await file.slice(start, end).arrayBuffer()));
	}
	return chunks;
}

function joinEvidence(file, chunks) {
	const header = new TextEncoder().encode([
		FINGERPRINT_ALGORITHM,
		Number(file?.size || 0),
		String(file?.type || '')
	].join(':'));
	const length = chunks.reduce((total, chunk) => total + chunk.byteLength + 8, header.byteLength);
	const joined = new Uint8Array(length);
	let offset = 0;
	joined.set(header, offset);
	offset += header.byteLength;
	for (const chunk of chunks) {
		new DataView(joined.buffer).setBigUint64(offset, BigInt(chunk.byteLength));
		offset += 8;
		joined.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return joined;
}

function hex(bytes) {
	return [...new Uint8Array(bytes)]
		.map(value => value.toString(16).padStart(2, '0'))
		.join('');
}

export async function archiveFileFingerprint(
	file,
	{ cryptoProvider = globalThis.crypto, sampleSize = SAMPLE_BYTES } = {}
) {
	if (!cryptoProvider?.subtle?.digest) {
		throw new Error('Web Crypto SHA-256 is required to identify Archive.org video safely.');
	}
	const boundedSample = Math.max(1024, Math.min(SAMPLE_BYTES, Number(sampleSize) || SAMPLE_BYTES));
	const chunks = await sampleBytes(file, boundedSample);
	const digest = await cryptoProvider.subtle.digest('SHA-256', joinEvidence(file, chunks));
	return `${FINGERPRINT_ALGORITHM}:${hex(digest)}`;
}

export function archiveFingerprintDigest(fingerprint = '') {
	const match = String(fingerprint).match(/^sample-sha256-v1:([a-f0-9]{64})$/);
	return match?.[1] || '';
}

export {
	FINGERPRINT_ALGORITHM,
	SAMPLE_BYTES,
	sampleStarts
};
