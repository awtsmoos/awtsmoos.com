/* B"H
DOM map: every visible control receives a name, so the studio can answer immediately.
The Awtsmoos is not the element; the element is only a vessel for action.
*/
export const dom = {
  stage:el('stage'), status:el('status'), sourceList:el('sourceList'), sceneList:el('sceneList'), addScene:el('addScene'), duplicateScene:el('duplicateScene'), recordButton:el('recordButton'), recordingProfile:el('recordingProfile'), fmp4StreamButton:el('fmp4StreamButton'),
  addWebcam:el('addWebcam'), addWebcamVideo:el('addWebcamVideo'), addMic:el('addMic'), addMonitor:el('addMonitor'), addDisplay:el('addDisplay'), addDisplayVideo:el('addDisplayVideo'), addDisplayAudio:el('addDisplayAudio'), addCanvas:el('addCanvas'), addIframe:el('addIframe'), addBrowser:el('addBrowser'), addImage:el('addImage'), addVideoFile:el('addVideoFile'), addAudioFile:el('addAudioFile'), imageFile:el('imageFile'), videoFile:el('videoFile'), audioFile:el('audioFile'),
  applySize:el('applySize'), swapSize:el('swapSize'), resolutionPreset:el('resolutionPreset'), aspectLock:el('aspectLock'), aspectRatio:el('aspectRatio'), canvasWidth:el('canvasWidth'), canvasHeight:el('canvasHeight'), fps:el('fps'), iframeUrl:el('iframeUrl'),
  layerUp:el('layerUp'), layerDown:el('layerDown'), layerTop:el('layerTop'), layerBottom:el('layerBottom'), duplicateSource:el('duplicateSource'), removeSource:el('removeSource'), streamProvider:el('streamProvider'), streamProviderName:el('streamProviderName'), providerNote:el('providerNote'),
  streamCodec:el('streamCodec'), streamState:el('streamState'), streamSession:el('streamSession'), streamFrames:el('streamFrames'), streamSegments:el('streamSegments'), streamUploaded:el('streamUploaded'), streamErrors:el('streamErrors'),
  inspectorName:el('inspectorName'), inspectorMeta:el('inspectorMeta'), cropControls:el('cropControls'), cropLeft:el('cropLeft'), cropTop:el('cropTop'), cropRight:el('cropRight'), cropBottom:el('cropBottom'), cropReset:el('cropReset'),
  nleBin:el('nleBin'), nleTimeline:el('nleTimeline'), nleExport:el('nleExport'), addBinAsset:el('addBinAsset'), addTimelineClip:el('addTimelineClip'), prepareExport:el('prepareExport')
};
export const ctx = dom.stage.getContext('2d', { alpha:false });
export function setStatus(text) { dom.status.textContent = text; }
export function setStreamHealth({ state='Idle', session='—', frames=0, segments=0, uploaded=0, errors=0 } = {}) { dom.streamState.textContent = state; dom.streamSession.textContent = session || '—'; dom.streamFrames.textContent = String(frames || 0); dom.streamSegments.textContent = String(segments || 0); dom.streamUploaded.textContent = formatBytes(uploaded || 0); dom.streamErrors.textContent = String(errors || 0); }
export function setProviderUi(provider, summary) { dom.streamProviderName.textContent = provider.name; dom.providerNote.textContent = provider.note; dom.streamCodec.textContent = summary; }
function formatBytes(bytes) { const n = Number(bytes || 0); if (n < 1024) return `${n} B`; if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`; return `${(n / 1048576).toFixed(2)} MB`; }
function el(id) { return document.getElementById(id); }
