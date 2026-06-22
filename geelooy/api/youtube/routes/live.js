// B"H
const { ok, fail } = require('../core/json.js');
const { body } = require('../core/body.js');
const { youtube } = require('../core/client.js');
async function create($i) {
  const input = await body($i); const title = input.title || `BH Nesher Live ${new Date().toISOString()}`;
  const stream = await youtube('liveStreams?part=snippet,cdn', { method:'POST', body:JSON.stringify(streamBody(title, input)) });
  const broadcast = await youtube('liveBroadcasts?part=snippet,status,contentDetails', { method:'POST', body:JSON.stringify(broadcastBody(title, input)) });
  const bound = await youtube(`liveBroadcasts/bind?id=${broadcast.id}&streamId=${stream.id}&part=id,snippet,contentDetails,status`, { method:'POST', body:'{}' });
  return ok({ stream, broadcast, bound, ingest: stream.cdn?.ingestionInfo || null });
}
async function transition($i) {
  const input = await body($i); if (!input.broadcastId || !input.status) return fail('broadcastId_and_status_required');
  const out = await youtube(`liveBroadcasts/transition?broadcastStatus=${encodeURIComponent(input.status)}&id=${input.broadcastId}&part=id,status`, { method:'POST', body:'{}' });
  return ok({ broadcast: out });
}
function streamBody(title, input) { return { snippet:{ title:`${title} Stream` }, cdn:{ frameRate:input.frameRate || '30fps', ingestionType:input.ingestionType || 'hls', resolution:input.resolution || 'variable' } }; }
function broadcastBody(title, input) { return { snippet:{ title, scheduledStartTime: input.scheduledStartTime || new Date(Date.now()+60000).toISOString() }, status:{ privacyStatus: input.privacyStatus || 'unlisted', selfDeclaredMadeForKids:false }, contentDetails:{ enableAutoStart:true, enableAutoStop:true } }; }
module.exports = { create, transition };
