/* B"H
Live and file source creation: every image, video, mic, window, and canvas becomes a scene node.
Audio may travel alone; video may travel alone; together they become a fuller vessel.
*/
import { nextId } from './state.js';
import { makeSourceNode } from './graph/sourceNode.js';

export async function makeWebcamSource(mode = 'both') {
  const stream = await navigator.mediaDevices.getUserMedia({ video:mode !== 'audio', audio:mode !== 'video' });
  const node = stream.getVideoTracks().length ? await videoFromStream(stream) : null;
  const label = mode === 'audio' ? 'Mic Audio' : mode === 'video' ? 'Webcam Video' : `Webcam${stream.getAudioTracks().length ? ' + Mic' : ''}`;
  return source({ type:mode === 'audio' ? 'audioInput' : 'webcam', name:label, node, x:40, y:40, w:360, h:mode === 'audio' ? 120 : 240, stream, audioOnly:mode === 'audio', videoOnly:mode === 'video' });
}
export async function makeMonitorSource(mode = 'both') { return makeDisplayLikeSource('monitor', mode, { x:70, y:70, w:640, h:360 }); }
export async function makeDisplaySource(mode = 'both') { return makeDisplayLikeSource('browser', mode, { x:80, y:80, w:520, h:292 }); }
export function makeCanvasSource() {
  const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 360;
  const c = canvas.getContext('2d'); c.fillStyle = '#101827'; c.fillRect(0, 0, 640, 360); c.fillStyle = '#83ffe7'; c.font = 'bold 42px sans-serif'; c.fillText('B"H Canvas Spark', 72, 178); c.strokeStyle = '#7c5cff'; c.lineWidth = 18; c.strokeRect(22, 22, 596, 316);
  return source({ type:'canvas', name:'2D Canvas', node:canvas, x:120, y:120, w:380, h:214 });
}
export function makeIframeSource(url) { return makeBrowserSource(url, { type:'iframe', name:'Iframe Plate' }); }
export function makeBrowserSource(url, options = {}) {
  const frame = Object.assign(document.createElement('iframe'), { src:url, title:'Nesher browser source' });
  frame.style.cssText = 'position:absolute;left:-9999px;width:960px;height:540px'; document.body.append(frame);
  return source({ type:options.type || 'browser', name:options.name || 'Browser Source', node:frame, x:180, y:160, w:480, h:270, url });
}
export async function makeImageFileSource(file) {
  const url = URL.createObjectURL(file); const img = Object.assign(new Image(), { src:url }); await img.decode?.();
  return source({ type:'image', name:file.name || 'Image', node:img, x:90, y:90, w:480, h:Math.round(480 * (img.naturalHeight || 9) / (img.naturalWidth || 16)), meta:{ objectUrl:url } });
}
export async function makeVideoFileSource(file) { return mediaElementSource(file, 'video'); }
export async function makeAudioFileSource(file) { return mediaElementSource(file, 'audio'); }

async function makeDisplayLikeSource(preferSurface, mode, box) {
  const stream = await captureDisplay({ preferSurface, audio:mode !== 'video' });
  if (mode === 'audio') stopVideoTracks(stream);
  const node = mode === 'audio' ? null : await videoFromStream(stream);
  const surface = mode === 'audio' ? 'audio' : surfaceName(stream);
  const audio = stream.getAudioTracks().length ? ' + Audio' : '';
  return source({ type:mode === 'audio' ? 'displayAudio' : 'display', name:mode === 'audio' ? 'Display Audio' : `${surfaceLabel(surface)}${mode === 'video' ? ' Video' : audio}`, node, ...box, h:mode === 'audio' ? 120 : box.h, stream, surface, audioOnly:mode === 'audio', videoOnly:mode === 'video' });
}
async function mediaElementSource(file, kind) {
  const url = URL.createObjectURL(file); const node = Object.assign(document.createElement(kind), { src:url, loop:true, controls:false });
  node.playsInline = true; node.crossOrigin = 'anonymous'; if (kind === 'video') node.muted = false; await node.play?.().catch(() => {});
  const stream = node.captureStream?.() || node.mozCaptureStream?.() || null;
  return source({ type:kind === 'audio' ? 'audioFile' : 'videoFile', name:file.name || `${kind} file`, node:kind === 'audio' ? null : node, x:130, y:130, w:480, h:kind === 'audio' ? 120 : 270, stream, audioOnly:kind === 'audio', mediaKind:kind, meta:{ objectUrl:url } });
}
async function captureDisplay({ preferSurface, audio }) {
  if (!navigator.mediaDevices?.getDisplayMedia) throw new Error('Display capture needs HTTPS or localhost in Chromium.');
  return navigator.mediaDevices.getDisplayMedia({ video:{ displaySurface:preferSurface, frameRate:{ ideal:30, max:60 } }, audio, surfaceSwitching:'include', systemAudio:'include', selfBrowserSurface:'exclude', monitorTypeSurfaces:'include' });
}
async function videoFromStream(stream) { const video = Object.assign(document.createElement('video'), { autoplay:true, muted:true, playsInline:true, srcObject:stream }); await video.play(); return video; }
function source(input) {
  const node = makeSourceNode({ ...input, id:nextId(input.type) }); node.audioWarning = input.stream?.nesherAudioWarning || '';
  node.stream?.getTracks?.().forEach(track => track.addEventListener('ended', () => { node.stopped = true; if (!node.name.endsWith(' (stopped)')) node.name += ' (stopped)'; })); return node;
}
function stopVideoTracks(stream) { stream.getVideoTracks?.().forEach(track => track.stop()); }
function surfaceName(stream) { return stream.getVideoTracks()[0]?.getSettings?.().displaySurface || 'display'; }
function surfaceLabel(surface) { return ({ monitor:'Monitor', window:'Window', browser:'Chrome Tab', application:'App', display:'Display', audio:'Display' })[surface] || 'Display'; }
