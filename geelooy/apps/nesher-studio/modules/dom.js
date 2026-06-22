/* B"H */
export const dom = {
  stage: document.getElementById('stage'), status: document.getElementById('status'), sourceList: document.getElementById('sourceList'),
  sceneList: document.getElementById('sceneList'), addScene: document.getElementById('addScene'), duplicateScene: document.getElementById('duplicateScene'),
  recordButton: document.getElementById('recordButton'), fmp4StreamButton: document.getElementById('fmp4StreamButton'),
  addWebcam: document.getElementById('addWebcam'), addMonitor: document.getElementById('addMonitor'), addDisplay: document.getElementById('addDisplay'), addCanvas: document.getElementById('addCanvas'),
  addIframe: document.getElementById('addIframe'), addBrowser: document.getElementById('addBrowser'), applySize: document.getElementById('applySize'), canvasWidth: document.getElementById('canvasWidth'),
  canvasHeight: document.getElementById('canvasHeight'), fps: document.getElementById('fps'), iframeUrl: document.getElementById('iframeUrl'),
  layerUp: document.getElementById('layerUp'), layerDown: document.getElementById('layerDown'), duplicateSource: document.getElementById('duplicateSource'), removeSource: document.getElementById('removeSource')
};
export const ctx = dom.stage.getContext('2d', { alpha: false });
export function setStatus(text) { dom.status.textContent = text; }
