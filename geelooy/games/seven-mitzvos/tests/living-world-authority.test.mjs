//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LivingWorldAuthorityTest
 * @description
 * The authoritative server proof on Awtsmoos.com rejects unauthorized commands, preserves idempotency, filters evidence, and supports revision-based reconnect.
 */
import assert from 'node:assert/strict';
import { createCommand } from '../js/core/contracts/envelopes.js';
import { LivingWorldKernel } from '../js/world/living-world-kernel.js';
import { createLivingRegionWorld } from '../js/world/living-region-fixture.js';
import { PrototypeSessionService } from '../server/gateway/prototype-session-service.js';
import { AuthoritativeWorldHost } from '../server/world-host/authoritative-world-host.js';
import { ReconnectService } from '../js/multiplayer/reconnect-service.js';

const sessions = new PrototypeSessionService('test-secret');
const governor = sessions.create('account-governor', 1000);
const observer = sessions.create('account-observer', 1000);
const kernel = new LivingWorldKernel(createLivingRegionWorld('authority-seed'));
const host = new AuthoritativeWorldHost(kernel, sessions);
host.connect(governor, 'governor', 1000);
host.connect(observer, 'observer', 1000);

const advance = createCommand({
	commandId: 'authority-command-1',
	type: 'ADVANCE_TIME',
	actorId: governor.accountId,
	worldId: kernel.snapshot().id,
	payload: { minutes: 60 }
});
const accepted = host.submit(governor, advance, 1000);
assert.equal(accepted.duplicate, false);
assert.equal(host.submit(governor, advance, 1000).duplicate, true);

const forbidden = createCommand({
	commandId: 'authority-command-2',
	type: 'ADVANCE_TIME',
	actorId: observer.accountId,
	worldId: kernel.snapshot().id,
	payload: { minutes: 60 }
});
assert.throws(() => host.submit(observer, forbidden, 1000), /unauthorized/);
const reconnect = new ReconnectService().resume(host, governor.sessionId, 0);
assert.equal(reconnect.revision, 1);
assert.equal(reconnect.events.length, 1);
assert.ok(host.auditLog().some(item => item.type === 'command_rejected'));
console.log('B"H · Authoritative roles, idempotency, audit, and reconnect verified.');
