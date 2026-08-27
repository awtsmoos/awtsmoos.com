/* B"H */
export function createChromaKeyEffect(input = {}) { return { kind:'ChromaKeyEffect', enabled:input.enabled ?? true, color:input.color || [0,255,0], tolerance:Number(input.tolerance || 32) }; }
export function chromaAlpha(pixel, effect) { const d = Math.hypot(pixel[0]-effect.color[0], pixel[1]-effect.color[1], pixel[2]-effect.color[2]); return d <= effect.tolerance ? 0 : (pixel[3] ?? 255); }
