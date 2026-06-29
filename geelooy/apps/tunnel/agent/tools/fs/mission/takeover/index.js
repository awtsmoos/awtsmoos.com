// B"H
function claim(lock = {}, agentId = 'anonymous') { lock.owner = agentId; lock.takeoverAt = new Date().toISOString(); lock.takeoverCount = Number(lock.takeoverCount || 0) + 1; return lock; }
module.exports = { claim };
