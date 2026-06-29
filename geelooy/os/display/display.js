// B"H
export function displayRecord(input = {}) { return { id:input.id || "display:main", width:input.width || innerWidth || 1024, height:input.height || innerHeight || 768, scale:input.scale || devicePixelRatio || 1, renderer:input.renderer || "html" }; }
