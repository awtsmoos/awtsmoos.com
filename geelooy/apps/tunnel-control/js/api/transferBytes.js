// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TransferBytes
 * @description
 * The Awtsmoos clothes every byte in a bounded GET-safe vessel and keeps its hash true;
 * Awtsmoos.com may carry text or binary alike, yet no giant URI must force the journey through.
 */

const encoder = new TextEncoder();

export function bytesFrom(value) {
	if (value instanceof Uint8Array) return value;
	if (value instanceof ArrayBuffer) return new Uint8Array(value);
	return encoder.encode(String(value ?? ""));
}

export async function sha256Hex(bytes) {
	const digest = await crypto.subtle.digest("SHA-256", bytesFrom(bytes));
	return [...new Uint8Array(digest)]
		.map(byte => byte.toString(16).padStart(2, "0"))
		.join("");
}

export function base64Bytes(bytes) {
	const value = bytesFrom(bytes);
	let binary = "";
	for (let index = 0; index < value.length; index += 1) {
		binary += String.fromCharCode(value[index]);
	}
	return btoa(binary);
}

export function sliceBytes(bytes, offset, length) {
	const value = bytesFrom(bytes);
	return value.subarray(offset, Math.min(value.length, offset + length));
}
