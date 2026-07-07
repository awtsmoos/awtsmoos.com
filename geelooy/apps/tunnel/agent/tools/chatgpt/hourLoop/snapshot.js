// B"H
const crypto = require('crypto');

/** B"H — Chapter 1963: The answer leaves a fingerprint before it leaves a page. */
function make(input = {}) {
  const text = String(input.text || input.assistantTextPreview || '');
  return { hash: hash(text), chars: text.length, preview: text.slice(0, 500), at: new Date().toISOString(), href: input.href || '' };
}
function changed(a = {}, b = {}) { return !!b.hash && a.hash !== b.hash; }
function hash(text = '') { return crypto.createHash('sha256').update(String(text)).digest('hex').slice(0, 16); }
module.exports = { make, changed, hash };
