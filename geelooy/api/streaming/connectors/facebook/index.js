// B"H
const { ok, fail } = require('../../core/json.js');
const { body } = require('../../core/body.js');
async function status() { return ok({ connector: 'facebook', auth: 'manual-or-graph-api-later', ingest: ['rtmps'], note: 'Graph setup can come later; manual stream URL is first.' }); }
async function create($i) { const input = await body($i); if (!input.streamUrl) return fail('facebook_streamUrl_required'); return ok({ connector: 'facebook', manual: true, ingest: { protocol: 'rtmps', streamUrl: input.streamUrl, secretProvided: !!input.streamKey } }); }
module.exports = { id: 'facebook', actions: { status, create } };
