// B"H
const crypto = require('crypto');
function create(auth, input = {}) { return { id:`ssh_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`, user:auth.user, cwd:input.cwd || '/', createdAt:new Date().toISOString(), lastAt:new Date().toISOString(), permissions:input.permissions || ['read','list','shell','sftp'], authMethod:auth.method }; }
function touch(s) { s.lastAt = new Date().toISOString(); return s; }
function can(s, p) { return !!s && (s.permissions || []).includes(p); }
module.exports = { create, touch, can };
