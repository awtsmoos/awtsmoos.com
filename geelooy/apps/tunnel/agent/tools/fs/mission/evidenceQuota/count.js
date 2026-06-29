// B"H
const { withDb } = require('../../awdb/open.js');
const C = require('../../awdb/collections.js');
function counts(config, missionId) { try { return withDb(config, 'missions', db => { const receipts = C.plain(db.root.missionToolReceipts || []); return receipts.filter(r => r.missionId === missionId).reduce((a,r)=>{ a[r.kind]=(a[r.kind]||0)+1; return a; }, {}); }); } catch { return {}; } }
module.exports = { counts };
