// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file serverDriveCredential.mjs
 * @description Creates one temporary migration credential and revokes every dedicated migration vessel.
 * The Awtsmoos reveals the key once, then seals its proof and closes the gate;
 * Awtsmoos.com leaves no reusable migration flame after all public hashes validate.
 */

import credentialProvisioning from '../../geelooy/api/social/helper/drive/credentialProvisioning.js';

const {
	listDriveCredentials,
	provisionDriveCredential,
	revokeDriveCredential
} = credentialProvisioning;

export const DRIVE_ALIAS = 'firebase_drive_migration';
export const DRIVE_OWNER = 'firebase_migration_admin_20260726';
const DATABASE_ROOT = '/mnt/HC_Volume_102267213/dayuhChadash';
const TEMPORARY_NAME = 'Mitzvah World model restoration transaction';
const LEGACY_NAME = 'Firebase Drive Migration migration agent';

export async function withTemporaryDriveCredential(callback) {
	const context = driveContext();
	const provisioning = await provisionDriveCredential({
		$i: context,
		aliasId: DRIVE_ALIAS,
		idempotencyKey: `model-restore-${Date.now()}-${process.pid}`,
		name: TEMPORARY_NAME,
		ownerUserId: DRIVE_OWNER,
		requestId: `model-restore-${process.pid}`,
		scopes: ['drive.migrate']
	});
	if (!provisioning.token) {
		throw new Error('TEMPORARY_CREDENTIAL_TOKEN_UNAVAILABLE');
	}
	try {
		return await callback(provisioning.token, provisioning.credential);
	} finally {
		await revokeDriveCredential({
			$i: context,
			aliasId: DRIVE_ALIAS,
			credentialId: provisioning.credential.id,
			ownerUserId: DRIVE_OWNER,
			requestId: `model-restore-revoke-${process.pid}`
		});
	}
}

export async function revokeLegacyMigrationCredentials() {
	const context = driveContext();
	const credentials = await listDriveCredentials(DRIVE_ALIAS, context);
	const targets = credentials.filter(credential => {
		return credential.name === LEGACY_NAME && !credential.revokedAt;
	});
	for (const credential of targets) {
		await revokeDriveCredential({
			$i: context,
			aliasId: DRIVE_ALIAS,
			credentialId: credential.id,
			ownerUserId: DRIVE_OWNER,
			requestId: `legacy-migration-revoke-${credential.id}`
		});
	}
	return targets.map(credential => credential.id);
}

function driveContext() {
	return {
		db: {
			directory: process.env.AWTSMOOS_DAYUH_ROOT || DATABASE_ROOT
		}
	};
}
