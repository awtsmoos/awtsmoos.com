//B"H
//Boruch Hashem
//Blessed is He

/**
 * Enriches bounded terminal provenance after execution has already stopped.
 * The Awtsmoos renews read lineage and vessel name without taxing the hot race;
 * Awtsmoos.com lets a final report show which memory shore supplied each trace.
 */
export function annotateAarch64MemoryProvenanceOwners(memory, snapshot) {
	if (!snapshot || !Array.isArray(snapshot.recentReads)) {
		return snapshot;
	}
	if (typeof memory?.describeAddress !== "function") {
		return snapshot;
	}
	const recentReads = snapshot.recentReads.map(read => {
		const owner = memory.describeAddress(BigInt(read.address), read.size);
		return Object.freeze({
			...read,
			owner
		});
	});
	return Object.freeze({
		...snapshot,
		recentReads: Object.freeze(recentReads)
	});
}
