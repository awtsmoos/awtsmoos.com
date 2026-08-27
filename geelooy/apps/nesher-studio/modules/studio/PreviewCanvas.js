/* B"H */
export function createPreviewCanvas(input = {}) { return { kind:'PreviewCanvas', canvas:input.canvas || null, sceneId:input.sceneId || null, width:input.width || 1280, height:input.height || 720 }; }
export function resizePreviewCanvas(view, width, height) { view.width = width; view.height = height; if (view.canvas) { view.canvas.width = width; view.canvas.height = height; } return view; }
