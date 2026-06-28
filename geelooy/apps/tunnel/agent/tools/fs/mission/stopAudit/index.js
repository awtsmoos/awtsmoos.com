// B"H
const Store = require('./store.js');
function after(config, lock, result) { if (lock && result?.interceptedFinalAnswer) return Store.record(config, lock, result); return null; }
module.exports = { after, list:Store.list };
