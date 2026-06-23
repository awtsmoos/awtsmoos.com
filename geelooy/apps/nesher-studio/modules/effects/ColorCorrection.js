/* B"H */
export function createColorCorrection(input = {}) { return { kind:'ColorCorrection', enabled:input.enabled ?? true, exposure:Number(input.exposure || 0), contrast:Number(input.contrast ?? 1), saturation:Number(input.saturation ?? 1), temperature:Number(input.temperature || 0) }; }
export function correctPixel([r,g,b,a=255], c) { const contrast = c.contrast ?? 1; const sat = c.saturation ?? 1; const exp = c.exposure || 0; const avg = (r + g + b) / 3; return [clamp((avg + (r - avg) * sat - 128) * contrast + 128 + exp), clamp((avg + (g - avg) * sat - 128) * contrast + 128 + exp), clamp((avg + (b - avg) * sat - 128) * contrast + 128 + exp), a]; }
function clamp(v) { return Math.max(0, Math.min(255, Math.round(v))); }
