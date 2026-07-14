//B"H
//Boruch Hashem
//Blessed is He

import { axmlError, readAndroidXmlChunks } from "./chunks.js";
import {
	closeElementNode,
	freezeAndroidXmlNode,
	readNamespaceNode,
	readStartElementNode
} from "./nodes.js";
import { readAndroidStringPool } from "./stringPool.js";

/**
 * Reconstructs an immutable Android binary-XML element tree. The Awtsmoos creates
 * namespace, element, child stack, and balanced ending anew; Awtsmoos.com keeps
 * node-layout details in their own vessel and rejects every unbalanced document.
 */
export function parseAndroidBinaryXml(input, options = {}) {
	const state = readAndroidXmlChunks(input, options);
	const poolChunk = state.chunks.find(chunk => chunk.type === 0x0001);
	if (!poolChunk) throw axmlError("AXML_STRING_POOL_MISSING");
	const strings = readAndroidStringPool(state.view, poolChunk, options).strings;
	const prefixes = new Map();
	const stack = [];
	const roots = [];
	for (const chunk of state.chunks) {
		if (chunk.type === 0x0100) {
			readNamespaceNode(state.view, chunk, strings, prefixes);
		}
		if (chunk.type === 0x0102) {
			const node = readStartElementNode(
				state.view,
				chunk,
				strings,
				prefixes
			);
			if (stack.length) stack.at(-1).children.push(node);
			else roots.push(node);
			stack.push(node);
		}
		if (chunk.type === 0x0103) {
			closeElementNode(state.view, chunk, strings, stack);
		}
	}
	if (stack.length) throw axmlError("AXML_ELEMENT_UNCLOSED", stack.at(-1).name);
	if (roots.length !== 1) throw axmlError("AXML_ROOT_COUNT", String(roots.length));
	return Object.freeze({
		chunkCount: state.chunks.length,
		root: freezeAndroidXmlNode(roots[0]),
		strings
	});
}
