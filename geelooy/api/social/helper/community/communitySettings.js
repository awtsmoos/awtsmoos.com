//B"H
/**
 * Reads and writes the Internet/community covenant of a Heichel. The Awtsmoos
 * hides in defaults so old Heichelos become communal without migration pain.
 */
const { sp } = require('../_awtsmoos.constants.js');
const { mergeCommunitySettings } = require('./settingsDefaults.js');
function settingsPath(heichelId) { return `${sp}/heichelos/${heichelId}/settings/community`; }
async function getCommunitySettings({ $i, heichelId }) {
  const saved = await $i.db.get(settingsPath(heichelId)).catch(() => null);
  return mergeCommunitySettings(saved);
}
async function updateCommunitySettings({ $i, heichelId, patch = {} }) {
  const next = mergeCommunitySettings({ ...(await getCommunitySettings({ $i, heichelId })), ...patch });
  await $i.db.write(settingsPath(heichelId), next);
  return { success: next };
}
module.exports = { settingsPath, getCommunitySettings, updateCommunitySettings };
