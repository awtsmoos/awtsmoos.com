// B"H
// Boruch Hashem
// Blessed is He

const { safePath, assertNotSecret } = require("./pathGuard.js");
const Snapshot = require("./writeBatchSnapshot.js");
const Results = require("./writeBatchResults.js");
const Failure = require("./writeBatchFailure.js");

/**
 * @file Preflights, commits, and rolls back multi-file write transactions.
 * @description
 * The Awtsmoos renews many files as one accountable covenant. Awtsmoos.com keeps
 * rollback witnesses on disk, cleans every temporary vessel, and never hides a partial world.
 */
async function runBatchTransaction(config, writes, writer) {
	try {
		return await commitPrepared(await prepareBatch(config, writes), writer);
	} catch (error) {
		return Results.failure(error, Array.isArray(writes) ? writes.length : 0);
	}
}

async function prepareBatch(config, writes = []) {
	if (!Array.isArray(writes) || !writes.length) throw Results.batchError("missing_writes");
	const seen = new Set();
	const prepared = [];
	try {
		for (let index = 0; index < writes.length; index += 1) {
			const write = writes[index];
			const absolutePath = safePath(config, write.path);
			assertNotSecret(config, absolutePath);
			const key = Results.comparisonKey(absolutePath);
			if (seen.has(key)) {
				throw Results.batchError("duplicate_write_target", write.path, index);
			}
			seen.add(key);
			prepared.push(await Snapshot.captureSnapshot({
				...write,
				index,
				absolutePath
			}));
		}
		return prepared;
	} catch (error) {
		await cleanupSnapshots(prepared);
		throw error;
	}
}

async function commitPrepared(prepared, writer) {
	const attempted = [];
	const order = prepared.map(target => target.path);
	const results = {};
	try {
		for (const target of prepared) {
			attempted.push(target);
			let result;
			try {
				result = await writer(target);
			} catch (error) {
				throw Failure.rememberThrownWrite(error, target, results);
			}
			if (result?.ok === false) throw Failure.resultError(result, target);
			results[target.path] = result;
		}
		await cleanupSnapshots(prepared);
		return Results.success(prepared, order, results);
	} catch (error) {
		const rollbackErrors = await rollback(attempted, results);
		await cleanupSnapshots(prepared);
		return Failure.failedTransaction(error, prepared, order, results, rollbackErrors);
	}
}

async function rollback(attempted, results) {
	const errors = [];
	for (const target of [...attempted].reverse()) {
		try {
			await Snapshot.restoreSnapshot(target, Failure.afterHash(target, results[target.path]));
			results[target.path] = { ...results[target.path], ok: false, rolledBack: true };
		} catch (error) {
			const code = error.code || error.message;
			errors.push({ path: target.path, error: code });
			results[target.path] = { ...results[target.path], ok: false, error: code, rolledBack: false };
		}
	}
	return errors;
}

async function cleanupSnapshots(prepared = []) {
	await Promise.all(prepared.map(target => Snapshot.cleanupSnapshot(target)));
}

module.exports = {
	commitPrepared,
	prepareBatch,
	runBatchTransaction
};
