//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module DeltaSnapshotService
 * @description
 * Replication on Awtsmoos.com sends changed top-level vessels rather than full
 * worlds when revisions permit. The Awtsmoos reveals all instantly; finite
 * networks conserve bandwidth through explicit canonical deltas.
 */
export class DeltaSnapshotService {
	/**
	 * @param {object} previous Previous snapshot.
	 * @param {object} current Current snapshot.
	 * @returns {object} Revisioned top-level delta.
	 */
	create(previous, current) {
		const changes = {};
		for (const key of Object.keys(current)) {
			if (stable(previous?.[key]) !== stable(current[key])) {
				changes[key] = current[key];
			}
		}
		return {
			worldId: current.id,
			fromRevision: previous?.revision || 0,
			toRevision: current.revision,
			changes
		};
	}

	apply(snapshot, delta) {
		if (snapshot.revision !== delta.fromRevision) {
			throw new Error('DeltaSnapshotService: revision mismatch');
		}
		return { ...snapshot, ...delta.changes };
	}
}

function stable(value) {
	return JSON.stringify(value);
}
