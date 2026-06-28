// B"H
const Config = require('./config.js');
const Attach = require('./attach.js');
function after(config, payload = {}, result = {}) { if (!Config.enabled(payload) || !Config.TOOL_ACTIONS.has(result.action || payload.action)) return null; return Attach.attach(config, payload, result); }
module.exports = { after, ...Config };
