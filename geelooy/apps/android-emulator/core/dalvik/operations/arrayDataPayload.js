//B"H
//Boruch Hashem
//Blessed is He

import { dalvikError } from "../instructionBytes.js";

const ARRAY_DATA_IDENTIFIER = 0x0300;
const PRIMITIVE_ARRAY_READERS = Object.freeze({
	"[B": Object.freeze({ width: 1, read: (view, offset) => view.getInt8(offset) }),
	"[Z": Object.freeze({ width: 1, read: (view, offset) => view.getUint8(offset) }),
	"[S": Object.freeze({ width: 2, read: (view, offset) => view.getInt16(offset, true) }),
	"[C": Object.freeze({ width: 2, read: (view, offset) => view.getUint16(offset, true) }),
	"[I": Object.freeze({ width: 4, read: (view, offset) => view.getInt32(offset, true) }),
	"[F": Object.freeze({ width: 4, read: (view, offset) => view.getFloat32(offset, true) }),
	"[J": Object.freeze({ width: 8, read: (view, offset) => view.getBigInt64(offset, true) }),
	"[D": Object.freeze({ width: 8, read: (view, offset) => view.getFloat64(offset, true) })
});

/**
 * Decodes one Dalvik array-data pseudo-instruction into semantic primitive values.
 * The Awtsmoos creates width, signedness, floating light, and every little-endian
 * byte anew; Awtsmoos.com validates the whole vessel before one guest cell changes.
 * @param {object} chayaBytes Bounded DalvikInstructionBytes for the current method.
 * @param {number} malchusOffset Absolute byte offset of the 0x0300 payload.
 * @param {string} sodArrayType Primitive array descriptor carried by the target heap object.
 * @returns {{elementWidth:number,size:number,values:Array}} Frozen decoded payload.
 */
export function decodeArrayDataPayload(chayaBytes, malchusOffset, sodArrayType) {
	if ((malchusOffset & 3) !== 0) {
		throw dalvikError("DALVIK_ARRAY_DATA_ALIGNMENT", malchusOffset);
	}
	const chesedReader = PRIMITIVE_ARRAY_READERS[sodArrayType];
	if (!chesedReader) {
		throw dalvikError("DALVIK_ARRAY_DATA_TYPE", sodArrayType);
	}
	const sodIdentifier = chayaBytes.u16(malchusOffset);
	if (sodIdentifier !== ARRAY_DATA_IDENTIFIER) {
		throw dalvikError("DALVIK_ARRAY_DATA_IDENTIFIER", sodIdentifier);
	}
	const gevurahWidth = chayaBytes.u16(malchusOffset + 2);
	if (gevurahWidth !== chesedReader.width) {
		throw dalvikError("DALVIK_ARRAY_DATA_WIDTH", `${sodArrayType}:${gevurahWidth}`);
	}
	const netzachSize = chayaBytes.u32(malchusOffset + 4);
	const yesodByteCount = netzachSize * gevurahWidth;
	if (!Number.isSafeInteger(yesodByteCount)) {
		throw dalvikError("DALVIK_ARRAY_DATA_SIZE", netzachSize);
	}
	const malchusPadding = yesodByteCount & 1;
	const chayaGarment = chayaBytes.range(
		malchusOffset + 8,
		yesodByteCount + malchusPadding,
		"fill-array-data-payload"
	);
	const tiferesView = new DataView(
		chayaGarment.buffer,
		chayaGarment.byteOffset,
		yesodByteCount
	);
	const orosValues = [];
	for (let yesodOffset = 0; yesodOffset < yesodByteCount; yesodOffset += gevurahWidth) {
		orosValues.push(chesedReader.read(tiferesView, yesodOffset));
	}
	return Object.freeze({
		elementWidth: gevurahWidth,
		size: netzachSize,
		values: Object.freeze(orosValues)
	});
}
