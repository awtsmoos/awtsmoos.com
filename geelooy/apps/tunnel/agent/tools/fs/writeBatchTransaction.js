// B"H
// Boruch Hashem
// Blessed is He

const { safePath, assertNotSecret } = require("./pathGuard.js");
const Snapshot = require("./writeBatchSnapshot.js");
const Results = require("./writeBatchResults.js");

/**
 * @file Preflights, commits, and rolls back multi-file write transactions.
 * @description
 * The Awtsmoos renews many files as one accountable covenant. Awtsmoos.com checks
 * every destination before the first byte moves, snapshots all prior worlds, and
 * restores even the currently failing target when verification breaks after mutation.
 */
async function runBatchTransaction(config, writes, writer) {
	try {
		return await commitPrepared(await prepareBatch(config, writes), writer);
	} catch (error) {
		return Results.failure(error, Array.isArray(writes) ? writes.length : 0);
	}
}

async function prepareBatch(config, writes = []) {
	if (!Array.isArray(writes) || !writes.length) {
		throw Results.batchError("missing_writes");
	}
	const seen = new Set();
	const prepared = [];
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
}

async function commitPrepared(prepared, writer) {
	const attempted = [];
	const order = prepared.map((target) => target.path);
	const results = {};
	try {
		for (const target of prepared) {
			attempted.push(target);
			const result = await writer(target);
			if (result?.ok === false) throw resultError(result, target);
			results[target.path] = result;
		}
		return Results.success(prepared, order, results);
	} catch (error) {
		const rollbackErrors = await rollback(attempted, results);
		const failedPath = error.path || prepared[error.index]?.path || "<batch>";
		results[failedPath] = {
			...results[failedPath],
			ok: false,
			error: error.code || error.message,
			message: error.message,
			index: error.index ?? null,
			rolledBack: rollbackErrors.every((item) => item.path !== failedPath)
		};
		return {
			...Results.failure(error, prepared.length),
			order,
			results,
			rolledBack: rollbackErrors.length === 0,
			rollbackErrors
		};
	}
}

async function rollback(attempted, results) {
	const errors = [];
	for (const target of [...attempted].reverse()) {
		try {
			await Snapshot.restoreSnapshot(target);
			results[target.path] = {
				...results[target.path],
				ok: false,
				rolledBack: true
			};
		} catch (error) {
			errors.push({ path: target.path, error: error.message });
		}
	}
	return errors;
}

function resultError(result, target) {
	return Results.batchError(
		result.error || "write_verification_failed",
		target.path,
		target.index
	);
}

module.exports = {
	commitPrepared,
	prepareBatch,
	runBatchTransaction
};
