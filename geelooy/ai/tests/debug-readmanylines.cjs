#!/usr/bin/env node
const path = require('path');
const fs = require('fs');

function findPublicRoot(start) {
  let dir = start;
  while (dir && dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'geelooy/apps/tunnel/agent/main.js'))) return dir;
    dir = path.dirname(dir);
  }
  return null;
}

const REPO_ROOT = findPublicRoot(__dirname);
const { buildActions } = require(path.join(REPO_ROOT, 'geelooy/apps/tunnel/agent/tools/fs/actions.js'));
const TEST_ROOT = path.join(__dirname, '.tmp-readmanylines-test');

fs.mkdirSync(TEST_ROOT, { recursive: true });
fs.writeFileSync(path.join(TEST_ROOT, 'test.txt'), 'B"H test\nline2\nline3', 'utf8');

const config = { root: TEST_ROOT, allowWrite: true, allowSecrets: false, tools: { fsRead: true, fsWrite: true, fsBulk: true, fsList: true, fsTree: true } };
const actions = buildActions(config, { action: 'readManyLines', path: 'test.txt', lineOffsets: [0], lineLimits: [5] }, null);
actions.readManyLines().then(r => console.log(JSON.stringify(r, null, 2))).catch(e => console.error(e.message));