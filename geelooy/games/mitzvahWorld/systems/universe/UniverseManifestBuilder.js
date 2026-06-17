// B"H
export function buildUniverseManifest({ imported, runtime, physical, reports, index } = {}) {
  return { id:imported?.summary?.world?.id || "unknown_universe", title:imported?.summary?.world?.title || "Untitled Universe", counts:{ beings:imported?.beings?.length || 0, commands:runtime?.commands?.length || 0, applied:physical?.applied?.length || 0, sefirosPackets:physical?.construction?.stats?.sefirosPackets || 0, indexed:index?.total || 0 }, reports:reports || {}, createdAt:new Date().toISOString() };
}
export default buildUniverseManifest;
