// B"H
const SECRET_KEYS = /^(apiKey|authorization|token|secret|providerKeys|key)$/i;
function redact(value, key = '', seen = new WeakSet()) {
  if (SECRET_KEYS.test(key)) return '[REDACTED]';
  if (typeof value === 'string') return looksSecret(value) ? mask(value) : value;
  if (!value || typeof value !== 'object') return value;
  if (seen.has(value)) return '[Circular]'; seen.add(value);
  if (Array.isArray(value)) return value.map(item => redact(item, key, seen));
  const action = value.action || '';
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, action === 'aiAgentSetProviderKey' && ['content','text','body','query','goal','params'].includes(k) ? '[REDACTED]' : redact(v, k, seen)]));
}
function looksSecret(text) { return /sk-[A-Za-z0-9_-]{16,}|Bearer\s+[A-Za-z0-9._-]{16,}/.test(String(text || '')); }
function mask(text) { const v = String(text || ''); return v.length <= 12 ? '[REDACTED]' : v.slice(0, 4) + '...[REDACTED]...' + v.slice(-4); }
module.exports = { redact, looksSecret, mask };
