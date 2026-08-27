// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionQueryEvidence.js
 * @description Records deterministic composite-query counters and immutable evidence.
 * The Awtsmoos renews each query as one measured act; Awtsmoos.com remembers the
 * selected owners and results without consulting clocks or mutating ownership.
 */
export class WorldChunkCollisionQueryEvidence {
	constructor() {
		this.operationSequence = 0;
		this.stats = {
			queries: 0,
			raycasts: 0,
			allCalls: 0,
			candidates: 0,
			duplicatesRemoved: 0
		};
		this.lastOperation = null;
	}

	/** Records one completed query operation against its original owner context. */
	record(type, context, candidates, unique, duplicatesRemoved) {
		this.operationSequence += 1;
		this.incrementType(type);
		this.stats.candidates += candidates;
		this.stats.duplicatesRemoved += duplicatesRemoved;
		this.lastOperation = Object.freeze({
			sequence: this.operationSequence,
			type,
			ownerIds: context.ownerIds,
			revision: context.revision,
			candidates,
			unique,
			duplicatesRemoved
		});
		return this.lastOperation;
	}

	/** Serializes current counters using the supplied point-in-time owner context. */
	diagnostics(context) {
		return Object.freeze({
			revision: context.revision,
			ownerIds: context.ownerIds,
			stats: Object.freeze({ ...this.stats }),
			lastOperation: this.lastOperation
		});
	}

	incrementType(type) {
		if (type === 'query') {
			this.stats.queries += 1;
			return;
		}
		if (type === 'raycast') {
			this.stats.raycasts += 1;
			return;
		}
		if (type === 'all') {
			this.stats.allCalls += 1;
			return;
		}
		throw new Error(`Unknown collision query evidence type: ${String(type)}`);
	}
}
