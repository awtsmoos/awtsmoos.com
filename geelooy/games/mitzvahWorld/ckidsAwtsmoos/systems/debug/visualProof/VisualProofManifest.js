// B"H
export function visualProofEntry(input = {}) {
  return {
    phase:input.phase || "unknown",
    image:input.image,
    frame:input.frame || 0,
    player:input.player || null,
    collision:input.collision || null,
    target:input.target || null,
    fps:input.fps || null,
    violations:input.violations || []
  };
}

export function visualProofManifest(entries = [], extra = {}) {
  return {
    kind:"mitzvahWorldVisualProofManifest",
    generatedAt:new Date().toISOString(),
    visualProofGenerated:entries.length > 0,
    entries,
    ...extra
  };
}

export default { visualProofEntry, visualProofManifest };
