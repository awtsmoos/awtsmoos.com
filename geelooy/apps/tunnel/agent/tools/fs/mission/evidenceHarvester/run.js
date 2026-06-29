// B"H
const Config = require('./config.js');
const Receipts = require('../toolReceipts/index.js');
async function run(config, lock = {}, payload = {}, buildActions) {
  if (!Config.enabled(payload)) return { harvested:false, reason:'disabled' };
  const reads = payload.harvestReads || Config.DEFAULT_READS, greps = payload.harvestGreps || Config.DEFAULT_GREPS, evidence = [];
  for (const p of reads) evidence.push(await call(config, buildActions, { action:'read', p, maxChars:1200, ignoreMissionLock:true }, lock));
  for (const query of greps) evidence.push(await call(config, buildActions, { action:'grep', p:'.', query, maxChars:1200, ignoreMissionLock:true }, lock));
  return { harvested:true, evidence:evidence.filter(Boolean) };
}
async function call(config, buildActions, payload, lock) {
  const fn = buildActions(config, payload)[payload.action];
  if (!fn) return null;
  const result = await fn().catch(error => ({ ok:false, action:payload.action, error:String(error && error.message || error) }));
  return Receipts.after(config, payload, { ...result, action:payload.action }) || { missionId:lock.missionId, action:payload.action, ok:result.ok !== false };
}
module.exports = { run };
