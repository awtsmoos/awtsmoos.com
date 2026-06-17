// B"H
export class ProceduralMeshError extends Error { constructor(message, detail = {}) { super(`B\"H | ProceduralMeshError | ${message}`); this.detail = detail; } }
export function meshError(message, detail) { return new ProceduralMeshError(message, detail); }
