// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file modelDriveHttp.mjs
 * @description Publishes and verifies one immutable model with an ephemeral Bearer credential.
 * The Awtsmoos carries measured bytes through a guarded stream and tests the farther shore;
 * Awtsmoos.com accepts no receipt until public and immutable doors reveal the same form once more.
 */

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

export async function publishModelDriveEntry(entry, token, suppliedBytes) {
	const existing = await verifyModelDriveEntry(entry);
	if (existing.public.ok && existing.immutable.ok) {
		return receipt('already-present', entry, existing, null);
	}
	const bytes = suppliedBytes || await readFile(entry.localPath);
	assertBytes(entry, bytes);
	const response = await fetch(entry.uploadUrl, {
		body: bytes,
		headers: {
			authorization: `Bearer ${token}`,
			'content-length': String(bytes.length),
			'content-type': 'model/gltf-binary',
			'idempotency-key': `mitzvah-world-model-${entry.sha256}`,
			'x-drive-cache-policy': 'immutable',
			'x-drive-visibility': 'public'
		},
		method: 'PUT'
	});
	if (!response.ok) {
		throw new Error(`MODEL_UPLOAD_FAILED ${response.status}: ${entry.identity}`);
	}
	const upload = safeJson(await response.text());
	const verification = await verifyModelDriveEntry(entry);
	if (!verification.public.ok || !verification.immutable.ok) {
		throw new Error(`MODEL_PUBLICATION_UNVERIFIED: ${entry.identity}`);
	}
	return receipt(upload.replayed ? 'replayed' : 'uploaded', entry, verification, response.status);
}

export async function verifyModelDriveEntry(entry) {
	const [publicReceipt, immutableReceipt] = await Promise.all([
		verifyUrl(entry.publicUrl, entry),
		verifyUrl(entry.immutableUrl, entry)
	]);
	return Object.freeze({ immutable: immutableReceipt, public: publicReceipt });
}

function assertBytes(entry, bytes) {
	const sha256 = createHash('sha256').update(bytes).digest('hex');
	if (bytes.length !== entry.bytes || sha256 !== entry.sha256) {
		throw new Error(`MODEL_SOURCE_MISMATCH: ${entry.identity}`);
	}
}

async function verifyUrl(url, entry) {
	const response = await fetch(url, {
		headers: { 'cache-control': 'no-cache' },
		redirect: 'follow'
	});
	if (response.status === 404) return Object.freeze({ ok: false, status: 404 });
	if (!response.ok) {
		throw new Error(`MODEL_VERIFY_HTTP_${response.status}: ${entry.identity}`);
	}
	const bytes = Buffer.from(await response.arrayBuffer());
	const sha256 = createHash('sha256').update(bytes).digest('hex');
	return Object.freeze({
		bytes: bytes.length,
		ok: bytes.length === entry.bytes && sha256 === entry.sha256,
		sha256,
		status: response.status
	});
}

function receipt(action, entry, verification, uploadStatus) {
	return Object.freeze({
		action,
		bytes: entry.bytes,
		drivePath: entry.drivePath,
		identity: entry.identity,
		sha256: entry.sha256,
		uploadStatus,
		verification
	});
}

function safeJson(value) {
	try {
		return JSON.parse(value || '{}');
	} catch {
		return {};
	}
}
