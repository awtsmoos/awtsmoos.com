// B"H
const { setImmediate: yieldTick } = require('timers/promises');
const { writeText, normalizeWrites, describeWritePayload } = require('../readWrite.js');
const { replaceRange, applyPatch } = require('../searchEdit.js');
const { writeIfHash, bulkWriteIfHashes } = require('../hashWrite.js');
const { verifyJsFile, verifyJsRuntime } = require('../jsWriteVerifier.js');

/**
 * B"H
 * Chapter 470: Bulk write stopped becoming a wall.
 *
 * The Awtsmoos gives every file its instant, then returns the event loop to the
 * world. Bulk writes now yield between vessels and avoid heavyweight runtime
 * execution unless the caller explicitly asks for it.
 */
async function handleBulkWrite(config, payload, action) {
  if (!config.tools.fsBulk) throw new Error('fsBulk disabled.');
  const writes = normalizeWrites(payload);
  const payloadShape = describeWritePayload(payload);
  const results = {}, order = [];
  let okCount = 0, errorCount = 0;
  for (const one of writes) {
    await yieldTick();
    await writeOne(config, payload, one, results, order, { bulk: true }).then(
      () => { okCount++; },
      () => { errorCount++; }
    );
  }
  return { ok:errorCount === 0, action, root:config.root, count:writes.length, okCount, errorCount, partial:errorCount > 0, payloadShape, order, results };
}

async function writeOne(config, payload, one, results, order, options = {}) {
  order.push(one.path);
  try {
    const wrote = await writeText(config, one.path, one.content);
    const verify = verificationPolicy(payload, options);
    wrote.jsVerification = verify.js ? verifyJsFile(wrote.absolutePath, payload) : skippedVerification('jsVerification');
    wrote.runtimeVerification = verify.runtime ? await verifyJsRuntime(wrote.absolutePath, payload) : skippedVerification('runtimeVerification');
    results[one.path] = wrote;
  } catch (e) {
    results[one.path] = { ok:false, path:one.path, error:e.message };
    throw e;
  }
}

async function handleOneWrite(config, payload, action, p) {
  const content = payload.content !== undefined ? payload.content : payload.text;
  const wrote = await writeText(config, p, content ?? '');
  const verify = verificationPolicy(payload, { bulk: false });
  const jsVerification = verify.js ? verifyJsFile(wrote.absolutePath, payload) : skippedVerification('jsVerification');
  const runtimeVerification = verify.runtime ? await verifyJsRuntime(wrote.absolutePath, payload) : skippedVerification('runtimeVerification');
  return { ok:true, action, root:config.root, ...wrote, jsVerification, runtimeVerification };
}

function verificationPolicy(payload = {}, options = {}) {
  const wantsNone = payload.verify === false || payload.skipVerification === true;
  const wantsRuntime = payload.verifyRuntime === true || payload.runtimeVerification === true;
  const wantsJs = payload.verifyJs !== false && !wantsNone;
  return { js:wantsJs, runtime:!wantsNone && (!options.bulk || wantsRuntime) };
}

function skippedVerification(kind) { return { ok:true, skipped:true, kind, reason:'bulk_or_policy_fast_path' }; }

async function consolidatedWrite(config, payload, action, p) {
  const mode = String(payload.mode || payload.writeMode || 'file').trim();
  if (['bulk', 'many', 'files'].includes(mode)) return await handleBulkWrite(config, payload, 'bulkWrite');
  if (['hash', 'ifHash', 'writeIfHash'].includes(mode)) return await writeIfHash(config, { ...payload, action:'writeIfHash' });
  if (['bulkHash', 'bulkIfHash', 'bulkWriteIfHashes'].includes(mode)) return await bulkWriteIfHashes(config, { ...payload, action:'bulkWriteIfHashes' });
  return await handleOneWrite(config, payload, action, p);
}

function buildWriteActions(ctx) {
  const { config, payload } = ctx;
  const action = payload.action || 'list';
  const p = payload.path || payload.p || '.';
  return {
    async write() { return await consolidatedWrite(config, payload, action, p); },
    async bulkWrite() { return await handleBulkWrite(config, payload, action); },
    async writeIfHash() { return await writeIfHash(config, payload); },
    async bulkWriteIfHashes() { return await bulkWriteIfHashes(config, payload); },
    async replaceRange() { return { root:config.root, ...(await replaceRange(config, payload)) }; },
    async applyPatch() { return { root:config.root, ...(await applyPatch(config, payload)) }; }
  };
}

module.exports = { buildWriteActions, handleBulkWrite, consolidatedWrite, verificationPolicy, skippedVerification };
