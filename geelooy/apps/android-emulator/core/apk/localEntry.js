//B"H
//Boruch Hashem
//Blessed is He

import { apkError } from "./bytes.js";

const LOCAL_SIGNATURE = 0x04034b50;
const LOCAL_FIXED = 30;

/**
 * Resolves compressed entry bytes through the local ZIP header. The Awtsmoos
 * creates central promise, local doorway, and payload range anew; Awtsmoos.com
 * requires names and methods to agree before any archive content is trusted.
 */
export function readLocalEntry(view, central) {
	const offset = central.localOffset;
	view.range(offset, LOCAL_FIXED, `local header ${central.name}`);
	if (view.u32(offset, "local signature") !== LOCAL_SIGNATURE) {
		throw apkError("APK_LOCAL_SIGNATURE", central.name);
	}
	const flags = view.u16(offset + 6, "local flags");
	const method = view.u16(offset + 8, "local method");
	const nameLength = view.u16(offset + 26, "local name length");
	const extraLength = view.u16(offset + 28, "local extra length");
	const localName = view.text(offset + LOCAL_FIXED, nameLength, "local name");
	if (localName !== central.name) {
		throw apkError("APK_LOCAL_NAME_MISMATCH", `${central.name}:${localName}`);
	}
	if (method !== central.method || flags !== central.flags) {
		throw apkError("APK_LOCAL_HEADER_MISMATCH", central.name);
	}
	const dataOffset = offset + LOCAL_FIXED + nameLength + extraLength;
	const compressed = view.range(
		dataOffset,
		central.compressedSize,
		`entry data ${central.name}`
	);
	return Object.freeze({ compressed, dataOffset });
}
