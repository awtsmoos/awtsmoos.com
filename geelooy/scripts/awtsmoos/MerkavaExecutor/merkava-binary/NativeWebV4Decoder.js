//B"H
//Boruch Hashem
//Blessed be He

const { ByteReader } = require("./ByteReader.js");
const { MAGIC, OP, OP_NAME, VERSION } = require("./NativeWebV4Format.js");

/**
 * Decodes self-contained native web v4 bytecode into immutable instruction IR.
 * @param {Buffer|Uint8Array} input Native web v4 bytes.
 * @returns {{version:number,pool:string[],ops:Array<object>}} Decoded program.
 */
function decodeNativeWebV4(input) {
	const reader = new ByteReader(input);
	const magic = reader.bytes(4).toString("ascii");
	if (magic !== MAGIC) {
		throw new Error(`Bad native web magic: ${magic}`);
	}
	const version = reader.u8();
	if (version !== VERSION) {
		throw new Error(`Unsupported native web version: ${version}`);
	}
	const pool = readPool(reader);
	const code = new ByteReader(reader.bytesWithLength());
	const ops = [];
	while (!code.done()) {
		const op = code.u8();
		if (op === OP.END) {
			ops.push(Object.freeze({ op: "END" }));
			break;
		}
		ops.push(readOperation(code, pool, op));
	}
	return Object.freeze({
		ops: Object.freeze(ops),
		pool: Object.freeze(pool),
		version
	});
}

function readOperation(reader, pool, op) {
	if (op === OP.CREATE_NODE) {
		return Object.freeze({
			handle: reader.varUint(),
			parentHandle: reader.varUint(),
			tag: readRef(reader, pool),
			id: readRef(reader, pool),
			text: readRef(reader, pool),
			op: "CREATE_NODE"
		});
	}
	if (op === OP.SET_ATTR) {
		return Object.freeze({
			handle: reader.varUint(),
			name: readRef(reader, pool),
			value: readRef(reader, pool),
			op: "SET_ATTR"
		});
	}
	if (op === OP.SET_STYLE) {
		return Object.freeze({
			selector: readRef(reader, pool),
			property: readRef(reader, pool),
			value: readRef(reader, pool),
			op: "SET_STYLE"
		});
	}
	if (op === OP.SET_STYLE_HANDLE) {
		return Object.freeze({
			handle: reader.varUint(),
			property: readRef(reader, pool),
			value: readRef(reader, pool),
			op: "SET_STYLE_HANDLE"
		});
	}
	if (op === OP.BIND_TEXT_EVENT) {
		return Object.freeze({
			targetHandle: reader.varUint(),
			event: readRef(reader, pool),
			actionTargetHandle: reader.varUint(),
			value: readRef(reader, pool),
			op: "BIND_TEXT_EVENT"
		});
	}
	throw new Error(`Unknown native web opcode: ${OP_NAME[op] || op}`);
}

function readPool(reader) {
	const count = reader.varUint();
	const pool = [];
	for (let index = 0; index < count; index += 1) {
		pool.push(reader.string());
	}
	return pool;
}

function readRef(reader, pool) {
	const index = reader.varUint();
	if (index >= pool.length) {
		throw new Error(`Native web string ref out of range: ${index}`);
	}
	return pool[index];
}

module.exports = { decodeNativeWebV4 };
