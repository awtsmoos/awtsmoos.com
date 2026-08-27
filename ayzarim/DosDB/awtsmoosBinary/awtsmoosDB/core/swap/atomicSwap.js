// B"H

/**
 * @file core/swap/atomicSwap.js
 * @chapter One Vessel Moves, And Every Broken Step Restores The Former Name
 * @description
 * Performs a manifest-gated one-file rename exchange. Any failure after the live
 * file is archived—including a failure after candidate installation—moves the
 * candidate back to its original path and restores the archived original.
 */

const fs = require('fs');
const { validateApproval } = require('./manifestGate.js');
const inspectSwapFiles = require('./fileGuards.js');
const { fsyncPaths } = require('./durability.js');

function atomicSwap(approval, options = {}) {
	validateApproval(approval);
	const files = inspectSwapFiles(approval);
	let archived = false;
	let installed = false;

	try {
		fsyncPaths([files.livePath, files.candidatePath]);
		fs.renameSync(files.livePath, files.rollbackPath);
		archived = true;
		fsyncPaths([files.rollbackPath]);
		inject(options, 'after-archive');

		fs.renameSync(files.candidatePath, files.livePath);
		installed = true;
		inject(options, 'after-install');
		fsyncPaths([files.livePath, files.rollbackPath]);
		return {
			ok: true,
			livePath: files.livePath,
			rollbackPath: files.rollbackPath,
			installedSha256: files.candidateSha256,
			archivedSha256: files.liveSha256
		};
	} catch (error) {
		if (archived) restoreOriginal(files, installed, error);
		throw error;
	}
}

function restoreOriginal(files, installed, originalError) {
	try {
		if (installed && fs.existsSync(files.livePath)) {
			if (fs.existsSync(files.candidatePath)) {
				throw new Error('candidate path unexpectedly exists during restoration');
			}
			fs.renameSync(files.livePath, files.candidatePath);
		}
		if (!fs.existsSync(files.livePath) && fs.existsSync(files.rollbackPath)) {
			fs.renameSync(files.rollbackPath, files.livePath);
		}
		fsyncPaths([files.livePath, files.candidatePath]);
	} catch (restorationError) {
		const composite = new Error(`B"H swap failed and automatic restoration also failed: ${restorationError.message}`);
		composite.code = 'AWTSMOOS_DB_SWAP_RESTORATION_FAILED';
		composite.cause = originalError;
		composite.restorationError = restorationError;
		throw composite;
	}
}

function inject(options, stage) {
	if (options.injectFailure !== stage) return;
	const error = new Error(`B"H injected failure ${stage}`);
	error.code = 'AWTSMOOS_DB_SWAP_INJECTED_FAILURE';
	throw error;
}

module.exports = atomicSwap;
