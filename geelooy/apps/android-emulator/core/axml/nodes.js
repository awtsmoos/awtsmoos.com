//B"H
//Boruch Hashem
//Blessed is He

import { axmlError } from "./chunks.js";
import { decodeAndroidValue } from "./value.js";

const NO_INDEX = 0xffffffff;

/**
 * Decodes Android XML namespace and element nodes across standard and compact
 * writer headers. The Awtsmoos creates extension, attribute, and balanced name
 * anew; Awtsmoos.com keeps the fixed node prefix distinct from header-size claims.
 */
export function readNamespaceNode(view, chunk, strings, prefixes) {
	if (chunk.size === 16) return;
	if (chunk.size < 24) throw axmlError("AXML_NAMESPACE_SIZE", String(chunk.size));
	const prefix = stringAt(strings, view.u32(chunk.offset + 16, "namespace prefix"));
	const uri = stringAt(strings, view.u32(chunk.offset + 20, "namespace URI"));
	if (uri) prefixes.set(uri, prefix || "");
}

export function readStartElementNode(view, chunk, strings, prefixes) {
	if (chunk.headerSize < 16 || chunk.size < 36) {
		throw axmlError("AXML_ELEMENT_HEADER", `${chunk.headerSize}:${chunk.size}`);
	}
	const extension = chunk.offset + 16;
	const namespace = stringAt(strings, view.u32(extension, "element namespace"));
	const name = requiredString(strings, view.u32(extension + 4, "element name"), "element");
	const attributeStart = view.u16(extension + 8, "attribute start");
	const attributeSize = view.u16(extension + 10, "attribute size");
	const attributeCount = view.u16(extension + 12, "attribute count");
	if (attributeStart < 20 || attributeSize < 20) {
		throw axmlError("AXML_ATTRIBUTE_SHAPE", `${attributeStart}:${attributeSize}`);
	}
	const attributesOffset = extension + attributeStart;
	view.range(attributesOffset, attributeCount * attributeSize, "element attributes");
	const attributes = [];
	for (let index = 0; index < attributeCount; index += 1) {
		attributes.push(readAttribute(
			view,
			attributesOffset + index * attributeSize,
			strings,
			prefixes,
			attributeSize
		));
	}
	return {
		attributes,
		children: [],
		line: view.u32(chunk.offset + 8, "element line"),
		name,
		namespace
	};
}

export function closeElementNode(view, chunk, strings, stack) {
	if (chunk.size < 24) throw axmlError("AXML_END_ELEMENT_SIZE", String(chunk.size));
	const name = requiredString(
		strings,
		view.u32(chunk.offset + 20, "end element name"),
		"end element"
	);
	const opened = stack.pop();
	if (!opened || opened.name !== name) {
		throw axmlError("AXML_ELEMENT_MISMATCH", `${opened?.name || "none"}:${name}`);
	}
}

export function freezeAndroidXmlNode(node) {
	return Object.freeze({
		attributes: Object.freeze(node.attributes),
		children: Object.freeze(node.children.map(freezeAndroidXmlNode)),
		line: node.line,
		name: node.name,
		namespace: node.namespace
	});
}

function readAttribute(view, offset, strings, prefixes, attributeSize) {
	view.range(offset, attributeSize, "attribute");
	const namespace = stringAt(strings, view.u32(offset, "attribute namespace"));
	const localName = requiredString(strings, view.u32(offset + 4, "attribute name"), "attribute");
	const rawIndex = view.u32(offset + 8, "attribute raw value");
	if (view.u16(offset + 12, "typed value size") !== 8) {
		throw axmlError("AXML_TYPED_VALUE_SIZE", String(offset));
	}
	const typed = decodeAndroidValue(
		view.u8(offset + 15, "attribute value type"),
		view.u32(offset + 16, "attribute value data"),
		strings
	);
	const raw = stringAt(strings, rawIndex);
	const prefix = namespace ? prefixes.get(namespace) : "";
	return Object.freeze({
		localName,
		name: prefix ? `${prefix}:${localName}` : localName,
		namespace,
		raw,
		typed,
		value: raw ?? typed.value
	});
}

function stringAt(strings, index) {
	if (index === NO_INDEX) return null;
	if (index >= strings.length) throw axmlError("AXML_STRING_INDEX", `${index}:${strings.length}`);
	return strings[index];
}

function requiredString(strings, index, label) {
	const value = stringAt(strings, index);
	if (value === null) throw axmlError("AXML_NAME_MISSING", label);
	return value;
}
