//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LivingWorldOperationsTest
 * @description
 * Dedicated persistence, explicit rollback, moderation, and public launch gates on Awtsmoos.com are verified before any persistent community world is advertised.
 */
import assert from 'node:assert/strict';
import { MemoryRepository } from '../js/persistence/memory-repository.js';
import { createLivingRegionWorld } from '../js/world/living-region-fixture.js';
import { DedicatedWorldRepository } from '../server/persistence/dedicated-world-repository.js';
import { AdminService } from '../server/admin/admin-service.js';
import { ModerationService } from '../server/moderation/moderation-service.js';
import { WorldDirectory } from '../server/matchmaking/world-directory.js';

const adapter = new MemoryRepository();
const repository = new DedicatedWorldRepository(adapter, 3);
const first = createLivingRegionWorld('operations-seed');
const second = { ...first, revision: 1 };
repository.save(first.id, { state: first, events: [] });
repository.save(first.id, { state: second, events: [{ revision: 1 }] });
const admin = new AdminService(repository);
const rollback = admin.rollback('admin-1', first.id, 1, 'Restore verified checkpoint');
assert.equal(rollback.checkpoint.payload.state.revision, 0);
assert.equal(admin.auditLog().length, 1);

const moderation = new ModerationService();
moderation.block('account-1', 'account-2');
assert.equal(moderation.canCommunicate('account-1', 'account-2'), false);
moderation.sanction('account-3', 'mute', 'Repeated abuse', 'moderator-1');
assert.equal(moderation.canCommunicate('account-3', 'account-4'), false);

const directory = new WorldDirectory();
assert.throws(() => directory.list({ id: 'unsafe', visibility: 'public' }), /gates/);
const listing = directory.list({
	id: 'ready-world',
	name: 'Ready Covenant',
	visibility: 'public',
	readiness: {
		moderationReady: true,
		migrationReady: true,
		backupRestoreVerified: true,
		privacyReviewed: true
	}
});
assert.equal(listing.id, 'ready-world');
console.log('B"H · Persistence, rollback audit, moderation, and public gates verified.');
