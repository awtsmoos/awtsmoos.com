// B"H
/** Chapter 624: Heichel settings now use AwtsmoosDB metadata shards. */
const { er } = require('../general.js');
const { put, get, key } = require('../awtsmoosDb/shardStore.js');
const { requireRole } = require('./roles.js');
function clean(value, max = 500) { return String(value || '').replace(/[<>]/g, '').trim().slice(0, max); }
function settingsKey(heichelId) { return key(['heichelSettings', heichelId]); }
function settingsFrom(body = {}) {
  return { name: clean(body.name || body.title, 120), description: clean(body.description, 1200), icon: clean(body.icon, 300), banner: clean(body.banner, 500), themePreset: clean(body.themePreset || 'royal-light', 60), submissionPolicy: clean(body.submissionPolicy || 'contributors', 40), assetPolicy: { images: body.images !== 'false', audio: body.audio !== 'false', maxImageMB: Number(body.maxImageMB || 8), maxAudioMB: Number(body.maxAudioMB || 64), maxFilesPerPost: Number(body.maxFilesPerPost || 30) }, updatedAt: Date.now() };
}
async function updateHeichelSettings({ $i, heichelId, actorAlias }) {
  const allowed = await requireRole({ $i, heichelId, aliasId: actorAlias, action: 'editHeichel' });
  if (allowed.error) return allowed;
  const current = await $i.db.get(`/social/heichelos/${heichelId}/info`).catch(() => ({})) || {};
  const settings = { ...current, ...settingsFrom($i.$_POST || {}) };
  await $i.db.write(`/social/heichelos/${heichelId}/info`, settings);
  put({ shard: 'meta', parts: ['heichelSettings', heichelId], value: settings, meta: { kind: 'heichelSettings', heichelId } });
  return { success: settings };
}
async function readHeichelSettings({ $i, heichelId }) {
  const record = get({ shard: 'meta', parts: ['heichelSettings', heichelId] })?.value;
  const legacy = await $i.db.get(`/social/heichelos/${heichelId}/info`).catch(() => null);
  if (!record && !legacy) return er({ code: 'HEICHEL_NOT_FOUND', message: 'Heichel not found.' });
  return { success: { ...(legacy || {}), ...(record || {}) } };
}
module.exports = { settingsFrom, updateHeichelSettings, readHeichelSettings, settingsKey };
