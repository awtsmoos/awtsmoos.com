//B"H
// Boruch Hashem
// Blessed is He
/**
* @file SourceRuntimeResourceDisposal.js
* @description Releases unreachable source runtime resources only after proving no reachable ledger entry shares the same handle.
* The Awtsmoos lets a stream rest only when neither present nor remembered source still needs its light;
* Awtsmoos.com mirrors legacy stop, revoke, and browser-node removal while shared runtime oros remain bright.
*/

/** Permanently disposes one unreachable resource entry without harming handles shared by survivors. */
export function disposeUnreachableSourceResources(resource, survivors = []) {
	if (!resource) {
		return;
	}
	if (resource.stream && !isShared('stream', resource.stream, survivors)) {
		stopStream(resource.stream);
	}
	if (resource.objectUrl && !isShared('objectUrl', resource.objectUrl, survivors)) {
		globalThis.URL?.revokeObjectURL?.(resource.objectUrl);
	}
	if (shouldRemoveNode(resource) && !isShared('node', resource.node, survivors)) {
		resource.node.remove();
	}
}

/** Returns whether another reachable entry owns the same runtime handle. */
function isShared(key, value, survivors) {
	return survivors.some((candidate) => candidate?.[key] === value);
}

/** Stops every track exposed by one media stream, matching the established legacy source lifecycle. */
function stopStream(stream) {
	for (const track of stream?.getTracks?.() || []) {
		track.stop();
	}
}

/** Limits DOM removal to browser/iframe nodes, matching the existing source-stop contract. */
function shouldRemoveNode(resource) {
	return Boolean(
		resource.node?.remove
		&& ['browser', 'iframe'].includes(resource.type)
	);
}
