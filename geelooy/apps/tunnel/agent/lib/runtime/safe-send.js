// B"H
const { ROOT } = require('../config.js');
const { compactForSend, jsonBytes, inlineLimit } = require('../response-size.js');
const C = require('./correlation.js');
function safeSend(ws, obj) { if (!ws || !ws.opened) return; try { ws.sendJson(compactForSend(ROOT, obj, { limitBytes: inlineLimit() }).envelope); } catch (e) { try { ws.sendJson({ type:'TUNNEL_RESPONSE', id:obj?.id, ...C.fields(obj), requestAction:obj?.requestAction, ok:false, status:500, error:'safe_send_failed', message:e.message, originalBytes:jsonBytes(obj) }); } catch (_) {} } }
module.exports = { safeSend };
