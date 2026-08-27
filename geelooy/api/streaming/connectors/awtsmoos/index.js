// B"H
const { ok } = require('../../core/json.js');
const { body } = require('../../core/body.js');
const rooms = new Map();
async function status() { return ok({ connector: 'awtsmoos', modes: ['relay', 'record', 'multicast'], note: 'Optional hosted path where video bytes intentionally pass through Awtsmoos.' }); }
async function create($i) { const input = await body($i); const id = `awts-${Date.now().toString(36)}`; rooms.set(id, { id, title: input.title || 'Awtsmoos Live', mode: input.mode || 'relay', createdAt: Date.now() }); return ok({ connector: 'awtsmoos', room: rooms.get(id), ingest: { protocol: 'awts-hls-or-webtransport', roomId: id } }); }
module.exports = { id: 'awtsmoos', actions: { status, create } };
