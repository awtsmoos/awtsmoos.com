// B"H
const data = require('./actions.json');
function set(name) { return new Set(data[name] || []); }
module.exports = { data, evidence:set('evidence'), risky:set('risky'), neutral:set('neutral') };
