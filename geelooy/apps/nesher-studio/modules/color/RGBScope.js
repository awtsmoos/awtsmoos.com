/* B"H */
export function createRGBScope(input = {}) { return { kind:'RGBScope', samples:input.samples || [] }; }
export function sampleRGB(pixels = []) { return createRGBScope({ samples:pixels.map(([r,g,b]) => ({ r, g, b })) }); }
export function averageRGB(scope) { const n = scope.samples.length || 1; return scope.samples.reduce((a,p) => ({ r:a.r+p.r/n, g:a.g+p.g/n, b:a.b+p.b/n }), { r:0, g:0, b:0 }); }
