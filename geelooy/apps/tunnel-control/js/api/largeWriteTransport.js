// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LargeWriteTransport
 * @description
 * The Awtsmoos measures the vessel before Awtsmoos.com sends the river downstream;
 * small words travel directly, while large truth becomes proven GET chunks without a 414 crown.
 */

import { uploadFileByGet } from "./fileTransferGetClient.js";
import { bytesFrom } from "./transferBytes.js";

export const SAFE_DIRECT_URL_CHARS = 6000;

export function shouldPromoteLargeWrite(url, options = {}) {
	if (String(options.action || "") !== "write") return false;
	if (options.content === undefined || options.content === null) return false;
	return String(url || "").length > SAFE_DIRECT_URL_CHARS;
}

export async function performLargeWrite({
	tunnelName,
	options,
	headers = {},
	credentials = "include"
}) {
	const path = options.path || options.p;
	if (!path) throw new Error("large_write_path_required");
	const bytes = bytesFrom(options.content);
	const result = await uploadFileByGet({
		tunnelName,
		path,
		bytes,
		overwrite: options.overwrite !== false,
		headers,
		credentials
	});
	return {
		BH: "B\"H",
		ok: true,
		action: "write",
		requestAction: "write",
		actualAction: "fileTransferCommit",
		clientRequestId: options.clientRequestId,
		path,
		bytes: result.bytes ?? bytes.length,
		sha256: result.sha256 || result.expectedSha256,
		transferId: result.transferId,
		externalTransport: "https-get",
		largePayloadPromoted: true
	};
}
