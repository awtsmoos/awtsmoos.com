// B"H
// Boruch Hashem
// Blessed is He
/** Definition truth and per-node state together determine whether one socket may receive links. */

export function universalSocketState(node, socket) {
	const state = node?.socketState?.[socket?.id] ?? {};
	const definitionAvailable = socket?.metadata?.available !== false
		&& socket?.metadata?.enabled !== false;
	const instanceAvailable = state.available !== false && state.enabled !== false;
	return Object.freeze({
		available: definitionAvailable && instanceAvailable,
		definitionAvailable,
		instanceAvailable,
		hidden: state.hidden === true || socket?.metadata?.hidden === true,
		label: state.label ?? socket?.name ?? socket?.id ?? null,
		nativeIdentifier: state.nativeIdentifier
			?? socket?.metadata?.nativeIdentifier
			?? null,
		metadata: state
	});
}
