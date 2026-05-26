// B"H
import assert from 'node:assert/strict';
import { platformOps } from '../api/platformOps.js';

const calls = [];
globalThis.fetch = async (url, opts = {}) => {
  calls.push({ url: String(url), opts });
  return { ok: true, status: 200, statusText: 'OK', async json() { return { success: true }; } };
};

await platformOps.moderationQueues();
await platformOps.moderationReport({ target: { type: 'post', id: 'p1' }, actor: 'mod', reason: 'noise' });
await platformOps.migrationDryRun({ heichelId: 'h', seriesId: 'root' });
await platformOps.migrationRun({ heichelId: 'h', limit: 7 });
await platformOps.federationImport({ remoteHeichel: 'remote', signedPayload: { id: 'x' } });
await platformOps.mediaRegister({ mediaId: 'm', aliasId: 'a', metadata: { mime: 'image/png' } });
await platformOps.mediaAttach({ mediaId: 'm', entity: { type: 'post', id: 'p' } });
await platformOps.listRelationships({ aliasId: 'a', type: 'follow' });
await platformOps.setRelationship({ aliasId: 'a', type: 'follow', target: 'b' });
await platformOps.recordMetric({ name: 'ui.click', tags: { panel: 'ops' } });
await platformOps.enqueueJob({ type: 'digest', payload: { aliasId: 'a' }, runAt: 123 });
await platformOps.runJobs({ limit: 2 });
await platformOps.compilePermissions({ subject: 'a', resource: 'h', rules: [{ allow: true }] });

assert.ok(calls.some(call => call.url.endsWith('/api/social/mod/queues') && !call.opts.method));
assert.ok(calls.some(call => call.url.includes('/api/social/migrations/posts/v2/dryRun?') && !call.opts.method));
assert.ok(calls.some(call => call.url.endsWith('/api/social/migrations/posts/v2/run') && call.opts.method === 'POST'));
assert.ok(calls.some(call => call.url.endsWith('/api/social/federation/import') && call.opts.method === 'POST'));
assert.ok(calls.some(call => call.url.includes('/api/social/relationships/a?') && !call.opts.method));
assert.ok(calls.some(call => call.url.endsWith('/api/social/relationships/a/follow/b') && call.opts.method === 'POST'));
assert.ok(calls.some(call => call.url.endsWith('/api/social/permissions/compile') && call.opts.method === 'POST'));

console.log('B"H platformOpsApi.test passed');
