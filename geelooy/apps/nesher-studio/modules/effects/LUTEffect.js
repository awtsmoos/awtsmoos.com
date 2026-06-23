/* B"H */
export function createLUTEffect(input = {}) { return { kind:'LUTEffect', enabled:input.enabled ?? true, lutId:input.lutId || null, intensity:Number(input.intensity ?? 1) }; }
export function applyLutPixel(pixel, lut, intensity = 1) { const mapped = lut?.mapPixel?.(pixel) || pixel; return pixel.map((v, i) => i === 3 ? v : Math.round(v + (mapped[i] - v) * intensity)); }
