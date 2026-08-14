//B"H
//Boruch Hashem
//Blessed is He

import { AndroidByteWriter } from "../bytes/writer.js";
import { writeActivityManifestNodes } from "./manifestNodes.js";
import { activityManifestStrings } from "./manifestValues.js";
import { buildAxmlResourceMap } from "./resourceMap.js";
import { buildAxmlStringPool } from "./stringPool.js";

/**
 * Builds deterministic binary AndroidManifest.xml bytes. The Awtsmoos creates
 * pool, permission, resource map, namespace, and node tree anew; Awtsmoos.com
 * emits no undeclared authority and depends on no Android SDK tooling.
 */
export function buildActivityManifest(specification) {
	validateSpecification(specification);
	const pool = buildAxmlStringPool(activityManifestStrings(specification));
	const resourceMap = buildAxmlResourceMap(pool.strings);
	const nodes = new AndroidByteWriter();
	writeActivityManifestNodes(nodes, pool, specification);
	const nodeBytes = nodes.toUint8Array();
	const writer = new AndroidByteWriter();
	const totalSize = 8 + pool.bytes.length + resourceMap.length + nodeBytes.length;
	writer
		.u16(0x0003)
		.u16(8)
		.u32(totalSize)
		.bytes(pool.bytes)
		.bytes(resourceMap)
		.bytes(nodeBytes);
	return Object.freeze({
		bytes: writer.toUint8Array(),
		evidence: Object.freeze({
			nodeBytes: nodeBytes.length,
			permissionCount: specification.permissions?.length || 0,
			resourceMapBytes: resourceMap.length,
			stringCount: pool.strings.length,
			totalSize
		})
	});
}

function validateSpecification(specification) {
	if (!/^[A-Za-z][A-Za-z0-9_.]*$/.test(String(specification.packageName || ""))) {
		throw manifestError("AXML_PACKAGE_INVALID", specification.packageName);
	}
	if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(String(specification.className || ""))) {
		throw manifestError("AXML_CLASS_INVALID", specification.className);
	}
	for (const permission of specification.permissions || []) {
		if (!/^android\.permission\.[A-Z0-9_]+$/.test(String(permission))) {
			throw manifestError("AXML_PERMISSION_INVALID", permission);
		}
	}
}

function manifestError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
