// B"H
const crypto = require('crypto');
function secret(config = {}) { return crypto.createHash('sha256').update(String(config.root || process.cwd()) + '|awtsmoos-share').digest(); }
function id(prefix = 'share') { return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(8).toString('hex')}`; }
function sign(config, body) { return crypto.createHmac('sha256', secret(config)).update(body).digest('base64url'); }
function token(config, sessionId) { const body = Buffer.from(JSON.stringify({ sessionId }), 'utf8').toString('base64url'); return `${body}.${sign(config, body)}`; }
function verify(config, tok = '') { const [body, sig] = String(tok).split('.'); if (!body || !sig || sign(config, body) !== sig) return null; try { return JSON.parse(Buffer.from(body, 'base64url').toString('utf8')); } catch { return null; } }
module.exports = { id, token, verify };
