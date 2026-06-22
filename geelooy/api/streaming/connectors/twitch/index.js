// B"H
const { ok, fail } = require('../../core/json.js');
const { body } = require('../../core/body.js');
async function status() { return ok({ connector: 'twitch', auth: 'manual-stream-key-first', ingest: ['rtmp'], note: 'OAuth for chat/metadata can be added later; first path is manual ingest.' }); }
async function create($i) { const input = await body($i); if (!input.server || !input.streamKey) return fail('twitch_server_and_streamKey_required'); return ok({ connector: 'twitch', manual: true, ingest: { protocol: 'rtmp', server: input.server, secretProvided: true } }); }
module.exports = { id: 'twitch', actions: { status, create } };
