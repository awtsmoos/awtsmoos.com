
/**
 * B"H
 * @file ProceduralRoadInput.js
 * @description
 * Normalizes ProceduralRoad inputs before RoadAssembler receives them.
 */

/**
 * B"H
 * Extracts road options from procedural object fields.
 *
 * @param {Object} nivra
 * Procedural road instance.
 *
 * @returns {Object}
 * Road options.
 */
export function getRoadOptionsFromNivra(nivra) {
  const source = nivra?.options || nivra?.opts || nivra?.dayuh || nivra?.data || {};

  return {
    name: nivra?.name || source.name || "procedural-road",
    width: source.width ?? nivra?.width ?? 7,
    length: source.length ?? nivra?.length ?? 40,
    depth: source.depth ?? nivra?.depth ?? 0.16,
    position: source.position || {
      x: nivra?.position?.x ?? 0,
      y: nivra?.position?.y ?? 0,
      z: nivra?.position?.z ?? 0
    },
    rotation: source.rotation || {
      x: nivra?.rotation?.x ?? 0,
      y: nivra?.rotation?.y ?? 0,
      z: nivra?.rotation?.z ?? 0
    }
  };
}
