// B"H
const path = require('path');
const fsp = require('fs/promises');
const Device = require('../../deviceStateRoot.js');

/**
 * B"H
 * Mission memory belongs beside device state, not inside the repo.
 * The git tree is a source vessel; the ledger is a living notebook outside it.
 */
function root(config = {}) { return path.join(Device.awtsmoosRoot(config), 'mission-ledger-v1'); }
function missionPath(config, missionId) { return path.join(root(config), `${safe(missionId)}.json`); }
async function ensure(config = {}) { await fsp.mkdir(root(config), { recursive: true }); }
function safe(value) { return String(value || '').replace(/[^a-zA-Z0-9_.-]+/g, '_').slice(0, 160); }
module.exports = { root, missionPath, ensure, safe };
