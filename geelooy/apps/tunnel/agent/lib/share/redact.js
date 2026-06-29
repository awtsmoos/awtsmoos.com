// B"H
const path = require('path');
const SECRET_NAMES = new Set(['.env','.npmrc','.ssh','id_rsa','id_ed25519','credentials.json','secrets.json']);
function isSecretPath(p = '') { return String(p).split(/[\\/]/).some(x => SECRET_NAMES.has(x) || /secret|token|password|credential/i.test(x)); }
function publicSession(s = {}) { const copy = { ...s }; delete copy.token; return copy; }
function basename(p = '') { return path.basename(String(p || '')); }
module.exports = { isSecretPath, publicSession, basename };
