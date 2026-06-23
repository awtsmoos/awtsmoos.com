/* B"H */
export function createMaskEffect(input = {}) { return { kind:'MaskEffect', enabled:input.enabled ?? true, shape:input.shape || 'rect', feather:Number(input.feather || 0), points:input.points || [] }; }
export function maskContains(mask, x, y) { if (mask.shape !== 'rect') return true; const [a={x:0,y:0}, b={x:1,y:1}] = mask.points; return x >= a.x && x <= b.x && y >= a.y && y <= b.y; }
