// B"H
// Boruch Hashem
// Blessed is He
/** Every link reports compatibility, conversion, loss, and socket limits. */

import { planSocketConnection } from "../../nodes/planSocketConnection.js";
import { resolveOpenNodeSocket } from "./resolveOpenNodeSocket.js";

function normalizeConversion(source, target, compatibility) {
	if (!compatibility.compatible) {
		return compatibility.conversion;
	}
	if (source.socket.type === target.socket.type) {
		return "identity";
	}
	return compatibility.conversion;
}

/**
 * Plans one geometry or material node connection without mutating a tree.
 * @param {Object} surface - Open merged node API surface.
 * @param {Object} input - Source and target node/socket references.
 * @returns {Object} Exact compatibility and conversion evidence.
 * @deterministic Always for equal schema packs and socket references.
 * @sideEffects None.
 */
export function planOpenNodeConnection(surface, input) {
	const source = resolveOpenNodeSocket(surface.registry, {
		...input.from,
		direction: "output"
	});
	const target = resolveOpenNodeSocket(surface.registry, {
		...input.to,
		direction: "input"
	});
	const compatibility = planSocketConnection(source.socket, target.socket);
	const multiInput = target.socket.multiInput === true;
	return Object.freeze({
		compatible: compatibility.compatible,
		conversion: normalizeConversion(source, target, compatibility),
		lossiness: compatibility.lossiness,
		reason: compatibility.reason,
		from: Object.freeze({
			nodeType: source.definition.type,
			socketId: source.socket.id,
			socketType: source.socket.type
		}),
		to: Object.freeze({
			nodeType: target.definition.type,
			socketId: target.socket.id,
			socketType: target.socket.type,
			multiInput,
			linkLimit: target.socket.metadata?.linkLimit ?? null
		}),
		connectionPolicy: multiInput
			? "append-in-stable-link-order"
			: "replace-existing-single-input-link"
	});
}
