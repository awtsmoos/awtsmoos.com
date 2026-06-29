/* B"H
Source bindings: each button invites a new vessel into the scene garden.
The Awtsmoos is not the webcam or file; He is the instant they can appear.
*/
import { addSource } from '../graph/sceneGraph.js';
import {
  makeAudioFileSource, makeBrowserSource, makeCanvasSource, makeDisplaySource,
  makeIframeSource, makeImageFileSource, makeMonitorSource, makeVideoFileSource,
  makeWebcamSource
} from '../sources.js';

export function bindSourceControls({ dom, state, changed, setStatus }) {
  const add = source => addSceneSource({ state, source, changed });
  dom.addCanvas.onclick = () => add(makeCanvasSource());
  dom.addIframe.onclick = () => add(makeIframeSource(dom.iframeUrl.value.trim()));
  dom.addBrowser.onclick = () => add(makeBrowserSource(dom.iframeUrl.value.trim()));
  dom.addWebcam.onclick = () => guardedAdd(() => makeWebcamSource('both'), 'Webcam', add, setStatus);
  dom.addWebcamVideo.onclick = () => guardedAdd(() => makeWebcamSource('video'), 'Webcam video', add, setStatus);
  dom.addMic.onclick = () => guardedAdd(() => makeWebcamSource('audio'), 'Mic audio', add, setStatus);
  dom.addMonitor.onclick = () => guardedAdd(() => makeMonitorSource('both'), 'Monitor', add, setStatus);
  dom.addDisplay.onclick = () => guardedAdd(() => makeDisplaySource('both'), 'Display', add, setStatus);
  dom.addDisplayVideo.onclick = () => guardedAdd(() => makeDisplaySource('video'), 'Display video', add, setStatus);
  dom.addDisplayAudio.onclick = () => guardedAdd(() => makeDisplaySource('audio'), 'Display audio', add, setStatus);
  bindFileButtons({ dom, add, setStatus });
}

function bindFileButtons({ dom, add, setStatus }) {
  dom.addImage.onclick = () => dom.imageFile.click();
  dom.addVideoFile.onclick = () => dom.videoFile.click();
  dom.addAudioFile.onclick = () => dom.audioFile.click();
  dom.imageFile.onchange = () => addFile(dom.imageFile, makeImageFileSource, add, setStatus);
  dom.videoFile.onchange = () => addFile(dom.videoFile, makeVideoFileSource, add, setStatus);
  dom.audioFile.onchange = () => addFile(dom.audioFile, makeAudioFileSource, add, setStatus);
}

async function addFile(input, factory, add, setStatus) {
  const file = input.files?.[0];
  if (!file) return;
  try { add(await factory(file)); input.value = ''; }
  catch (e) { setStatus(`File source failed: ${e.message}`); }
}

async function guardedAdd(factory, label, add, setStatus) {
  try { add(await factory()); }
  catch (e) { setStatus(`${label} blocked or unavailable: ${e.message}`); }
}

function addSceneSource({ state, source, changed }) {
  addSource(state, source);
  changed(`${source.name} added.`);
}
