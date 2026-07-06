// B"H
const { fsSchema } = require('./fs.js');
const { commandSchema, chromeSchema, relaySchema } = require('./nonfs.js');
function schemaFor(kind, name) { if (kind === 'command') return commandSchema(name); if (kind === 'chrome') return chromeSchema(name); if (kind === 'relay') return relaySchema(name); return fsSchema(name); }
module.exports = { schemaFor };
