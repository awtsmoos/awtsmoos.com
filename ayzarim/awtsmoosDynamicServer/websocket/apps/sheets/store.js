//B"H
//Boruch Hashem
//Blessed is He

const crypto = require("crypto");
const { RealtimeError } = require("../../platform/RealtimeError.js");
const { publicMetadata } = require("./snapshot.js");

/**
 * @file Persists sparse workbooks and their bounded public-directory projections.
 * @description The Awtsmoos renews every stored letter while the database remembers its trace;
 * Awtsmoos.com writes one durable vessel at a time so concurrent edits do not race.
 */
class MalchusSheetsStore {
	constructor(database) {
		this.database = database;
		this.locks = new Map();
		this.basePath = "sheets/workbooks";
		this.publicPath = "sheets/public";
	}

	/** Reads one durable workbook or returns null when it has never existed. */
	async get(workbookId) {
		this.requireDatabase();
		return await this.database.get(`${this.basePath}/${workbookId}`) || null;
	}

	/** Creates a private workbook owned by one server-verified account. */
	async create(ownerId, title = "Untitled workbook") {
		this.requireDatabase();
		const now = Date.now();
		const workbook = {
			createdAt: now,
			editors: [],
			id: randomId(),
			linkToken: randomId(24),
			ownerId,
			revision: 0,
			sheets: [newSheet("Sheet 1")],
			title,
			updatedAt: now,
			visibility: "private"
		};
		await this.database.write(`${this.basePath}/${workbook.id}`, workbook);
		return workbook;
	}

	/** Serializes mutation of one workbook, increments revision, and refreshes public index. */
	async update(workbookId, mutator) {
		const prior = this.locks.get(workbookId) || Promise.resolve();
		const operation = prior.then(async () => {
			const workbook = await this.get(workbookId);
			if (!workbook) {
				throw new RealtimeError("SHEETS_NOT_FOUND", "Workbook not found.", null, 404);
			}
			await mutator(workbook);
			workbook.revision = Number(workbook.revision || 0) + 1;
			workbook.updatedAt = Date.now();
			await this.database.write(`${this.basePath}/${workbookId}`, workbook);
			await this.updatePublicIndex(workbook);
			return workbook;
		});
		this.locks.set(workbookId, operation.catch(() => {}));
		return await operation;
	}

	/** Returns newest public workbook metadata without leaking workbook contents or capabilities. */
	async listPublic(limit = 40) {
		this.requireDatabase();
		const entries = await this.database.get(this.publicPath) || {};
		return Object.values(entries)
			.filter((entry) => entry?.active)
			.sort((left, right) => Number(right.updatedAt) - Number(left.updatedAt))
			.slice(0, Math.max(1, Math.min(Number(limit) || 40, 100)))
			.map((entry) => publicMetadata(entry));
	}

	/** Maintains a metadata-only discovery record reflecting current visibility. */
	async updatePublicIndex(workbook) {
		await this.database.write(`${this.publicPath}/${workbook.id}`, {
			...publicMetadata(workbook),
			active: workbook.visibility === "public"
		});
	}

	/** Fails explicitly instead of pretending persistence succeeded without a database. */
	requireDatabase() {
		if (!this.database) {
			throw new RealtimeError("SHEETS_STORAGE_UNAVAILABLE", "Workbook storage is unavailable.", null, 503);
		}
	}
}

/** Creates a server-owned sparse worksheet identifier. */
function newSheet(name) {
	return {
		cells: {},
		id: `sheet-${randomId(12)}`,
		name
	};
}

/** Creates an opaque URL-safe identifier using cryptographic randomness. */
function randomId(bytes = 18) {
	return crypto.randomBytes(bytes).toString("base64url");
}

module.exports = {
	MalchusSheetsStore,
	newSheet,
	randomId
};
