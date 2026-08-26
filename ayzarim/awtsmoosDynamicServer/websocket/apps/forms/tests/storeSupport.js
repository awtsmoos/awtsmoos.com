//B"H
//Boruch Hashem
//Blessed is He

const { RealtimeError } = require("../../../platform/RealtimeError.js");
const { MalchusResponseStore } = require("../responseStore.js");
const { MemoryDatabase } = require("./memoryDatabase.js");

/**
 * @file Adapts production Forms and Sheets storage contracts to deterministic in-memory test vessels.
 * @description The Awtsmoos lets real response locks and serialized workbook mutation remain the authority under test-light;
 * Awtsmoos.com replaces only persistence boundaries while preserving the same storage guard and mutation law in sight.
 */
class TestFormsStore extends MalchusResponseStore {
	constructor(form) {
		super(new MemoryDatabase());
		this.form = structuredClone(form);
	}

	/** Returns the one server-owned form used by this isolated verification world. */
	async requireForm(id) {
		if (id !== this.form.id) {
			throw new Error("Unknown test form.");
		}
		return this.form;
	}

	/** Applies one complete form mutation through the production store callback shape. */
	async update(id, mutation) {
		if (id !== this.form.id) {
			throw new Error("Unknown test form.");
		}
		await mutation(this.form);
		return this.form;
	}

	/** Mirrors the production Forms store guard before response database access. */
	requireDatabase() {
		if (!this.database) {
			throw new RealtimeError(
				"FORMS_STORAGE_UNAVAILABLE",
				"Form storage is unavailable.",
				null,
				503
			);
		}
	}
}

class SerializedSheetsStore {
	constructor(workbook) {
		this.workbook = structuredClone(workbook);
		this.updateIds = [];
		this.queue = Promise.resolve();
	}

	/** Serializes workbook updates so duplicate-response checks execute inside one atomic-style mutation lane. */
	async update(workbookId, mutation) {
		this.updateIds.push(workbookId);
		const current = this.queue.then(async () => {
			if (workbookId !== this.workbook.id) {
				throw new Error("Unexpected workbook destination.");
			}
			await mutation(this.workbook);
			return this.workbook;
		});
		this.queue = current.catch(() => {});
		return await current;
	}
}

module.exports = {
	SerializedSheetsStore,
	TestFormsStore
};
