// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module FileTransferGetClient
 * @description
 * The Awtsmoos lets Awtsmoos.com move great files through many tiny GET rivers;
 * every chunk is bounded, hashed, retryable, and the final rename only follows proof.
 */

import { base64Bytes, sha256Hex, sliceBytes } from "./transferBytes.js";

export const GET_RAW_CHUNK_BYTES = 3072;
const RETRIES = 3;

export async function uploadFileByGet({
	tunnelName,
	path,
	bytes,
	overwrite = true,
	headers = {},
	credentials = "include"
}) {
	const expectedSha256 = await sha256Hex(bytes);
	const create = await request(tunnelName, "create", {
		path,
		total_bytes: bytes.length,
		expected_sha256: expectedSha256,
		chunk_bytes: GET_RAW_CHUNK_BYTES,
		overwrite
	}, headers, credentials);
	assertOk(create, "transfer_create_failed");
	const transferId = create.transferId;
	for (let offset = Number(create.nextOffset || 0); offset < bytes.length;) {
		const chunk = sliceBytes(bytes, offset, GET_RAW_CHUNK_BYTES);
		const result = await requestWithRetry(tunnelName, "write", {
			transfer_id: transferId,
			offset,
			sha256: await sha256Hex(chunk),
			content64: base64Bytes(chunk)
		}, headers, credentials);
		assertOk(result, "transfer_chunk_failed");
		offset = Number(result.nextOffset ?? offset + chunk.length);
	}
	const commit = await request(tunnelName, "commit", {
		transfer_id: transferId
	}, headers, credentials);
	assertOk(commit, "transfer_commit_failed");
	return { ...commit, externalTransport: "https-get", expectedSha256 };
}

async function requestWithRetry(tunnelName, action, params, headers, credentials) {
	let lastError;
	for (let attempt = 1; attempt <= RETRIES; attempt += 1) {
		try {
			const result = await request(tunnelName, action, params, headers, credentials);
			if (result?.ok !== false) return result;
			lastError = new Error(result?.error || "transfer_request_failed");
		} catch (error) {
			lastError = error;
		}
	}
	throw lastError;
}

async function request(tunnelName, action, params, headers, credentials) {
	const url = transferUrl(tunnelName, action, params);
	const response = await fetch(url, { headers, credentials });
	const data = await response.json();
	if (!response.ok && data.ok !== false) data.ok = false;
	return data;
}

export function transferUrl(tunnelName, action, params = {}) {
	const url = new URL(
		`/api/tunnel/control/transfer/get/${encodeURIComponent(tunnelName)}`,
		location.origin
	);
	url.searchParams.set("action", action);
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== null && value !== "") {
			url.searchParams.set(key, String(value));
		}
	}
	return url.toString();
}

function assertOk(result, fallback) {
	if (result?.ok === false) throw new Error(result.error || fallback);
}
