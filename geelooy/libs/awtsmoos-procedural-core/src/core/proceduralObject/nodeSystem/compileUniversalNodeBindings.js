// B"H
// Boruch Hashem
// Blessed is He
/** Authored active links become singular bindings or deterministic ordered source rivers. */

import { nodeSocketGraphType } from "../nodes/socketTypes.js";
import { selectActiveUniversalLinks } from "./selectActiveUniversalLinks.js";

export function linkedUniversalInputs(graph) {
	const map = new Map();
	for (const link of selectActiveUniversalLinks(graph)) {
		const key = `${link.to.nodeId}:${link.to.socketId}`;
		if (!map.has(key)) map.set(key, []);
		map.get(key).push(link);
	}
	return map;
}

function nodeSource(link) {
	return {
		kind: "node",
		nodeId: link.from.nodeId,
		port: link.from.socketId
	};
}

function multiInput(node, socket, linked) {
	const itemType = nodeSocketGraphType(socket.type);
	if (linked.length > 0) {
		return {
			type: "array",
			itemType,
			sources: linked.map(nodeSource)
		};
	}
	const configured = node.inputs[socket.id] ?? socket.defaultValue;
	return {
		type: "array",
		itemType,
		value: configured == null
			? []
			: Array.isArray(configured) ? configured : [configured]
	};
}

export function universalInputBinding(node, socket, links) {
	const linked = links.get(`${node.id}:${socket.id}`) ?? [];
	if (socket.multiInput) return multiInput(node, socket, linked);
	if (linked.length > 1) {
		throw new Error(`Single-input socket has multiple links: ${node.id}.${socket.id}`);
	}
	if (linked.length === 1) {
		return {
			type: nodeSocketGraphType(socket.type),
			source: nodeSource(linked[0])
		};
	}
	const value = node.inputs[socket.id];
	if (value && typeof value === "object" && !Array.isArray(value)
		&& typeof value.graphInput === "string") {
		return {
			type: nodeSocketGraphType(socket.type),
			source: { kind: "graph-input", input: value.graphInput }
		};
	}
	return {
		type: nodeSocketGraphType(socket.type),
		value: value ?? socket.defaultValue
	};
}

export function universalGraphInputs(definitions) {
	return Object.fromEntries(Object.entries(definitions).map(([name, definition]) => [
		name,
		{
			...definition,
			type: nodeSocketGraphType(definition.type)
		}
	]));
}
