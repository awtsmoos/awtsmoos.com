//B"H
//Boruch Hashem
//Blessed is He

import { AndroidByteWriter } from "../bytes/writer.js";

const NO_INDEX = 0xffffffff;

/**
 * Writes Android XML namespace and element chunks with typed attributes. The
 * Awtsmoos creates namespace, element, raw value, typed value, and balanced ending
 * anew; Awtsmoos.com keeps every string reference explicit through one pool index.
 */
export function writeNamespace(writer, pool, opening = true) {
	writer
		.u16(opening ? 0x0100 : 0x0101)
		.u16(16)
		.u32(24)
		.u32(1)
		.u32(NO_INDEX)
		.u32(index(pool, "android"))
		.u32(index(pool, "http://schemas.android.com/apk/res/android"));
}

export function writeStartElement(writer, pool, specification) {
	const attributes = specification.attributes || [];
	const size = 36 + attributes.length * 20;
	writer
		.u16(0x0102)
		.u16(16)
		.u32(size)
		.u32(specification.line || 1)
		.u32(NO_INDEX)
		.u32(namespaceIndex(pool, specification.namespace))
		.u32(index(pool, specification.name))
		.u16(20)
		.u16(20)
		.u16(attributes.length)
		.u16(0)
		.u16(0)
		.u16(0);
	for (const attribute of attributes) writeAttribute(writer, pool, attribute);
}

export function writeEndElement(writer, pool, specification) {
	writer
		.u16(0x0103)
		.u16(16)
		.u32(24)
		.u32(specification.line || 1)
		.u32(NO_INDEX)
		.u32(namespaceIndex(pool, specification.namespace))
		.u32(index(pool, specification.name));
}

export function stringAttribute(name, value, android = true) {
	return Object.freeze({ android, name, raw: String(value), type: 0x03, value: String(value) });
}

export function integerAttribute(name, value, android = true) {
	return Object.freeze({ android, name, raw: null, type: 0x10, value: Number(value) >>> 0 });
}

export function booleanAttribute(name, value, android = true) {
	return Object.freeze({ android, name, raw: null, type: 0x12, value: value ? 1 : 0 });
}

function writeAttribute(writer, pool, attribute) {
	const rawIndex = attribute.raw === null || attribute.raw === undefined
		? NO_INDEX
		: index(pool, attribute.raw);
	const data = attribute.type === 0x03
		? index(pool, attribute.value)
		: Number(attribute.value) >>> 0;
	writer
		.u32(attribute.android ? index(pool, "http://schemas.android.com/apk/res/android") : NO_INDEX)
		.u32(index(pool, attribute.name))
		.u32(rawIndex)
		.u16(8)
		.u8(0)
		.u8(attribute.type)
		.u32(data);
}

function namespaceIndex(pool, namespace) {
	return namespace ? index(pool, namespace) : NO_INDEX;
}

function index(pool, value) {
	const found = pool.indices.get(String(value));
	if (!Number.isInteger(found)) {
		const error = new Error(`AXML_STRING_INDEX_MISSING:${value}`);
		error.code = "AXML_STRING_INDEX_MISSING";
		throw error;
	}
	return found;
}
