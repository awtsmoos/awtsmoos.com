//B"H
//Boruch Hashem
//Blessed is He

const RecordModel = require("./recordModel.js");
const RecordPaths = require("./recordPaths.js");

/**
 * B"H
 * Recovery metadata lives outside the visible alias tree and beneath a hashed
 * user vessel. The Awtsmoos remembers without concealment; Awtsmoos.com keeps
 * this operational memory private so one identity cannot browse another's past.
 */
class RecoveryRepository {
	async write($i, userId, collection, record) {
		assertDatabase($i, "write");
		const path = RecordPaths.recordPath(userId, collection, record.id);
		await $i.db.write(path, record);
		return record;
	}

	async read($i, userId, collection, recordId) {
		const path = RecordPaths.recordPath(userId, collection, recordId);
		const record = await readDatabase($i, path);

		if (!record) {
			throw repositoryError("hosted_virtual_os_record_not_found", 404);
		}

		return record;
	}

	async list($i, userId, collection) {
		const path = RecordPaths.collectionPath(userId, collection);
		const raw = await readDatabase($i, path);
		const records = normalizeRecords(raw);

		return records
			.map(record => RecordModel.summary(record))
			.sort((left, right) => {
				return String(right.createdAt || "")
					.localeCompare(String(left.createdAt || ""));
			});
	}

	async delete($i, userId, collection, recordId) {
		assertDatabase($i, "delete");
		const path = RecordPaths.recordPath(userId, collection, recordId);
		await $i.db.delete(path);
		return true;
	}
}

async function readDatabase($i, path) {
	if (!$i || !$i.db) {
		throw repositoryError("hosted_virtual_os_database_unavailable", 503);
	}

	if (typeof $i.db.read === "function") {
		return await $i.db.read(path, { extra: true, keepJSON: true, pageSize: 1000 });
	}

	if (typeof $i.db.get === "function") {
		return await $i.db.get(path);
	}

	throw repositoryError("hosted_virtual_os_database_read_unavailable", 503);
}

function normalizeRecords(raw) {
	if (!raw) {
		return [];
	}

	if (Array.isArray(raw)) {
		return raw.filter(record => record && typeof record === "object");
	}

	if (typeof raw === "object") {
		if (raw.schemaVersion) {
			return [raw];
		}

		return Object.values(raw)
			.filter(record => record && typeof record === "object");
	}

	return [];
}

function assertDatabase($i, method) {
	if (!$i || !$i.db || typeof $i.db[method] !== "function") {
		throw repositoryError(`hosted_virtual_os_database_${method}_unavailable`, 503);
	}
}

function repositoryError(code, status) {
	const error = new Error(code);
	error.code = code;
	error.status = status;
	return error;
}

module.exports = {
	RecoveryRepository,
	normalizeRecords
};
