/* B"H
 * NLE bindings: bin, edit, transport, zoom, export, and selection.
 */
import { addAsset, selectAsset, selectedAsset } from '../nle/bin.js';
import { exportTimelinePreviewMp4 } from '../nle/browserExport.js';
import { createExportPlan, probeWebCodecsExport } from '../nle/exportPlan.js';
import { renderNle } from '../nle/renderNle.js';
import { addClip, selectClip } from '../nle/timeline.js';
import { addTimelineMarker, duplicateSelectedClip, jumpPlayhead, movePlayhead, moveSelectedClipToNextTrack, nudgeSelectedClip, rippleDeleteSelectedClip, setSelectedClipFades, snapSelectedClip, splitSelectedClip, timelineCommandSummary, toggleSelectedClipDisabled, toggleSelectedClipMute, trimSelectedClipBy, zoomTimeline } from '../nle/timelineCommands.js';

export function bindNleControls({ dom, state, setStatus }) {
  dom.addBinAsset.onclick = () => addGeneratedAsset({ dom, state, setStatus }); dom.addTimelineClip.onclick = () => addSelectedClip({ dom, state, setStatus });
  dom.prepareExport.onclick = () => runExportProbe({ dom, state, setStatus }); dom.nleBin.onclick = event => selectBinFromEvent({ dom, state, event, setStatus });
  dom.nleTimeline.onclick = event => selectClipFromEvent({ dom, state, event, setStatus }); bindEditButtons({ dom, state, setStatus }); bindTransportButtons({ dom, state, setStatus });
}
function bindEditButtons(v) {
  const b = v.dom;
  b.splitClip.onclick = () => runEdit({ ...v, action:() => splitSelectedClip(v.state.timeline), message:'Clip split.' });
  b.trimClipShorter.onclick = () => runEdit({ ...v, action:() => trimSelectedClipBy(v.state.timeline, -1), message:'Clip trimmed.' });
  b.nudgeClipLeft.onclick = () => runEdit({ ...v, action:() => nudgeSelectedClip(v.state.timeline, -1), message:'Clip nudged left.' });
  b.nudgeClipRight.onclick = () => runEdit({ ...v, action:() => nudgeSelectedClip(v.state.timeline, 1), message:'Clip nudged right.' });
  b.moveClipTrack.onclick = () => runEdit({ ...v, action:() => moveSelectedClipToNextTrack(v.state.timeline), message:'Clip moved track.' });
  b.rippleDeleteClip.onclick = () => runEdit({ ...v, action:() => rippleDeleteSelectedClip(v.state.timeline), message:'Clip ripple deleted.' });
  b.duplicateClip.onclick = () => runEdit({ ...v, action:() => duplicateSelectedClip(v.state.timeline), message:'Clip duplicated.' });
  b.snapClipPrev.onclick = () => runEdit({ ...v, action:() => snapSelectedClip(v.state.timeline, 'previous'), message:'Clip snapped previous.' });
  b.snapClipNext.onclick = () => runEdit({ ...v, action:() => snapSelectedClip(v.state.timeline, 'next'), message:'Clip snapped next.' });
  b.fadeClip.onclick = () => runEdit({ ...v, action:() => setSelectedClipFades(v.state.timeline, 1, 1), message:'Clip fades set.' });
  b.toggleClipMute.onclick = () => runEdit({ ...v, action:() => toggleSelectedClipMute(v.state.timeline), message:'Clip mute toggled.' });
  b.toggleClipDisabled.onclick = () => runEdit({ ...v, action:() => toggleSelectedClipDisabled(v.state.timeline), message:'Clip disable toggled.' });
  b.addMarker.onclick = () => runEdit({ ...v, action:() => addTimelineMarker(v.state.timeline, { label:`Marker ${(v.state.timeline.markers?.length || 0) + 1}` }), message:'Timeline marker added.' });
}
function bindTransportButtons(v) {
  const b = v.dom;
  b.nleJumpStart.onclick = () => runTransport({ ...v, action:() => jumpPlayhead(v.state.timeline, 'start'), message:'Playhead to start.' });
  b.nleJumpEnd.onclick = () => runTransport({ ...v, action:() => jumpPlayhead(v.state.timeline, 'end'), message:'Playhead to end.' });
  b.nlePlayheadBack.onclick = () => runTransport({ ...v, action:() => movePlayhead(v.state.timeline, -1), message:'Playhead back 1s.' });
  b.nlePlayheadForward.onclick = () => runTransport({ ...v, action:() => movePlayhead(v.state.timeline, 1), message:'Playhead forward 1s.' });
  b.nleZoomOut.onclick = () => runTransport({ ...v, action:() => zoomTimeline(v.state.timeline, -.25), message:'Timeline zoomed out.' });
  b.nleZoomIn.onclick = () => runTransport({ ...v, action:() => zoomTimeline(v.state.timeline, .25), message:'Timeline zoomed in.' });
}
function addGeneratedAsset({ dom, state, setStatus }) { const asset = addAsset(state.bin, { name:`Generated scene ${state.bin.assets.length + 1}`, kind:'generated', duration:6 }); renderNle(state, dom); setStatus(`${asset.name} selected in media bin.`); }
function addSelectedClip({ dom, state, setStatus }) { const asset = selectedAsset(state.bin); if (!asset) return setStatus('No asset selected.'); const clip = addClip(state.timeline, { assetId:asset.id, name:asset.name, duration:Math.min(8, asset.duration || 4) }); renderNle(state, dom); setStatus(`${clip.name} placed at ${clip.start}s.`); }
function selectBinFromEvent({ dom, state, event, setStatus }) { const id = event.target.closest('[data-asset-id]')?.dataset.assetId; if (!id) return; const asset = selectAsset(state.bin, id); renderNle(state, dom); setStatus(`${asset.name} selected.`); }
function selectClipFromEvent({ dom, state, event, setStatus }) { const id = event.target.closest('[data-clip-id]')?.dataset.clipId; if (!id) return; selectClip(state.timeline, id); renderNle(state, dom); setStatus(`Timeline clip selected: ${timelineCommandSummary(state.timeline)}.`); }
function runEdit({ dom, state, setStatus, action, message }) { const ok = action(); renderNle(state, dom); setStatus(ok ? `${message} ${timelineCommandSummary(state.timeline)}.` : 'Choose a timeline clip first.'); }
function runTransport({ dom, state, setStatus, action, message }) { action(); renderNle(state, dom); setStatus(message); }
async function runExportProbe({ dom, state, setStatus }) { state.exportPlan = createExportPlan(state); setStatus('Probing WebCodecs and rendering a short in-memory MP4 preview...'); const probe = await probeWebCodecsExport(state.exportPlan); const mp4 = await exportTimelinePreviewMp4({ width:320, height:180, fps:15, seconds:1 }); renderNle(state, dom); setStatus(`Export preview OK: ${mp4.bytes.length} byte MP4, ${mp4.frames} frames. Probe: video ${probe.video ? 'supported' : 'limited'}, audio ${probe.audio ? 'supported' : 'limited'}.`); }
