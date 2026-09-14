//B"H
//Boruch Hashem
//Blessed be He

const { ByteWriter } = require("./ByteWriter.js");
const { MAGIC, OP, VERSION } = require("./NativeWebV4Format.js");

/**
 * Encodes handle-addressed web IR into a self-contained v4 byte stream.
 * Every string is package-local, so native runtimes need no external tables.
 * @param {{nodes?:Array<object>,styles?:Array<object>,events?:Array<object>}} ir Web IR.
 * @returns {Buffer} Native web v4 executable bytes.
 */
function encodeNativeWebV4(ir = {}) {
	const pool = [];
	const code = new ByteWriter();
	for (const node of ir.nodes || []) {
		encodeNode(code, pool, node);
	}
	for (const style of ir.styles || []) {
		encodeStyle(code, pool, style);
	}
	for (const event of ir.events || []) {
		encodeEvent(code, pool, event);
	}
	code.u8(OP.END);
	const output = new ByteWriter();
	output.raw(Buffer.from(MAGIC, "ascii"));
	output.u8(VERSION);
	output.varUint(pool.length);
	for (const value of pool) {
		output.string(value);
	}
	output.bytesWithLength(code.toBuffer());
	return output.toBuffer();
}

/** Encodes one DOM node and its non-event attributes. */
function encodeNode(writer, pool, node) {
	writer.u8(OP.CREATE_NODE);
	writer.varUint(node.handle || 0);
	writer.varUint(node.parentHandle || 0);
	writeRef(writer, pool, node.tag || "div");
	writeRef(writer, pool, node.id || "");
	writeRef(writer, pool, node.text || "");
	for (const [name, value] of Object.entries(node.attrs || {})) {
		if (name === "id" || name.startsWith("on")) {
			continue;
		}
		writer.u8(OP.SET_ATTR);
		writer.varUint(node.handle || 0);
		writeRef(writer, pool, name);
		writeRef(writer, pool, value);
	}
}

/** Encodes selector-based style records without host-side CSS parsing. */
function encodeStyle(writer, pool, style) {
	if (style.handle) {
		writer.u8(OP.SET_STYLE_HANDLE);
		writer.varUint(style.handle);
		writeRef(writer, pool, style.property);
		writeRef(writer, pool, style.value);
		return;
	}
	const selector = style.target || style.selector || "";
	for (const [property, value] of Object.entries(style.props || {})) {
		writer.u8(OP.SET_STYLE);
		writeRef(writer, pool, selector);
		writeRef(writer, pool, property);
		writeRef(writer, pool, value);
	}
}

/** Encodes one native text-mutation event primitive. */
function encodeEvent(writer, pool, event) {
	writer.u8(OP.BIND_TEXT_EVENT);
	writer.varUint(event.targetHandle || 0);
	writeRef(writer, pool, event.event || "click");
	writer.varUint(event.actionTargetHandle || 0);
	writeRef(writer, pool, event.value || "");
}

function writeRef(writer, pool, value) {
	writer.varUint(poolIndex(pool, value));
}

function poolIndex(pool, value) {
	const text = String(value ?? "");
	let index = pool.indexOf(text);
	if (index < 0) {
		index = pool.length;
		pool.push(text);
	}
	return index;
}

module.exports = { encodeNativeWebV4 };
