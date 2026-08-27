// B"H
const DEFAULT_TTL_MS = 30 * 60 * 1000;
const MAX_TTL_MS = 24 * 60 * 60 * 1000;
const READ_PERMS = ['read','list','preview','download'];
const COMMAND_PERMS = ['command','commandOutput'];
function truthy(v) { return v === true || ['true','1','yes'].includes(String(v).toLowerCase()); }
function ttlMs(input = {}) { const n = Number(input.ttlMs || input.ttlSeconds * 1000 || DEFAULT_TTL_MS); return Math.max(1000, Math.min(Number.isFinite(n) ? n : DEFAULT_TTL_MS, MAX_TTL_MS)); }
function permissions(input = {}) {
  const requested = Array.isArray(input.permissions) ? input.permissions : String(input.permissions || '').split(',').map(s => s.trim()).filter(Boolean);
  const base = requested.length ? requested : READ_PERMS;
  if (!truthy(input.allowCommand)) return base.filter(p => !COMMAND_PERMS.includes(p));
  return [...new Set([...base, ...COMMAND_PERMS.filter(p => base.includes(p))])];
}
function scope(input = {}) { return { kind: input.kind || 'file', path: input.path || input.p || '.', port: input.port || null, jobId: input.jobId || '', url: input.url || '' }; }
function createPolicy(input = {}) { return { visibility: input.visibility || 'secret-link', permissions: permissions(input), scope: scope(input), ttlMs: ttlMs(input), ownerOnly: !truthy(input.publicOwnerless), createdBy: input.createdBy || 'ai' }; }
function can(session, perm) { return !!session && session.revokedAt == null && Date.parse(session.expiresAt) > Date.now() && (session.permissions || []).includes(perm); }
module.exports = { createPolicy, can, READ_PERMS, COMMAND_PERMS };
