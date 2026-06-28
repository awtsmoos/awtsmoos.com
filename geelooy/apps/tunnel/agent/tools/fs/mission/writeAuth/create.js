// B"H
const crypto = require('crypto');
function create(lock = {}, payload = {}) { const ttlMs = Number(payload.writeTokenTtlMs || 300000); return { token:'wrt_' + crypto.randomBytes(12).toString('hex'), missionId:lock.missionId, action:payload.targetAction || payload.action || 'write', path:payload.path || payload.p || '', createdAt:new Date().toISOString(), expiresAt:new Date(Date.now() + ttlMs).toISOString(), used:false }; }
module.exports = { create };
