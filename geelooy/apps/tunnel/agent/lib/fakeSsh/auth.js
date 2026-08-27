// B"H
const crypto = require('crypto');
function normalizeUser(v = '') { return String(v || '').trim().toLowerCase(); }
function tokenSecret(config = {}) { return crypto.createHash('sha256').update(String(config.root || process.cwd()) + '|fake-ssh').digest(); }
function sign(config, body) { return crypto.createHmac('sha256', tokenSecret(config)).update(body).digest('base64url'); }
function sessionToken(config, input = {}) { const body = Buffer.from(JSON.stringify({ user:normalizeUser(input.user), at:Date.now(), scope:input.scope || 'geelooy-os' })).toString('base64url'); return `${body}.${sign(config, body)}`; }
function verifyToken(config, token = '') { const [body, sig] = String(token).split('.'); if (!body || sign(config, body) !== sig) return null; try { return JSON.parse(Buffer.from(body, 'base64url').toString()); } catch { return null; } }
async function authenticate(config, input = {}) {
  const user = normalizeUser(input.username || input.user);
  if (!user) return fail('missing_username');
  if (input.sessionToken && verifyToken(config, input.sessionToken)) return ok(config, user, 'sessionToken');
  if (typeof config.verifyAccountPassword === 'function') {
    const good = await config.verifyAccountPassword(user, String(input.password || ''));
    return good ? ok(config, user, 'accountPasswordVerifier') : fail('bad_password');
  }
  if (input.password) return fail('password_verifier_not_available');
  return fail('missing_authenticator');
}
function ok(config, user, method) { return { ok:true, user, method, sessionToken:sessionToken(config, { user }) }; }
function fail(error) { return { ok:false, error, passwordPolicy:'Use the account auth verifier or OAuth/session token. Never store or compare raw account passwords in tunnel files.' }; }
module.exports = { authenticate, sessionToken, verifyToken };
