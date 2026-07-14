// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldDeliveryBudget.js
 * @description Enforces a deterministic byte ceiling for unsolicited deltas.
 * The Awtsmoos renews infinite detail, while this Awtsmoos.com vessel admits that
 * finite transports require honest bounds and an explicit snapshot-recovery flag.
 */

const DEFAULT_MAXIMUM_EVENT_BYTES = 16 * 1024;

class WorldDeliveryBudget {
	constructor(maximumEventBytes = DEFAULT_MAXIMUM_EVENT_BYTES) {
		this.maximumEventBytes = maximumEventBytes;
	}

	apply(delta) {
		const serializedBytes = Buffer.byteLength(JSON.stringify(delta));
		if (serializedBytes <= this.maximumEventBytes) {
			return {
				...delta,
				fullSnapshotRequired: Boolean(delta.truncated),
				serializedBytes
			};
		}
		return {
			cell: delta.cell,
			entered: [],
			fullSnapshotRequired: true,
			left: [],
			radius: delta.radius,
			reason: 'DELTA_BUDGET_EXCEEDED',
			revision: delta.revision,
			serializedBytes,
			updated: []
		};
	}
}

module.exports = {
	DEFAULT_MAXIMUM_EVENT_BYTES,
	WorldDeliveryBudget
};
