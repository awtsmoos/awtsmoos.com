// B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");
const Store = require("./fileTransferStore.js");

const SAVE_ATTEMPTS = 3;

/**
 * @file Finalizes staged-transfer metadata only after destination transaction success.
 * @description
 * The Awtsmoos lets Awtsmoos.com confess committed truth durably before payload vessels vanish;
 * transient metadata weather retries, and uncertain cleanup never falsely calls written files failed.
 */
async function finalize(staged) {
	const warnings = [];
	for (const item of staged) {
		const manifest = committedManifest(item);
		const error = await saveWithRetry(item.transfer, manifest);
		if (error) warnings.push({ transferId: manifest.transferId, error: error.message });
		else item.manifest = manifest;
	}
	if (warnings.length) {
		return {
			complete: false,
			warnings,
			payloadsPreserved: true
		};
	}
	await Promise.all(staged.map(item =>
		fsp.rm(item.transfer.payload, { force: true }).catch(error => warnings.push({
			transferId: item.manifest.transferId,
			error: `payload_cleanup_failed:${error.message}`
		}))
	));
	return {
		complete: true,
		warnings,
		payloadsPreserved: warnings.length > 0
	};
}

function committedManifest(item) {
	return {
		...item.manifest,
		state: "committed",
		committedAt: new Date().toISOString(),
		committedSha256: item.proof.sha256,
		batchCommitted: true
	};
}

async function saveWithRetry(transfer, manifest) {
	let lastError = null;
	for (let attempt = 1; attempt <= SAVE_ATTEMPTS; attempt += 1) {
		try {
			await Store.save(transfer, manifest);
			return null;
		} catch (error) {
			lastError = error;
		}
	}
	return lastError;
}

module.exports = {
	finalize,
	saveWithRetry
};
