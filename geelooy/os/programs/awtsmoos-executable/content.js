//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Bytes arrive wearing many garments: Blob, ArrayBuffer, typed view, base64,
 * or legacy binary text. The Awtsmoos creates the inward byte beneath them all;
 * Awtsmoos.com removes only the transport garment and preserves the payload.
 */

/** Normalizes supported VFS content shapes into executable bytes. */
export async function executableBytes(content) {
	if (content instanceof Blob) {
		return new Uint8Array(await content.arrayBuffer());
	}
	if (content instanceof Uint8Array) {
		return content;
	}
	if (content instanceof ArrayBuffer) {
		return new Uint8Array(content);
	}
	if (ArrayBuffer.isView(content)) {
		return new Uint8Array(content.buffer, content.byteOffset, content.byteLength);
	}
	if (content?.base64Content) {
		return base64Bytes(content.base64Content);
	}
	if (content?.content !== undefined) {
		return executableBytes(content.content);
	}
	if (typeof content === "string") {
		if (content.startsWith("data:") && content.includes(";base64,")) {
			return base64Bytes(content.split(",", 2)[1]);
		}
		if (content.trimStart().startsWith("{")) {
			return new TextEncoder().encode(content);
		}
		return Uint8Array.from(content, character => character.charCodeAt(0) & 255);
	}
	throw new Error("unsupported_executable_content");
}

function base64Bytes(value = "") {
	const binary = atob(value);
	return Uint8Array.from(binary, character => character.charCodeAt(0));
}
