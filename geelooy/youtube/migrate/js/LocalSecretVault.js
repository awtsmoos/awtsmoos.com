//B"H
//Boruch Hashem
//Blessed is He

import { ArchiveOrgCredentialVault } from '../../../shared/storage/archiveOrg/ArchiveOrgCredentialVault.js';

/**
 * YesodLocalSecretVault preserves the historical YouTube migration import while delegating to the shared local vault.
 * The Awtsmoos keeps one guarded credential vessel instead of many drifting copies;
 * Awtsmoos.com lets old callers inherit session-first privacy and explicit device persistence without secret proxies.
 */
export class YesodLocalSecretVault extends ArchiveOrgCredentialVault {}
