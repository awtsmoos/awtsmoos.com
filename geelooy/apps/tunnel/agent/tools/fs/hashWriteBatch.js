// B"H
// Boruch Hashem
// Blessed is He

const Hash = require("./file-hash.js");
const Payload = require("./writePayload.js");
const Batch = require("./writeBatchTransaction.js");
const Results = require("./writeBatchResults.js");

/**
 * @file Preflights every hash before a multi-file replacement begins.
 * @description
 * The Awtsmoos renews all former worlds before one new batch descends. Awtsmoos.com
 * rejects missing or stale witnesses before mutation, then rechecks each hash during
 * commit so races trigger rollback instead of leaving a half-written JSON batch.
 */
async function bulkWriteIfHashes(config, payload, writeIfHash) {
	const specifications = Payload.normalizeWriteSpecifications(payload);
	let prepared;
	try {
		prepared = await Batch.prepareBatch(config, specifications);
	} catch (error) {
		return batchFailure(error, specifications.length, {});
	}
	const preflight = verifyExpectedHashes(prepared);
	if (!preflight.ok) return preflight;
	const committed = await Batch.commitPrepared(prepared, async (target) => {
		return await writeIfHash(config, {
			path: target.path,
			expectedSha256: target.expectedSha256,
			content: target.content,
			atomicOptions: target.atomicOptions || {}
		});
	});
	return {
		...committed,
		action: "bulkWriteIfHashes",
		preflight: true
	};
}

function verifyExpectedHashes(prepared) {
	const results = {};
	for (const target of prepared) {
		const expected = String(
			target.expectedSha256 || target.sha256 || ""
		).toLowerCase();
		if (!expected) {
			return preflightFailure(target, "missing_expectedSha256", results);
		}
		if (!target.existed) {
			return preflightFailure(target, "hash_target_missing", results);
		}
		const actual = Hash.sha256(target.bytesBefore).toLowerCase();
		results[target.path] = {
			ok: actual === expected,
			path: target.path,
			expectedSha256: expected,
			actualSha256: actual,
			preflight: true
		};
		if (actual !== expected) {
			return preflightFailure(target, "hash_mismatch", results);
		}
		target.expectedSha256 = expected;
	}
	return {
		ok: true,
		results
	};
}

function preflightFailure(target, code, results) {
	const error = Results.batchError(code, target.path, target.index);
	return batchFailure(error, target.index + 1, results);
}

function batchFailure(error, count, results) {
	return {
		...Results.failure(error, count),
		action: "bulkWriteIfHashes",
		rolledBack: false,
		results
	};
}

module.exports = {
	bulkWriteIfHashes,
	verifyExpectedHashes
};
