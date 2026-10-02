// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LargeBatchTransport
 * @description
 * The Awtsmoos lets Awtsmoos.com stage many great files through small GET rivers,
 * then cross one transactional bridge so speed never trades away all-or-rollback truth.
 */

import { cancelTransferByGet, stageFileByGet } from "./fileTransferGetClient.js";
import { getJson } from "./http.js";
import { bytesFrom } from "./transferBytes.js";
import { buildFsUrl } from "./tunnelUrlBuilder.js";
import { SAFE_DIRECT_URL_CHARS } from "./largeWriteTransport.js";

const STAGE_CONCURRENCY = 3;

export function shouldPromoteLargeBatch(url, options = {}) {
	if (String(options.action || "") !== "bulkWrite") return false;
	if (!Array.isArray(options.writes) || !options.writes.length) return false;
	return String(url || "").length > SAFE_DIRECT_URL_CHARS;
}

export async function performLargeBatch({
	tunnelName,
	options,
	headers = {},
	credentials = "include"
}) {
	const staged = [];
	try {
		await mapConcurrent(options.writes, STAGE_CONCURRENCY, async write => {
			const path = write?.path || write?.p;
			if (!path) throw new Error("bulk_write_path_required");
			const item = await stageFileByGet({
				tunnelName,
				path,
				bytes: bytesFrom(write.content),
				overwrite: true,
				headers,
				credentials
			});
			staged.push(item);
		});
	} catch (error) {
		await cancelAll(tunnelName, staged, headers, credentials);
		throw error;
	}
	const transfers = staged.map(item => ({ transferId: item.transferId }));
	const request = {
		action: "bulkWriteTransfers",
		transfers,
		allowWrite: options.allowWrite,
		clientRequestId: options.clientRequestId,
		targetVessel: options.targetVessel
	};
	const response = await getJson(buildFsUrl(tunnelName, request), {
		headers,
		credentials
	});
	return {
		...response,
		requestAction: "bulkWrite",
		actualAction: "bulkWriteTransfers",
		largePayloadPromoted: true,
		externalTransport: "https-get",
		stagedTransfers: response?.ok ? [] : transfers
	};
}

async function cancelAll(tunnelName, staged, headers, credentials) {
	await Promise.all(staged.map(item => cancelTransferByGet({
		tunnelName,
		transferId: item.transferId,
		headers,
		credentials
	}).catch(() => null)));
}

async function mapConcurrent(items, limit, operation) {
	let index = 0;
	const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
		while (index < items.length) {
			const current = index++;
			await operation(items[current], current);
		}
	});
	await Promise.all(workers);
}
