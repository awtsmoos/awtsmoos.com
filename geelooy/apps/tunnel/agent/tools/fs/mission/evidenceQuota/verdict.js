// B"H
const Config = require('./config.js'); const Count = require('./count.js');
function issues(config, lock = {}) { const need = Config.required(lock), got = Count.counts(config, lock.missionId), out = []; for (const [k,v] of Object.entries(need)) if ((got[k] || 0) < v) out.push(`quota_${k}_${got[k]||0}_of_${v}`); return { issues:out, counts:got, required:need }; }
module.exports = { issues };
