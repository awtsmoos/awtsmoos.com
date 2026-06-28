// B"H
const { withDb } = require('../awdb/open.js');
const C = require('../awdb/collections.js');
function record(config, receipt) { try { withDb(config, 'actions', db => { const c = C.ensure(db.root, 'continuation'); const list = C.ensure(c, 'receipts', []); list.push(receipt); }); } catch {} return receipt; }
module.exports = { record };
