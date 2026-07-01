// B"H
function baseUrl(payload = {}) {
  return String(payload.controlBaseUrl || 'https://awtsmoos.com/api/tunnel/control/fs/auto').replace(/\/fs\/[^/]+$/, '');
}
function encode(value) { return Buffer.from(String(value || ''), 'utf8').toString('base64'); }
function previewUrl(payload, preview) { return `${baseUrl(payload)}/preview/create?preview64=${encode(JSON.stringify(preview))}`; }
function proxyUrl(payload, url) { return `${baseUrl(payload)}/preview/${encodeURIComponent(payload.tunnelName || 'auto')}?url64=${encode(url)}`; }
/** B"H — URLs are small doors; the live app stays on the user's machine. */
module.exports = { baseUrl, encode, previewUrl, proxyUrl };
