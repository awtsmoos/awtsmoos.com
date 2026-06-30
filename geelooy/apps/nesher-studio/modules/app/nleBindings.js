/* B"H
NLE bindings: bin sparks descend into time, then edit commands bend the track river.
The Awtsmoos hides inside the cut where before and after become one story.
*/
import { addAsset, selectAsset, selectedAsset } from '../nle/bin.js';
import { exportTimelinePreviewMp4 } from '../nle/browserExport.js';
import { createExportPlan, probeWebCodecsExport } from '../nle/exportPlan.js';
import { renderNle } from '../nle/renderNle.js';
import { addClip, selectClip } from '../nle/timeline.js';
import { addTimelineMarker, duplicateSelectedClip, moveSelectedClipToNextTrack, nudgeSelectedClip, rippleDeleteSelectedClip, setSelectedClipFades, snapSelectedClip, splitSelectedClip, timelineCommandSummary, toggleSelectedClipDisabled, toggleSelectedClipMute, trimSelectedClipBy } from '../nle/timelineCommands.js';

export function bindNleControls({ dom, state, setStatus }) {
  dom.addBinAsset.onclick = () => addGeneratedAsset({ dom, state, setStatus });
  dom.addTimelineClip.onclick = () => addSelectedClip({ dom, state, setStatus });
  dom.prepareExport.onclick = () => runExportProbe({ dom, state, setStatus });
  dom.nleBin.onclick = event => selectBinFromEvent({ dom, state, event, setStatus });
  dom.nleTimeline.onclick = event => selectClipFromEvent({ dom, state, event, setStatus });
  bindEditButtons({ dom, state, setStatus });
}
function bindEditButtons(v) {
  const b = v.dom;
  b.splitClip.onclick = () => runEdit({ ...v, action:() => splitSelectedClip(v.state.timeline), message:'Clip split at midpoint.' });
  b.trimClipShorter.onclick = () => runEdit({ ...v, action:() => trimSelectedClipBy(v.state.timeline, -1), message:'Clip trimmed shorter.' });
  b.nudgeClipLeft.onclick = () => runEdit({ ...v, action:() => nudgeSelectedClip(v.state.timeline, -1), message:'Clip nudged left.' });
  b.nudgeClipRight.onclick = () => runEdit({ ...v, action:() => nudgeSelectedClip(v.state.timeline, 1), message:'Clip nudged right.' });
  b.moveClipTrack.onclick = () => runEdit({ ...v, action:() => moveSelectedClipToNextTrack(v.state.timeline), message:'Clip moved to next track.' });
  b.rippleDeleteClip.onclick = () => runEdit({ ...v, action:() => rippleDeleteSelectedClip(v.state.timeline), message:'Clip ripple deleted.' });
  b.duplicateClip.onclick = () => runEdit({ ...v, action:() => duplicateSelectedClip(v.state.timeline), message:'Clip duplicated.' });
  b.snapClipPrev.onclick = () => runEdit({ ...v, action:() => snapSelectedClip(v.state.timeline, 'previous'), message:'Clip snapped to previous boundary.' });
  b.snapClipNext.onclick = () => runEdit({ ...v, action:() => snapSelectedClip(v.state.timeline, 'next'), message:'Clip snapped to next boundary.' });
  b.fadeClip.onclick = () => runEdit({ ...v, action:() => setSelectedClipFades(v.state.timeline, 1, 1), message:'Clip fade metadata set.' });
  b.toggleClipMute.onclick = () => runEdit({ ...v, action:() => toggleSelectedClipMute(v.state.timeline), message:'Clip mute toggled.' });
  b.toggleClipDisabled.onclick = () => runEdit({ ...v, action:() => toggleSelectedClipDisabled(v.state.timeline), message:'Clip enable/disable toggled.' });
  b.addMarker.onclick = () => runEdit({ ...v, action:() => addTimelineMarker(v.state.timeline, { label:`Marker ${(v.state.timeline.markers?.length || 0) + 1}` }), message:'Timeline marker added.' });
}
function addGeneratedAsset({ dom, state, setStatus }) { const asset = addAsset(state.bin, { name:`Generated scene ${state.bin.assets.length + 1}`, kind:'generated', duration:6 }); renderNle(state, dom); setStatus(`${asset.name} selected in media bin.`); }
function addSelectedClip({ dom, state, setStatus }) { const asset = selectedAsset(state.bin); if (!asset) return setStatus('No asset selected.'); const clip = addClip(state.timeline, { assetId:asset.id, name:asset.name, duration:Math.min(8, asset.duration || 4) }); renderNle(state, dom); setStatus(`${clip.name} placed at ${clip.start}s on timeline.`); }
function selectBinFromEvent({ dom, state, event, setStatus }) { const id = event.target.closest('[data-asset-id]')?.dataset.assetId; if (!id) return; const asset = selectAsset(state.bin, id); renderNle(state, dom); setStatus(`${asset.name} selected.`); }
function selectClipFromEvent({ dom, state, event, setStatus }) { const id = event.target.closest('[data-clip-id]')?.dataset.clipId; if (!id) return; selectClip(state.timeline, id); renderNle(state, dom); setStatus(`Timeline clip selected: ${timelineCommandSummary(state.timeline)}.`); }
function runEdit({ dom, state, setStatus, action, message }) { const ok = action(); renderNle(state, dom); setStatus(ok ? `${message} ${timelineCommandSummary(state.timeline)}.` : 'Choose a timeline clip first.'); }
async function runExportProbe({ dom, state, setStatus }) { state.exportPlan = createExportPlan(state); setStatus('Probing WebCodecs and rendering a short in-memory MP4 preview...'); const probe = await probeWebCodecsExport(state.exportPlan); const mp4 = await exportTimelinePreviewMp4({ width:320, height:180, fps:15, seconds:1 }); renderNle(state, dom); setStatus(`Export preview OK: ${mp4.bytes.length} byte MP4, ${mp4.frames} frames. Probe: video ${probe.video ? 'supported' : 'limited'}, audio ${probe.audio ? 'supported' : 'limited'}.`); }
