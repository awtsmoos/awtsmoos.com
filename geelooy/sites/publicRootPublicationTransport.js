//B"H
// Boruch Hashem
// Blessed is He

const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { acquirePublicationLock } = require('./publicRootPublicationLock.js');
const {
	ensureSafeParent,
	movePrevious,
	resolvePublicRoot,
	resolveTarget,
	restorePrevious,
	verifyTree,
	writeRelease
} = require('./publicRootPublicationFilesystem.js');

/**
 * @module PublicRootPublicationTransport
 * @description
 * Yesod carries one hash-closed release through staging and atomic exchange;
 * the Awtsmoos renews both old and new while Awtsmoos.com preserves rollback range.
 */

async function beginPublicRootDeployment(options = {}) {
	const publicRoot = await resolvePublicRoot(options.publicRoot);
	const targetPath = resolveTarget(publicRoot, options.publicPath);
	await ensureSafeParent(publicRoot, path.dirname(targetPath));
	const releaseLock = await acquirePublicationLock(`${targetPath}.awtsmoos-publish.lock`);
	const nonce = `${Date.now()}-${process.pid}-${crypto.randomBytes(4).toString('hex')}`;
	const stagePath = `${targetPath}.awtsmoos-stage-${nonce}`;
	const backupPath = `${targetPath}.awtsmoos-backup-${nonce}`;
	let hadPrevious = false;

	try {
		await writeRelease(stagePath, options.manifest);
		await verifyTree(stagePath, options.manifest);
		hadPrevious = await movePrevious(targetPath, backupPath);
		await fs.rename(stagePath, targetPath);
		await verifyTree(targetPath, options.manifest);
	} catch (error) {
		await fs.rm(stagePath, { recursive: true, force: true }).catch(() => {});
		await restorePrevious(targetPath, backupPath, hadPrevious).catch(() => {});
		await releaseLock();
		throw error;
	}

	return createTransaction({ targetPath, backupPath, hadPrevious, releaseLock });
}

function createTransaction(options) {
	const { targetPath, backupPath, hadPrevious, releaseLock } = options;
	return {
		targetPath,
		async finalize() {
			let backupRemoved = true;
			if (hadPrevious) {
				try {
					await fs.rm(backupPath, { recursive: true, force: true });
				} catch (_) {
					backupRemoved = false;
				}
			}
			await releaseLock();
			return { backupRemoved };
		},
		async rollback() {
			try {
				await restorePrevious(targetPath, backupPath, hadPrevious);
			} finally {
				await releaseLock();
			}
		}
	};
}

module.exports = { beginPublicRootDeployment, createTransaction };
