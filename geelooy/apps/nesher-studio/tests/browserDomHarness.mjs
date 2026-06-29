/* B"H
A tiny DOM vessel for browser-ish smoke tests, small enough to stay honest.
*/
export const NESHER_IDS = ['stage','status','sourceList','sceneList','addScene','duplicateScene','recordButton','recordingProfile','fmp4StreamButton','addWebcam','addWebcamVideo','addMic','addMonitor','addDisplay','addDisplayVideo','addDisplayAudio','addAudioVisualizer','visualizerFamily','addVisualizerFamily','addCanvas','addIframe','addBrowser','addImage','addVideoFile','addAudioFile','imageFile','videoFile','audioFile','applySize','swapSize','resolutionPreset','aspectLock','aspectRatio','canvasWidth','canvasHeight','fps','iframeUrl','layerUp','layerDown','layerTop','layerBottom','duplicateSource','removeSource','streamProvider','streamProviderName','providerNote','streamCodec','streamState','streamSession','streamFrames','streamSegments','streamUploaded','streamErrors','inspectorName','inspectorMeta','cropControls','cropLeft','cropTop','cropRight','cropBottom','cropReset','visualizerControls','visualizerPreset','visualizerInput','visualizerSensitivity','visualizerBars','visualizerText','visualizerCustomJs','visualizerReset','nleBin','nleTimeline','nleSelectionSummary','nleExport','addBinAsset','addTimelineClip','splitClip','trimClipShorter','nudgeClipLeft','nudgeClipRight','moveClipTrack','rippleDeleteClip','prepareExport','runEncodingBenchmark','encodingBenchmarkOutput','downloadList'];
export function setupBrowserDom(ids = NESHER_IDS) {
  const elements = new Map();
  const document = { activeElement:null, createElement:tag => new FakeElement('', tag), getElementById:id => elements.get(id) || make(id) };
  function make(id) { const el = new FakeElement(id, tagFor(id)); elements.set(id, el); return el; }
  ids.forEach(make); installGlobals(document); return Object.fromEntries(elements);
}
function installGlobals(document) {
  globalThis.document = document;
  globalThis.window = { addEventListener(){}, removeEventListener(){}, devicePixelRatio:1 };
  globalThis.location = { search:'' };
  globalThis.setInterval = () => 1; globalThis.clearInterval = () => {};
  globalThis.requestAnimationFrame = fn => fn?.(0);
}
function tagFor(id) {
  if (id === 'stage') return 'canvas';
  if (/File$|Width|Height|fps|crop|Bars|Text|Url|Sensitivity/i.test(id)) return 'input';
  if (/Profile|Preset|Provider|Family|Input|Ratio/i.test(id)) return 'select';
  if (id === 'visualizerCustomJs') return 'textarea';
  if (id === 'encodingBenchmarkOutput') return 'pre';
  return 'div';
}
class FakeElement {
  constructor(id, tag = 'div') {
    this.id = id; this.tagName = tag.toUpperCase(); this.children = []; this.dataset = {}; this.style = {};
    this.listeners = {}; this.value = ''; this.textContent = ''; this.innerHTML = ''; this.hidden = false;
    this.disabled = false; this.files = []; this.className = ''; this.classList = classList(this);
  }
  append(...nodes) { nodes.forEach(node => { node.parentNode = this; this.children.push(node); }); }
  appendChild(node) { this.append(node); return node; }
  remove() { this.parentNode && (this.parentNode.children = this.parentNode.children.filter(x => x !== this)); }
  addEventListener(name, fn) { (this.listeners[name] ||= []).push(fn); }
  dispatchEvent(event) { for (const fn of this.listeners[event.type] || []) fn(event); }
  click() { return this.onclick?.({ target:this, preventDefault(){}, stopPropagation(){} }); }
  querySelectorAll(tag) { return all(this).filter(el => tag === 'input' ? el.tagName === 'INPUT' : false); }
  getContext() { return fakeContext(this); }
  getBoundingClientRect() { return { left:0, top:0, width:this.width || 1280, height:this.height || 720 }; }
  setPointerCapture() {}
  closest(sel) { const key = sel.match(/data-([\w-]+)/)?.[1]?.replace(/-([a-z])/g, (_, c) => c.toUpperCase()); return key && this.dataset[key] ? this : null; }
}
function all(root) { return root.children.flatMap(child => [child, ...all(child)]); }
function classList(el) { return { add:c => el.className = words(el, c).join(' '), remove:c => el.className = words(el).filter(x => x !== c).join(' '), contains:c => words(el).includes(c) }; }
function words(el, add = '') { return Array.from(new Set(`${el.className || ''} ${add}`.trim().split(/\s+/).filter(Boolean))); }
function fakeContext(canvas) {
  const grad = { addColorStop(){} };
  return new Proxy({ canvas, measureText:t => ({ width:String(t).length * 8 }), createLinearGradient:() => grad, createRadialGradient:() => grad }, { get:(target, prop) => prop in target ? target[prop] : () => {} });
}
