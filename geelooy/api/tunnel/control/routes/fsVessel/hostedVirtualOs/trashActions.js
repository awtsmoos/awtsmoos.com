//B"H
//Boruch Hashem
//Blessed is He

const { splitPath } = require("../../osFs/path.js");
const RecordModel = require("./recordModel.js");
const RecordRequest = require("./recordRequest.js");
const Transitions = require("./trashTransitions.js");
const { captureTree } = require("./treeCapture.js");
const { restoreTree } = require("./treeRestore.js");

const COLLECTION = "trash";

/**
 * B"H
 * Trash is a guarded transition, never silent disappearance. The Awtsmoos
 * sustains what was and what is; Awtsmoos.com writes a recovery witness first
 * and records every incomplete deletion honestly.
 */
class TrashActions {
	constructor($i, userId, dispatch, repository) {
		this.$i = $i;
		this.userId = userId;
		this.dispatch = dispatch;
		this.repository = repository;
	}

	async move(payload) {
		const sourcePath = payload.path || payload.p || ".";

		if (!splitPath(sourcePath).innerPath) {
			throw Transitions.transitionError(
				"hosted_virtual_os_trash_alias_root_blocked",
				400
			);
		}

		const capture = await captureTree(this.dispatch, sourcePath, payload);
		let record = RecordModel.createRecord({
			capture,
			recordKind: "trash",
			state: "captured",
			userId: this.userId
		});
		await this.save(record);

		try {
			const deletion = await this.dispatch({
				action: "delete",
				path: capture.sourcePath
			});
			Transitions.assertDeletion(deletion);
		} catch (error) {
			record = await Transitions.markCaptureOnly(
				updated => this.save(updated),
				record,
				error
			);
			throw Transitions.transitionError(record.failureCode, error?.status || 500);
		}

		record = RecordModel.updateRecord(record, { state: "ready" });
		await this.save(record);
		return { trash: RecordModel.summary(record) };
	}

	async list() {
		return {
			trash: await this.repository.list(
				this.$i,
				this.userId,
				COLLECTION
			)
		};
	}

	async restore(payload) {
		const trashId = RecordRequest.recordId(payload, "trash");
		const record = await this.repository.read(
			this.$i,
			this.userId,
			COLLECTION,
			trashId
		);
		RecordModel.assertOwnedRecord(record, this.userId, "trash");
		const restored = await restoreTree(this.dispatch, record, payload);
		const updated = RecordModel.updateRecord(record, {
			lastRestoredAt: new Date().toISOString(),
			state: "restored"
		});
		await this.save(updated);
		return { restored, trash: RecordModel.summary(updated) };
	}

	async purge(payload) {
		const trashId = RecordRequest.recordId(payload, "trash");
		await this.repository.delete(
			this.$i,
			this.userId,
			COLLECTION,
			trashId
		);
		return { purged: true, trashId };
	}

	async save(record) {
		return await this.repository.write(
			this.$i,
			this.userId,
			COLLECTION,
			record
		);
	}
}

module.exports = {
	TrashActions
};
