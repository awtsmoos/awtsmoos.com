/* B"H
 * NLE bindings: every control is wired when present, and partial test DOMs stay honest.
 * A timeline can breathe even before every button has descended into the page.
 */
import { addAsset, selectAsset, selectedAsset } from '../nle/bin.js';
import { exportTimelinePreviewMp4 } from '../nle/browserExport.js';
import { createExportPlan, probeWebCodecsExport } from '../nle/exportPlan.js';
import { renderNle } from '../nle/renderNle.js';
import { addClip, selectClip } from '../nle/timeline.js';
import { addTimelineMarker, duplicateSelectedClip, jumpPlayhead, movePlayhead, moveSelectedClipToNextTrack, nudgeSelectedClip, rippleDeleteSelectedClip, setSelectedClipFades, snapSelectedClip, splitSelectedClip, timelineCommandSummary, toggleSelectedClipDisabled, toggleSelectedClipMute, trimSelectedClipBy, zoomTimeline } from '../nle/timelineCommands.js';

export function bindNleControls(v) {
  const { dom } = v;
  on(dom.addBinAsset, () => addGeneratedAsset(v)); on(dom.addTimelineClip, () => addSelectedClip(v));
  on(dom.prepareExport, () => runExportProbe(v)); on(dom.nleBin, event => selectBinFromEvent({ ...v, event }));
  on(dom.nleTimeline, event => selectClipFromEvent({ ...v, event })); bindEditButtons(v); bindTransportButtons(v);
}
function bindEditButtons(v) {
  const b = v.dom, run = (el, action, message) => on(el, () => runEdit({ ...v, action, message }));
  run(b.splitClip, () => splitSelectedClip(v.state.timeline), 'Clip split.');
  run(b.trimClipShorter, () => trimSelectedClipBy(v.state.timeline, -1), 'Clip trimmed.');
  run(b.nudgeClipLeft, () => nudgeSelectedClip(v.state.timeline, -1), 'Clip nudged left.');
  run(b.nudgeClipRight, () => nudgeSelectedClip(v.state.timeline, 1), 'Clip nudged right.');
  run(b.moveClipTrack, () => moveSelectedClipToNextTrack(v.state.timeline), 'Clip moved track.');
  run(b.rippleDeleteClip, () => rippleDeleteSelectedClip(v.state.timeline), 'Clip ripple deleted.');
  run(b.duplicateClip, () => duplicateSelectedClip(v.state.timeline), 'Clip duplicated.');
  run(b.snapClipPrev, () => snapSelectedClip(v.state.timeline, 'previous'), 'Clip snapped previous.');
  run(b.snapClipNext, () => snapSelectedClip(v.state.timeline, 'next'), 'Clip snapped next.');
  run(b.fadeClip, () => setSelectedClipFades(v.state.timeline, 1, 1), 'Clip fades set.');
  run(b.toggleClipMute, () => toggleSelectedClipMute(v.state.timeline), 'Clip mute toggled.');
  run(b.toggleClipDisabled, () => toggleSelectedClipDisabled(v.state.timeline), 'Clip disable toggled.');
  run(b.addMarker, () => addTimelineMarker(v.state.timeline, { label:`Marker ${(v.state.timeline.markers?.length || 0) + 1}` }), 'Timeline marker added.');
}
function bindTransportButtons(v) {
  const b = v.dom, run = (el, action, message) => on(el, () => runTransport({ ...v, action, message }));
  run(b.nleJumpStart, () => jumpPlayhead(v.state.timeline, 'start'), 'Playhead to start.');
  run(b.nleJumpEnd, () => jumpPlayhead(v.state.timeline, 'end'), 'Playhead to end.');
  run(b.nlePlayheadBack, () => movePlayhead(v.state.timeline, -1), 'Playhead back 1s.');
  run(b.nlePlayheadForward, () => movePlayhead(v.state.timeline, 1), 'Playhead forward 1s.');
  run(b.nleZoomOut, () => zoomTimeline(v.state.timeline, -.25), 'Timeline zoomed out.');
  run(b.nleZoomIn, () => zoomTimeline(v.state.timeline, .25), 'Timeline zoomed in.');
}
function on(el, handler) { if (el) el.onclick = handler; }
function addGeneratedAsset({ dom, state, setStatus }) { const asset = addAsset(state.bin, { name:`Generated scene ${state.bin.assets.length + 1}`, kind:'generated', duration:6 }); renderNle(state, dom); setStatus(`${asset.name} selected in media bin.`); }
function addSelectedClip({ dom, state, setStatus }) { const asset = selectedAsset(state.bin); if (!asset) return setStatus('No asset selected.'); const clip = addClip(state.timeline, { assetId:asset.id, name:asset.name, duration:Math.min(8, asset.duration || 4) }); renderNle(state, dom); setStatus(`${clip.name} placed at ${clip.start}s.`); }
function selectBinFromEvent({ dom, state, event, setStatus }) { const id = event.target.closest('[data-asset-id]')?.dataset.assetId; if (!id) return; const asset = selectAsset(state.bin, id); renderNle(state, dom); setStatus(`${asset.name} selected.`); }
function selectClipFromEvent({ dom, state, event, setStatus }) { const id = event.target.closest('[data-clip-id]')?.dataset.clipId; if (!id) return; selectClip(state.timeline, id); renderNle(state, dom); setStatus(`Timeline clip selected: ${timelineCommandSummary(state.timeline)}.`); }
function runEdit({ dom, state, setStatus, action, message }) { const ok = action(); renderNle(state, dom); setStatus(ok ? `${message} ${timelineCommandSummary(state.timeline)}.` : 'Choose a timeline clip first.'); }
function runTransport({ dom, state, setStatus, action, message }) { action(); renderNle(state, dom); setStatus(message); }
async function runExportProbe({ dom, state, setStatus }) { state.exportPlan = createExportPlan(state); setStatus('Probing WebCodecs and rendering a short in-memory MP4 preview...'); const probe = await probeWebCodecsExport(state.exportPlan); const mp4 = await exportTimelinePreviewMp4({ width:320, height:180, fps:15, seconds:1 }); renderNle(state, dom); setStatus(`Export preview OK: ${mp4.bytes.length} byte MP4, ${mp4.frames} frames. Probe: video ${probe.video ? 'supported' : 'limited'}, audio ${probe.audio ? 'supported' : 'limited'}.`); }
