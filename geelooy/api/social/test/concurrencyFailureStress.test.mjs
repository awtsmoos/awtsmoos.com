//B"H
/**
 * Multi-user stress/failure smoke against the real server.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const DosDB = require('../../../../ayzarim/DosDB/index.js');
const { createApiKey } = require('../helper/apiKeys.js');

const repoRoot = process.cwd();
const dbRoot = path.resolve(repoRoot, '../../dayuhChadash');
const tmpDir = path.join(repoRoot, '.awtsmoos/tmp/concurrency-failure-stress');
const runSuffix = Date.now().toString(36);
const aliases = Array.from({ length: 8 }, (_, index) => `stress${index}_${runSuffix}`.slice(0, 24));
const users = aliases.map((_, index) => `BH_STRESS_${runSuffix}_USER_${index}`);

function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function request(route, { method = 'GET', body, apiKey } = {}) {
  const routeWithKey = apiKey && method === 'GET'
    ? `${route}${route.includes('?') ? '&' : '?'}apiKey=${encodeURIComponent(apiKey)}`
    : route;
  const finalBody = apiKey && body ? { apiKey, ...body } : body;
  const response = await fetch(`http://127.0.0.1:8080${routeWithKey}`, {
    method,
    headers: {
      ...(apiKey ? { authorization: `Bearer ${apiKey}`, 'x-awtsmoos-api-key': apiKey } : {}),
      ...(finalBody ? { 'content-type': 'application/x-www-form-urlencoded' } : {})
    },
    body: finalBody ? new URLSearchParams(finalBody).toString() : undefined,
    redirect: 'follow'
  });
  const text = await response.text();
  let json;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
  return { status: response.status, json, text };
}

async function requestWithRetry(route, options = {}, tries = 24) {
  let last;
  for (let attempt = 0; attempt < tries; attempt++) {
    try {
      return await request(route, options);
    } catch (error) {
      last = error;
      await wait(250);
    }
  }
  throw last;
}

async function waitForServer(server) {
  for (let attempt = 0; attempt < 30; attempt++) {
    if (server.exitCode !== null) {
      throw new Error(`Server exited before readiness with code ${server.exitCode}`);
    }
    try {
      const response = await request('/api/social/keys/verify?apiKey=probe');
      if (response.status === 200 || response.status === 404) return;
    } catch {}
    await wait(250);
  }
  throw new Error('Server did not become ready on 127.0.0.1:8080');
}

async function seedKeys() {
  const db = new DosDB(dbRoot);
  await db.init();
  const out = [];
  for (const userId of users) {
    const $i = { db, request: { user: { info: { userId } }, headers: {} }, $_POST: { label: 'stress key' } };
    const key = await createApiKey({ $i, userid: userId });
    out.push(key.success.key);
  }
  return out;
}

async function main() {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(tmpDir, { recursive: true });
  const apiKeys = await seedKeys();
  const server = spawn('node', ['index'], {
    cwd: repoRoot,
    stdio: ['ignore', fs.openSync(path.join(tmpDir, 'server.log'), 'w'), fs.openSync(path.join(tmpDir, 'server.err'), 'w')],
    env: { ...process.env, AWTSMOOS_REAL_SMOKE_DEBUG: '1' }
  });

  try {
    await waitForServer(server);

    const bad = await requestWithRetry('/api/social/keys/verify?apiKey=definitely_bad_key');
    assert.equal(bad.json?.error?.code, 'KEY_NOT_FOUND', `bad key response ${bad.text}`);

    const createdAliases = await Promise.all(aliases.map((aliasId, index) => requestWithRetry('/api/social/aliases', {
      method: 'POST',
      apiKey: apiKeys[index],
      body: { aliasName: `Stress ${index}`, inputId: aliasId, description: 'Concurrency stress alias' }
    })));
    createdAliases.forEach((response, index) => {
      assert.equal(response.status, 200, `alias ${index}: ${response.text}`);
    });

    const fanout = await requestWithRetry('/api/social/notifications/fanout', {
      method: 'POST',
      apiKey: apiKeys[0],
      body: {
        toAliases: aliases.slice(1).join(','),
        fromAliasId: aliases[0],
        type: 'chat',
        title: 'Stress fanout',
        body: 'Batch notification stress',
        entity: JSON.stringify({ type: 'stress', runSuffix })
      }
    });
    assert.equal(fanout.status, 200, `fanout ${fanout.text}`);
    assert.equal(fanout.json?.success?.length, aliases.length - 1);

    const polls = await Promise.all(aliases.slice(1).map((aliasId, offset) => requestWithRetry(`/api/social/notifications/${aliasId}/poll?since=0`, {
      apiKey: apiKeys[offset + 1]
    })));
    polls.forEach((response, index) => {
      assert.equal(response.status, 200, `poll ${index}: ${response.text}`);
      assert.ok(response.json?.success?.length >= 1, `poll ${index}: ${response.text}`);
    });

    const graphFailures = await requestWithRetry('/api/social/graph/references', {
      method: 'POST',
      apiKey: apiKeys[0],
      body: { kind: 'notARealKind', fromType: 'post', fromId: 'a', toType: 'post', toId: 'b' }
    });
    assert.equal(graphFailures.json?.error?.code, 'BAD_REFERENCE_KIND', `bad graph ${graphFailures.text}`);

    const graphWrites = await Promise.all(aliases.map((aliasId, index) => {
      const body = {
        kind: 'references',
        aliasId,
        fromType: 'post',
        fromId: `stressPost${index}`,
        fromHeichelId: `stressHeichel_${runSuffix}`,
        toType: 'alias',
        toId: aliasId,
        excerpt: 'Parallel graph reference stress'
      };
      const query = new URLSearchParams({ ...body, apiKey: apiKeys[index] }).toString();
      return requestWithRetry(`/api/social/graph/references?${query}`, {
        method: 'POST',
        apiKey: apiKeys[index],
        body
      });
    }));
    graphWrites.forEach((response, index) => {
      assert.equal(response.status, 200, `graph ${index}: ${response.text}`);
      assert.equal(response.json?.success?.kind, 'references', `graph ${index}: ${response.text}`);
    });

    console.log('B"H concurrencyFailureStress.test passed', JSON.stringify({
      users: users.length,
      aliases: aliases.length,
      fanout: fanout.json.success.length,
      polls: polls.length,
      graphWrites: graphWrites.length,
      invalidKey: bad.json.error.code,
      badGraph: graphFailures.json.error.code
    }, null, 2));
  } finally {
    server.kill('SIGTERM');
    await wait(250);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

main().catch(error => { console.error(error); process.exit(1); });
