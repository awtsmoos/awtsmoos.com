//B"H
const assert = require('assert');
const roles = require('../heichelRoles.js');

function makeDb() {
  const store = new Map();
  return {
    store,
    async get(path) { return store.get(path); },
    async write(path, value) { store.set(path, value); return { path, value }; }
  };
}

async function run() {
  const db = makeDb();
  await db.write('/social/heichelos/h1/editors', ['owner']);
  const $i = {
    db,
    $_POST: { aliasId: 'owner', memberAliasId: 'modB' },
    $_DELETE: {},
    request: { method: 'POST' },
    async fetchAwtsmoos() { return { yes: true, authorized: true }; }
  };

  const added = await roles.addHeichelRoleMember({ $i, heichelId: 'h1', role: 'moderators' });
  assert.equal(added.success.role, 'moderators');
  assert.deepEqual(added.success.members, ['modB']);

  const list = await roles.getHeichelRoleList({ $i, heichelId: 'h1', role: 'moderators' });
  assert.deepEqual(list.success, ['modB']);

  $i.$_DELETE = { aliasId: 'owner', memberAliasId: 'modB' };
  const removed = await roles.removeHeichelRoleMember({ $i, heichelId: 'h1', role: 'moderators' });
  assert.deepEqual(removed.success.members, []);

  const defaults = await roles.getHeichelSubmissionSettings({ $i, heichelId: 'h1' });
  assert.equal(defaults.success.allowPostSubmissions, true);
  assert.equal(defaults.success.requireCommentApproval, true);

  $i.$_POST = {
    aliasId: 'owner',
    allowPostSubmissions: 'no',
    allowCommentSubmissions: 'yes',
    requirePostApproval: 'yes',
    requireCommentApproval: 'no'
  };
  const saved = await roles.updateHeichelSubmissionSettings({ $i, heichelId: 'h1' });
  assert.equal(saved.success.allowPostSubmissions, false);
  assert.equal(saved.success.requireCommentApproval, false);

  console.log('B"H heichelRoles.test passed');
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
