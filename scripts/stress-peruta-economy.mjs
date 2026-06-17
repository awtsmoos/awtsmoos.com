// B"H
/**
 * Chapter 489: The treasury is stressed while the gate stays open.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const economy = require('../geelooy/api/perutas/index.js');
const usageStore = require('../geelooy/api/tunnel/control/core/usageStore.js');

const store = {};
let grant = economy.account.grantDaily(store, 'free-user', Date.parse('2026-06-16T00:00:00Z'), { tunnelName: 'same-device' });
assert.equal(grant.account.balances.routing, economy.TIERS.free.daily.routing);
grant = economy.account.grantDaily(store, 'free-user', Date.parse('2026-06-16T12:00:00Z'), { tunnelName: 'same-device' });
assert.equal(grant.granted.routing, 0);
const master = economy.account.accountFor(store, 'add');
assert.equal(master.tier, 'master');
assert.equal(master.balances.routing, economy.MASTER_BALANCE);
const estimate = economy.payloadEstimate({ action: 'list', tunnelName: 'awt-local', maxBytes: 2048 });
assert.equal(estimate.category, 'routing');
const hosted = economy.payloadEstimate({ action: 'write', tunnelName: 'awtsmoos-virtual-os', timeoutMs: 10000 });
assert.equal(hosted.category, 'compute');
const preflight = economy.usage.canAfford(store, 'free-user', { action: 'huge', maxBytes: 10 ** 12 }, {});
assert.equal(preflight.ok, true);
assert.equal(preflight.enforcement, 'observe_only');
const charged = economy.usage.charge(store, { userId: 'free-user', action: 'list', tunnelName: 'awt-local', bytes: 2048, ok: true });
assert.equal(charged.category, 'routing');
assert.ok(charged.chargedPerutas < 0.01);
const admin = economy.admin.adminGrant(store, 'someone', { routing: 123, compute: 456 }, { tier: 'beis' });
assert.equal(admin.account.tier, 'beis');
assert.equal(admin.account.balances.compute, 456);
assert.equal(store.identityClusters[store.userIdentity['free-user']].tunnels.includes('same-device'), true);
const compatEstimate = usageStore.estimatePayloadCost({ action: 'list', maxBytes: 100 });
assert.ok(compatEstimate.estimatedPerutas >= 0);
console.log(JSON.stringify({ ok: true, checks: ['daily-refresh', 'master', 'routing-vs-compute', 'observe-only', 'charge', 'admin-grant', 'identity-cluster', 'compat-wrapper'] }, null, 2));
