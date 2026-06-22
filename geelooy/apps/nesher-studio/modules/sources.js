/* B"H */
import { nextId } from './state.js';
import { makeSourceNode } from './graph/sourceNode.js';
export async function makeWebcamSource() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  const video = await videoFromStream(stream);
  return source({ type:'webcam', name:'Webcam', node:video, x:40, y:40, w:360, h:240, stream });
}
export async function makeMonitorSource() {
  const stream = await captureDisplay({ preferSurface:'monitor' });
  const video = await videoFromStream(stream); const surface = surfaceName(stream);
  return source({ type:'monitor', name:surface === 'monitor' ? 'Monitor + Audio' : `${surfaceLabel(surface)} Capture + Audio`, node:video, x:70, y:70, w:640, h:360, stream, surface });
}
export async function makeDisplaySource() {
  const stream = await captureDisplay({ preferSurface:'browser' });
  const video = await videoFromStream(stream); const surface = surfaceName(stream); const audio = stream.getAudioTracks().length ? ' + Audio' : '';
  return source({ type:'display', name:`${surfaceLabel(surface)}${audio}`, node:video, x:80, y:80, w:520, h:292, stream, surface });
}
export function makeCanvasSource() {
  const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 360; const c = canvas.getContext('2d');
  c.fillStyle = '#101827'; c.fillRect(0, 0, 640, 360); c.fillStyle = '#83ffe7'; c.font = 'bold 42px sans-serif'; c.fillText('B"H Canvas Spark', 72, 178); c.strokeStyle = '#7c5cff'; c.lineWidth = 18; c.strokeRect(22, 22, 596, 316);
  return source({ type:'canvas', name:'2D Canvas', node:canvas, x:120, y:120, w:380, h:214 });
}
export function makeIframeSource(url) { return makeBrowserSource(url, { type:'iframe', name:'Iframe Plate' }); }
export function makeBrowserSource(url, options = {}) {
  const frame = Object.assign(document.createElement('iframe'), { src:url, title:'Nesher browser source' });
  frame.style.cssText = 'position:absolute;left:-9999px;width:960px;height:540px'; document.body.append(frame);
  return source({ type:options.type || 'browser', name:options.name || 'Browser Source', node:frame, x:180, y:160, w:480, h:270, url });
}
async function captureDisplay({ preferSurface }) {
  if (!navigator.mediaDevices?.getDisplayMedia) throw new Error('Display capture needs HTTPS or localhost in Chromium.');
  return navigator.mediaDevices.getDisplayMedia({ video:{ displaySurface:preferSurface, frameRate:{ ideal:30, max:60 } }, audio:true, surfaceSwitching:'include', systemAudio:'include', selfBrowserSurface:'exclude', monitorTypeSurfaces:'include' });
}
async function videoFromStream(stream) { const video = Object.assign(document.createElement('video'), { autoplay:true, muted:true, playsInline:true, srcObject:stream }); await video.play(); return video; }
function source(input) { const node = makeSourceNode({ ...input, id:nextId(input.type) }); node.stream?.getVideoTracks?.().forEach(track => track.addEventListener('ended', () => { node.stopped = true; node.name += ' (stopped)'; })); return node; }
function surfaceName(stream) { return stream.getVideoTracks()[0]?.getSettings?.().displaySurface || 'display'; }
function surfaceLabel(surface) { return ({ monitor:'Monitor', window:'Window', browser:'Chrome Tab', application:'App', display:'Display' })[surface] || 'Display'; }
