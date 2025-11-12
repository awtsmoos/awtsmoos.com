// B"H
// FILE: /scripts/awtsmoos/binary/awtsmoos-json-serializer.js
/**
 * FINAL, FULLY IMPLEMENTED CLIENT-SIDE SERIALIZER for the .awtsmoosJSON binary format.
 * This version accurately mirrors the logic of the basic (non-v2) server-side serializer,
 * including all type handling, hashing, and binary construction.
 */

const MAGIC_JSON = "Aj";
const MAGIC_ARRAY = "Aa";
const textEncoder = new TextEncoder();

// ---[ 1. CORE HELPER FUNCTIONS ]---

function concat(arrays) {
	let len = 0;
	for (const a of arrays) len += a.length;
	const r = new Uint8Array(len);
	let offset = 0;
	for (const a of arrays) {
		r.set(a, offset);
		offset += a.length;
	}
	return r;
}

function packedLength(lengthSize) {
	return {
		1: 0,
		2: 1,
		4: 2,
		8: 3
	} [lengthSize] ?? null;
}

function unpackLength(lengthType) {
	return [1, 2, 4, 8][lengthType] || 0;
}

function packTypeAndLengthSize(type, lengthSize) {
	const modLen = packedLength(lengthSize);
	return modLen === null ? null : type | (modLen << 6);
}

function writeConditional(amount) {
	let size, buf, view;
	if (amount < 256) {
		size = 1;
		buf = new Uint8Array(1);
		view = new DataView(buf.buffer);
		view.setUint8(0, Number(amount));
	} else if (amount < 65536) {
		size = 2;
		buf = new Uint8Array(2);
		view = new DataView(buf.buffer);
		view.setUint16(0, Number(amount), false);
	} else if (amount < 4294967296) {
		size = 4;
		buf = new Uint8Array(4);
		view = new DataView(buf.buffer);
		view.setUint32(0, Number(amount), false);
	} else {
		size = 8;
		buf = new Uint8Array(8);
		view = new DataView(buf.buffer);
		view.setBigUint64(0, BigInt(amount), false);
	}
	return {
		buffer: buf,
		size
	};
}

function writeToBuffer(target, value, byteSize, offset) {
	const view = new DataView(target.buffer, target.byteOffset);
	switch (byteSize) {
		case 1:
			view.setUint8(offset, value);
			break;
		case 2:
			view.setUint16(offset, value, false);
			break;
		case 4:
			view.setUint32(offset, value, false);
			break;
		case 8:
			view.setBigUint64(offset, BigInt(value), false);
			break;
	}
}

// Joseph Myers's md5() algorithm in JavaScript
function md5(str) {
	let I = (x, y, z) => (x & y) | (~x & z),
		J = (x, y, z) => (x & z) | (y & ~z),
		K = (x, y, z) => x ^ y ^ z,
		L = (x, y, z) => y ^ (x | ~z),
		M = (a, b, c, d, x, s, ac) => {
			a = (a + x + ac) & 0xffffffff;
			a = (a << s | a >>> (32 - s)) & 0xffffffff;
			return (a + b) & 0xffffffff
		},
		A = 0x67452301,
		B = 0xefcdab89,
		C = 0x98badcfe,
		D = 0x10325476,
		w = [],
		l = str.length;
	for (let i = 0; i < l - 3; i += 4) w.push(str.charCodeAt(i) | str.charCodeAt(i + 1) << 8 | str.charCodeAt(i + 2) << 16 | str.charCodeAt(i + 3) << 24);
	let i = l % 4;
	if (i > 0) {
		let t = 0;
		for (let j = 0; j < i; j++) t |= str.charCodeAt(l - i + j) << j * 8;
		w.push(t)
	}
	w.push(0x80);
	while (w.length % 16 != 14) w.push(0);
	w.push(l * 8, 0);
	for (let i = 0; i < w.length; i += 16) {
		let a = A,
			b = B,
			c = C,
			d = D;
		for (let j = 0; j < 64; j++) {
			let F, g;
			if (j < 16) {
				F = I(b, c, d);
				g = j
			} else if (j < 32) {
				F = J(b, c, d);
				g = (1 + 5 * j) % 16
			} else if (j < 48) {
				F = K(b, c, d);
				g = (5 + 3 * j) % 16
			} else {
				F = L(b, c, d);
				g = (7 * j) % 16
			}
			let t = d;
			d = c;
			c = b;
			b = M(b, a, F, w[i + g], [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21][j], [-680876936, -389564586, 606105819, -1044525330, -176418897, 1200080426, -1473231341, -45705983, 1770035416, -1958414417, -42063, -1990404162, 1804603682, -40341101, -1502002290, 1236535329, -165796510, -1069501632, 643717713, -373897302, -701558691, 359595176, -810080444, 1163531501, -1444681467, -51403784, 1735328473, -1926607735, -378558, -2022574463, 1839030562, -35309556, -1530992060, 1272893353, -155497632, -1094730640, 681279174, -358537222, -722521979, 76029189, -640364487, -421815835, 530742520, -995338651, -198630844, 1126891415, -1416354905, -57434055, 1700485571, -1894986606, -1051523, -2054922799, 1873313359, -30611744, -1560198380, 1232272450, -1423207103, -405537848, 568446438, -1019803690, -187363961, 1105393458, -1444681467, -51403784, 1735328473, -1926607735, -378558][j]);
			a = t
		}
		A = (A + a) & 0xffffffff;
		B = (B + b) & 0xffffffff;
		C = (C + c) & 0xffffffff;
		D = (D + d) & 0xffffffff
	}
	let v = new DataView(new ArrayBuffer(16));
	v.setUint32(0, A, true);
	v.setUint32(4, B, true);
	v.setUint32(8, C, true);
	v.setUint32(12, D, true);
	return new Uint8Array(v.buffer)
}

// ---[ 2. VALUE & ENTRY SERIALIZATION ]---

function serializeValue(value) {
	let type, data;
	if (value === true) {
		type = 5;
	} else if (value === false) {
		type = 0;
	} else if (value === null) {
		type = 7;
	} else if (value === undefined) {
		type = 6;
	} else if (typeof value === 'string') {
		type = 2;
		data = textEncoder.encode(value);
	} else if (typeof value === 'number') {
		let info;
		if (Number.isNaN(value)) {
			type = 26
		} else if (value === Infinity) {
			type = 24
		} else if (value === -Infinity) {
			type = 25
		} else if (value >= 0) {
			info = writeConditional(value);
			type = {
				1: 4,
				2: 9,
				4: 10,
				8: 22
			} [info.size];
		} else {
			info = writeConditional(Math.abs(value));
			type = {
				1: 11,
				2: 12,
				4: 13,
				8: 23
			} [info.size];
		}
		if (info) data = info.buffer;
	} else if (Array.isArray(value)) {
		type = 3;
		data = serializeArray(value);
	} else if (value instanceof Uint8Array) {
		type = 8;
		data = value;
	} else if (typeof value === 'object' && value !== null) {
		type = 1;
		data = serializeObject(value);
	} else {
		type = 7;
	}
	if ([0, 5, 6, 7, 24, 25, 26].includes(type)) {
		data = new Uint8Array(0);
	}
	const valueLengthInfo = writeConditional(data.length);
	const typeLengthByte = packTypeAndLengthSize(type, valueLengthInfo.size);
	return {
		data,
		type,
		valueLengthInfo,
		typeLengthByte
	};
}

function serializeMetadataEntry(entry) {
	const {
		key,
		typeLengthByte,
		valueLengthInfo,
		offsetOfValueInMain
	} = entry;
	const keyBuffer = textEncoder.encode(key);
	const keyLengthInfo = writeConditional(keyBuffer.length);
	const bufferOffset = writeConditional(offsetOfValueInMain);
	const packedLengthSizes = (packedLength(keyLengthInfo.size) << 2) | packedLength(bufferOffset.size);
	return concat([new Uint8Array([packedLengthSizes, typeLengthByte]), keyLengthInfo.buffer, valueLengthInfo.buffer, keyBuffer, bufferOffset.buffer]);
}

// ---[ 3. ARRAY & OBJECT SERIALIZATION ]---

function serializeArray(arr) {
	const header = [textEncoder.encode(MAGIC_ARRAY)];
	const offsetSizePlaceholder = new Uint8Array(1);
	header.push(offsetSizePlaceholder);
	const dataBuffers = [],
		offsets = [];
	let currentOffset = concat(header)
		.length;
	for (const item of arr) {
		const {
			data,
			valueLengthInfo,
			typeLengthByte
		} = serializeValue(item);
		const itemBuffer = concat([new Uint8Array([typeLengthByte]), valueLengthInfo.buffer, data]);
		offsets.push(currentOffset);
		dataBuffers.push(itemBuffer);
		currentOffset += itemBuffer.length;
	}
	const dataLength = dataBuffers.reduce((sum, buf) => sum + buf.length, 0);
	const offsetSize = dataLength < 256 ? 1 : dataLength < 65536 ? 2 : dataLength < 4294967296 ? 4 : 8;
	const lengthInfo = writeConditional(arr.length);
	const arrayLengthSize = lengthInfo.size;
	const packedByte = ((packedLength(arrayLengthSize) << 2) | packedLength(offsetSize));
	offsetSizePlaceholder[0] = packedByte;
	const indexTable = new Uint8Array(arr.length * offsetSize);
	offsets.forEach((offset, i) => writeToBuffer(indexTable, offset, offsetSize, i * offsetSize));
	return concat([concat(header), concat(dataBuffers), indexTable, lengthInfo.buffer]);
}

function serializeObject(obj) {
	const header = [textEncoder.encode(MAGIC_JSON)];
	const offsetSizePlaceholder = new Uint8Array(1);
	header.push(offsetSizePlaceholder);
	const dataBuffers = [],
		metadataTable = [];
	let offset = concat(header)
		.length;
	const keys = Object.keys(obj);
	for (const key of keys) {
		const value = obj[key];
		const valueBufferInfo = serializeValue(value);
		metadataTable.push({
			key,
			typeLengthByte: valueBufferInfo.typeLengthByte,
			valueLengthInfo: valueBufferInfo.valueLengthInfo,
			offsetOfValueInMain: offset
		});
		dataBuffers.push(valueBufferInfo.data);
		offset += valueBufferInfo.data.length;
	}
	const {
		hashBuffers,
		serializedMetadata,
		offsetSizeMetadataArray,
		hashTableSize
	} = makeHashTableFromMetadata(metadataTable);
	const dataLength = dataBuffers.reduce((sum, buf) => sum + buf.length, 0);
	const {
		footer,
		packedHeaderSizes
	} = getSerializedMetadata({
		sml: serializedMetadata.length,
		osma: offsetSizeMetadataArray,
		dl: dataLength,
		tk: keys.length,
		hts: hashTableSize
	});
	offsetSizePlaceholder[0] = packedHeaderSizes;
	return concat([concat(header), concat(dataBuffers), hashBuffers, serializedMetadata, footer]);
}

function makeHashTableFromMetadata(metadataTable) {
	const serializedEntryBuffers = metadataTable.map(serializeMetadataEntry);
	const serializedMetadata = serializeArray(serializedEntryBuffers);
	const metaOfMeta = (() => {
	    const o = MAGIC_ARRAY.length,
	        h = serializedMetadata[o];
	    const aLS = unpackLength((h >> 2) & 3);
	    const view = new DataView(serializedMetadata.buffer, serializedMetadata.byteOffset);
	    let aL;
	    switch (aLS) {
	        case 1: aL = view.getUint8(serializedMetadata.length - aLS); break;
	        case 2: aL = view.getUint16(serializedMetadata.length - aLS, false); break;
	        case 4: aL = view.getUint32(serializedMetadata.length - aLS, false); break;
	        case 8: aL = Number(view.getBigUint64(serializedMetadata.length - aLS, false)); break;
	        default: aL = 0;
	    }
	    return {
	        oS: unpackLength(h & 3),
	        aLS,
	        aL
	    };
	})();
	const hashTableSize = metadataTable.length * 2;
	const hashTableEntrySize = metaOfMeta.oS;
	const hashBuffer = new Uint8Array(hashTableSize * hashTableEntrySize);
	metadataTable.forEach((q, i) => {
		const hash = new DataView(md5(q.key)
				.buffer)
			.getUint32(0, false);
		let index = hash % hashTableSize;
		while (true) {
			let empty = true;
			for (let k = 0; k < hashTableEntrySize; k++)
				if (hashBuffer[index * hashTableEntrySize + k] !== 0) {
					empty = false;
					break;
				} if (empty) break;
			index = (index + 1) % hashTableSize;
		}
		const iTS = serializedMetadata.length - metaOfMeta.aLS - (metaOfMeta.aL * metaOfMeta.oS);
		const view = new DataView(serializedMetadata.buffer, serializedMetadata.byteOffset);
		const offsetInIndexTable = iTS + i * metaOfMeta.oS;
		let valOffset;
		switch (metaOfMeta.oS) {
		    case 1: valOffset = view.getUint8(offsetInIndexTable); break;
		    case 2: valOffset = view.getUint16(offsetInIndexTable, false); break;
		    case 4: valOffset = view.getUint32(offsetInIndexTable, false); break;
		    case 8: valOffset = Number(view.getBigUint64(offsetInIndexTable, false)); break;
		    default: valOffset = 0;
		}	
		writeToBuffer(hashBuffer, valOffset, metaOfMeta.oS, index * metaOfMeta.oS);
	});
	return {
		hashBuffers: hashBuffer,
		serializedMetadata,
		offsetSizeMetadataArray: metaOfMeta.oS,
		hashTableSize
	};
}

function getSerializedMetadata({
	sml,
	osma,
	dl,
	tk,
	hts
}) {
	const smai = writeConditional(sml),
		tli = writeConditional(tk),
		hli = writeConditional(hts);
	const os = dl < 256 ? 1 : dl < 65536 ? 2 : dl < 4294967296 ? 4 : 8;
	const pas = (packedLength(os) << 2) | packedLength(osma);
	const foot = concat([new Uint8Array([pas]), tli.buffer, smai.buffer, hli.buffer]);
	const packAll = (packedLength(tli.size) << 4) | (packedLength(smai.size) << 2) | packedLength(hli.size);
	return {
		footer: foot,
		packedHeaderSizes: packAll
	};
}

// ---[ 4. PUBLIC EXPORT ]---

export function serialize(jsonObject) {
	if (typeof jsonObject !== 'object' || jsonObject === null) return null;
	try {
		return Array.isArray(jsonObject) ? serializeArray(jsonObject) : serializeObject(jsonObject);
	} catch (e) {
		console.error("Awtsmoos Serialization Error:", e);
		return null;
	}
}