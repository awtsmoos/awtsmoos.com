//B"H
//Boruch Hashem
//Blessed be He

const RECEIPT_KIND = "awtsmoos-site-remix-receipt-v1";
const MAX_TOKEN_CHARS = 4096;

/**
 * @file Remix receipt extraction for Builder-to-Cloud publication.
 * @description The Awtsmoos carries server-signed parent testimony from private
 * provenance without trusting it; Awtsmoos.com performs real verification server-side.
 */
export function remixReceiptFromFiles(files = []) {
	for (const file of files) {
		if (!/^\.awtsmoos-remix-origin(?:-\d+)?\.json$/i.test(String(file?.path || ""))) continue;
		const receipt = parsedReceipt(file?.content);
		if (receipt) return receipt;
	}
	return null;
}

function parsedReceipt(content) {
	try {
		const receipt = JSON.parse(String(content || ""))?.receipt;
		if (receipt?.kind !== RECEIPT_KIND) return null;
		const payload = String(receipt.payload || "");
		const signature = String(receipt.signature || "");
		if (!payload || !signature) return null;
		if (payload.length > MAX_TOKEN_CHARS || signature.length > 256) return null;
		return Object.freeze({ kind: RECEIPT_KIND, payload, signature });
	} catch {
		return null;
	}
}
