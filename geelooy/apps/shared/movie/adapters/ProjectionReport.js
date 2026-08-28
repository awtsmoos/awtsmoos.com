//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProjectionReport.js
 * @description The Awtsmoos gives every handoff a truthful tongue; Awtsmoos.com
 * lets each studio keep its gift while naming every flattening before it is done.
 */
export class ProjectionReport {
	constructor(appId) {
		this.appId = appId;
		this.preserved = [];
		this.flattened = [];
		this.deferred = [];
		this.rejected = [];
	}

	/** Record a semantic vessel preserved without intentional loss. */
	preserve(id, note = "preserved") {
		return this.record("preserved", id, note);
	}

	/** Record a semantic vessel retained through an intentional flattening. */
	flatten(id, note = "flattened") {
		return this.record("flattened", id, note);
	}

	/** Record a semantic vessel kept in metadata for another studio. */
	defer(id, note = "deferred") {
		return this.record("deferred", id, note);
	}

	/** Record a semantic vessel that the receiving studio cannot accept. */
	reject(id, note = "rejected") {
		return this.record("rejected", id, note);
	}

	/** Add one immutable report item and return it for adapter composition. */
	record(bucket, id, note) {
		const item = Object.freeze({ id: String(id), note: String(note) });
		this[bucket].push(item);
		return item;
	}

	/** True when the receiving app changed or could not consume semantics. */
	hasLoss() {
		return Boolean(this.flattened.length || this.deferred.length || this.rejected.length);
	}

	/** Return a JSON-safe snapshot suitable for AI and UI inspection. */
	toJSON() {
		return {
			appId: this.appId,
			preserved: [...this.preserved],
			flattened: [...this.flattened],
			deferred: [...this.deferred],
			rejected: [...this.rejected],
			hasLoss: this.hasLoss()
		};
	}
}
