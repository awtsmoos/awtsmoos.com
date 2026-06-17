// B"H
export function universeRuntimeReport({ imported, runtime, physical } = {}) { return { world:imported?.summary?.world || null, beings:imported?.beings?.length || 0, commands:runtime?.commands?.length || 0, applied:physical?.applied?.length || 0, sefirosPackets:physical?.construction?.stats?.sefirosPackets || 0 }; }
