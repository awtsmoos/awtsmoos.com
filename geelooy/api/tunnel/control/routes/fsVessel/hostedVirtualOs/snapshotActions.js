//B"H
//Boruch Hashem
//Blessed is He

const RecordModel = require("./recordModel.js");
const RecordRequest = require("./recordRequest.js");
const { captureTree } = require("./treeCapture.js");
const { restoreTree } = require("./treeRestore.js");

const COLLECTION = "snapshots";

/**
 * B"H
 * Snapshots let a user remember without disturbing the present filesystem. The
 * Awtsmoos recreates every moment from nothing; Awtsmoos.com preserves a bounded
 * prior arrangement so deliberate restoration remains possible and accountable.
 */
class SnapshotActions {
	constructor($i, userId, dispatch, repository) {
		this.$i = $i;
		this.userId = userId;
		this.dispatch = dispatch;
		this.repository = repository;
	}

	async create(payload) {
		const capture = await captureTree(
			this.dispatch,
			payload.path || payload.p || ".",
			payload
		);
		const record = RecordModel.createRecord({
			capture,
			recordKind: "snapshot",
			state: "ready",
			userId: this.userId
		});

		await this.repository.write(
			this.$i,
			this.userId,
			COLLECTION,
			record
		);

		return { snapshot: RecordModel.summary(record) };
	}

	async list() {
		const snapshots = await this.repository.list(
			this.$i,
			this.userId,
			COLLECTION
		);

		return { snapshots };
	}

	async restore(payload) {
		const snapshotId = RecordRequest.recordId(payload, "snapshot");
		const record = await this.repository.read(
			this.$i,
			this.userId,
			COLLECTION,
			snapshotId
		);
		RecordModel.assertOwnedRecord(record, this.userId, "snapshot");
		const restored = await restoreTree(this.dispatch, record, payload);
		const updated = RecordModel.updateRecord(record, {
			lastRestoredAt: new Date().toISOString(),
			state: "ready"
		});

		await this.repository.write(
			this.$i,
			this.userId,
			COLLECTION,
			updated
		);

		return { restored, snapshot: RecordModel.summary(updated) };
	}

	async delete(payload) {
		const snapshotId = RecordRequest.recordId(payload, "snapshot");
		await this.repository.delete(
			this.$i,
			this.userId,
			COLLECTION,
			snapshotId
		);

		return { deleted: true, snapshotId };
	}
}

module.exports = {
	SnapshotActions
};
