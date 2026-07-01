// B"H
function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'yes'; }
function localServerAllowed(payload = {}) {
  if (payload.aiLocalServerPreview === false || payload.aiLocalServerPreview === 'false') return false;
  if (payload.disableLocalServerPreview === true || payload.disableLocalServerPreview === 'true') return false;
  return true;
}
function apply(preview = {}, payload = {}) {
  return { ...preview, aiLocalServerPreview:true, localServerPreviewDefaultOn:localServerAllowed(payload), policy:{ ...(preview.policy || {}), aiLocalServerPreviewDefault:'on-private', aiLocalServerPreviewAllowed:localServerAllowed(payload), visibility:preview.visibility || 'private' } };
}
/** B"H — Private local-server previews are default-on unless explicitly disabled. */
module.exports = { truthy, localServerAllowed, apply };
