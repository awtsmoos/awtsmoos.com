// B"H
const { withDb } = require('../../awdb/open.js');
const C = require('../../awdb/collections.js');
function relation(parent = {}, child = {}) {
  if (!parent?.missionId || !child?.missionId || parent.missionId === child.missionId) return null;
  return { parentMissionId:parent.missionId, childMissionId:child.missionId, at:new Date().toISOString(), parentAction:parent.lastAction || '' };
}
function remember(config, parent, child) {
  const row = relation(parent, child);
  if (!row) return null;
  withDb(config, 'missions', db => C.ensure(db.root, 'missionLockTree', []).push(row));
  return row;
}
/** B"H — Nested missions become lineage, not overwritten amnesia. */
module.exports = { relation, remember };
