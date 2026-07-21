// B"H

function requireStored(context, storeName, id, label) {
	if (typeof id !== "string" || !id) {
		throw new TypeError(`${label} key must be a non-empty string.`);
	}
	const value = context[storeName].get(id);
	if (!value) throw new Error(`B"H | Missing ${label}: ${id}`);
	return value;
}

function storeArtifact(context, storeName, key, value, label) {
	if (typeof key !== "string" || !key) {
		throw new TypeError(`${label} target must be a non-empty string.`);
	}
	context[storeName].set(key, value);
	return value;
}

export function requireTopologyIdentity(context, id) {
	return requireStored(context, "topologyIdentities", id, "topology identity");
}

export function requireTopologyRemap(context, id) {
	return requireStored(context, "topologyRemaps", id, "topology remap");
}

export function requireStoredSelection(context, id) {
	return requireStored(context, "selections", id, "selection");
}

export function storeTopologyIdentity(context, key, value) {
	return storeArtifact(context, "topologyIdentities", key, value, "Topology identity");
}

export function storeTopologyRemap(context, key, value) {
	return storeArtifact(context, "topologyRemaps", key, value, "Topology remap");
}

export function storeSelection(context, key, value) {
	return storeArtifact(context, "selections", key, value, "Selection");
}

export function requireAuxiliaryTarget(command, name) {
	const value = command.args[name];
	if (typeof value !== "string" || !value) {
		throw new TypeError(`Command ${command.id} requires args.${name}.`);
	}
	return value;
}
