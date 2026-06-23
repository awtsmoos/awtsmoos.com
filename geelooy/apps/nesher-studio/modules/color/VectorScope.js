/* B"H */
export function createVectorScope(input = {}) { return { kind:'VectorScope', points:input.points || [] }; }
export function buildVectorScope(pixels = []) { return createVectorScope({ points:pixels.map(([r,g,b]) => ({ u:(b - ((r+g+b)/3)), v:(r - ((r+g+b)/3)) })) }); }
