// B"H
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const tmpDir = '.awtsmoos/tmp/social-live-smoke';
fs.rmSync(tmpDir, { recursive: true, force: true });
fs.mkdirSync(tmpDir, { recursive: true });

const server = spawn('node', ['index'], {
  stdio: ['ignore', fs.openSync(path.join(tmpDir, 'server.log'), 'w'), fs.openSync(path.join(tmpDir, 'server.err'), 'w')]
});

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url, tries = 16) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const response = await fetch(url, { redirect: 'follow' });
      const text = await response.text();
      return { response, text };
    } catch (error) {
      last = error;
      await wait(250);
    }
  }
  throw last;
}

const paths = [
  '/api/social/heichelos/testHeichel/roles/editors',
  '/api/social/heichelos/testHeichel/roles/moderators',
  '/api/social/heichelos/testHeichel/settings/submissions',
  '/api/social/heichelos/testHeichel/submittedPosts',
  '/api/social/aliases/testAlias/commentsMade/heichelos',
  '/api/social/heichelos/testHeichel/series/root/details',
  '/@/testAlias',
  '/email/?to=testAlias',
  '/heichelos/heichel/modules/api/roles.js',
  '/heichelos/heichel/modules/editing/roleSettingsPanel.js',
  '/heichelos/heichel/modules/api/postApprovals.js',
  '/heichelos/heichel/modules/editing/postApprovalPanel.js',
  '/heichelos/heichel/modules/api/series.js',
  '/heichelos/heichel/modules/modal.js',
  '/style/heichelos/revamped-partials/content.css',
  '/style/social/profileStyles.css',
  '/api/social/packed/snapshot',
  '/api/social/packed/stats',
  '/api/social/feed/trending',
  '/api/social/feed/home',
  '/style/heichelos/revamped-partials/platform-mobile.css',
  '/style/heichelos/revamped-partials/platform-panels.css',
  '/heichelos/heichel/modules/ui/platformPanel.js',
  '/heichelos/heichel/modules/api/platform.js',
  '/heichelos/heichel/modules/ui/notificationsPanel.js',
  '/heichelos/heichel/modules/api/notifications.js',
  '/api/social/notifications/testAlias/unread/count',
  '/api/social/notifications/testAlias/poll',
  '/api/social/notifications/testAlias',
  '/heichelos/heichel/modules/api/socialContent.js',
  '/api/social/content/heichelos/testHeichel/questions/testQuestion/answers?apiKey=none',
  '/api/social/content/heichelos/testHeichel/posts/testQuestion/sections',
  '/api/social/content/heichelos/testHeichel/questions/testQuestion/answers',
  '/keys/verify',
  '/scripts/awtsmoos/api/social/nodeClient.mjs',
  '/graph/references?type=post&id=p1&heichelId=h1',
  '/graph/entity/resolve?type=post&id=p1&heichelId=h1',
  '/keys/verify'
];

try {
  await wait(1000);
  for (const route of paths) {
    const { response, text } = await fetchWithRetry(`http://127.0.0.1:8080${route}`);
    assert.equal(response.status, 200, `${route} returned ${response.status}`);
    assert.ok(text.length > 0, `${route} returned empty body`);
  }
  console.log('B"H socialLiveSmoke.test passed', JSON.stringify({ routes: paths.length }));
} finally {
  server.kill('SIGTERM');
  await wait(200);
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
