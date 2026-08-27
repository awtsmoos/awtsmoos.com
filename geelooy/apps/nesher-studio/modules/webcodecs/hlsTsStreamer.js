/* B"H
HLS streamer: public API unchanged, inner path split into Mediabunny Sefiros vessels.
Canvas frames enter Chochmah/Binah, segments descend through Malchus to the local tunnel.
*/
import { loadMediabunny } from '../mediabunny/loader.js';
import { requireMediabunnyExports } from '../mediabunny/guards.js';
import { createHlsOutput } from '../mediabunny/hlsOutput.js';
import { createHlsState } from '../mediabunny/hlsState.js';
import { pumpHlsFrame } from '../mediabunny/hlsPump.js';
import { stopHlsStream } from '../mediabunny/hlsStop.js';
import { makeLocalTunnelStreaming } from '../streaming/localTunnelStreaming.js';

export async function startHlsTsStream({ canvas, fps, bitrate, drawFrame, onStatus, tunnelBase, targetDuration = 1 }) {
  const chochmahMediabunny = await loadMediabunny();
  requireMediabunnyExports(chochmahMediabunny);
  const malchusTunnel = makeLocalTunnelStreaming(tunnelBase || 'http://127.0.0.1:3977');
  const keterStart = await malchusTunnel.start({ label:'Nesher H.264 MPEG-TS HLS', format:'hls-mpegts', targetDuration });
  const sessionId = keterStart.session?.id || keterStart.id || keterStart.sessionId;
  if (!sessionId) throw new Error('hls_session_missing_id');
  const yesodState = createHlsState({ sessionId, targetDuration });
  const { output:tiferesOutput, source:chesedSource } = createHlsOutput({ mb:chochmahMediabunny, canvas, bitrate, targetDuration, state:yesodState, tunnel:malchusTunnel });
  await tiferesOutput.start();
  const frameMs = Math.max(16, Math.round(1000 / fps));
  const timer = setInterval(() => pumpHlsFrame({ state:yesodState, source:chesedSource, fps, targetDuration, drawFrame }), frameMs);
  await pumpHlsFrame({ state:yesodState, source:chesedSource, fps, targetDuration, drawFrame });
  onStatus?.(`H.264 MPEG-TS HLS stream started. Session ${sessionId}.`);
  return { stop:() => stopHlsStream({ state:yesodState, timer, output:tiferesOutput, tunnel:malchusTunnel }), pumpNow:() => pumpHlsFrame({ state:yesodState, source:chesedSource, fps, targetDuration, drawFrame }), pieces:yesodState.pieces, get sessionId(){ return sessionId; }, get uploaded(){ return yesodState.uploaded; } };
}
