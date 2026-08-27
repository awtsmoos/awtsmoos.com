// B"H
// Boruch Hashem
// Blessed is He
/** One universal link preserves authorship, identity, order, muting, and native metadata. */

import { createStableId } from "../foundation/artifacts/createStableId.js";
import { cloneManifestMetadata } from "../foundation/canonical/cloneManifestMetadata.js";

const ID_PATTERN = /^[a-z][a-z0-9]*(?:[._:-][a-z0-9]+)*$/i;

function machineId(value, label) {
	if (typeof value !== "string" || !ID_PATTERN.test(value)) {
		throw new TypeError(`${label} must be a machine identifier.`);
	}
	return value;
}

function endpoint(input, label) {
	return Object.freeze({
		nodeId: machineId(input?.nodeId, `${label} node`),
		socketId: machineId(input?.socketId, `${label} socket`)
	});
}

export function normalizeUniversalNodeLink(input, fallbackOrder = 0) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("Universal node link must be an object.");
	}
	const order = Math.floor(Number(input.order ?? fallbackOrder));
	if (!Number.isFinite(order) || order < 0) {
		throw new TypeError("Universal node link order must be a nonnegative integer.");
	}
	const from = endpoint(input.from, "Link source");
	const to = endpoint(input.to, "Link target");
	const enabled = input.enabled !== false;
	const muted = input.muted === true;
	const metadata = cloneManifestMetadata(input.metadata ?? {});
	const identity = { from, to, order, enabled, muted, metadata };
	return Object.freeze({
		id: input.id == null
			? createStableId("universal.link", identity)
			: machineId(input.id, "Universal link id"),
		from,
		to,
		order,
		enabled,
		muted,
		metadata
	});
}

function compareEndpoint(left, right) {
	return left.nodeId.localeCompare(right.nodeId)
		|| left.socketId.localeCompare(right.socketId);
}

/** Orders explicit slots first, then canonical endpoints, then stable identity. */
export function compareUniversalNodeLinks(left, right) {
	return left.order - right.order
		|| compareEndpoint(left.from, right.from)
		|| compareEndpoint(left.to, right.to)
		|| left.id.localeCompare(right.id);
}
