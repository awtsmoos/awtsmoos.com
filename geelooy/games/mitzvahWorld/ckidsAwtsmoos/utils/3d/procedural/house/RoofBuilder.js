// B"H
/**
 * @module RoofBuilder
 * @description
 * Chapter 330: Roofs become a law, not a cone accident.
 *
 * The Awtsmoos replaces the warped pyramid with two clean sloped roof planes,
 * ridge cap, and eave lips. Boxes remain data-only and compile into one merged
 * BufferGeometry, but their positions are governed by a single gable equation.
 */
export default class RoofBuilder {
  static build(blueprint) {
    const w = blueprint.width;
    const h = blueprint.height;
    const d = blueprint.depth;
    const over = Number(blueprint.roofOverhang || 1.15);
    const rise = Number(blueprint.roofRise || Math.max(2.2, Math.min(w, d) * 0.22));
    const thick = Number(blueprint.roofThickness || 0.5);
    const run = w * 0.5 + over;
    const angle = Math.atan2(rise, run);
    const slopeLen = Math.sqrt(run * run + rise * rise);
    const y = h + rise * 0.48;
    const zDepth = d + over * 2;
    return [
      {
        type: 'box',
        params: { width: slopeLen, height: thick, depth: zDepth },
        modifiers: [
          { type: 'rotateZ', angle: angle },
          { type: 'translate', x: -run * 0.5, y, z: 0 }
        ],
        materialGroup: 1
      },
      {
        type: 'box',
        params: { width: slopeLen, height: thick, depth: zDepth },
        modifiers: [
          { type: 'rotateZ', angle: -angle },
          { type: 'translate', x: run * 0.5, y, z: 0 }
        ],
        materialGroup: 1
      },
      {
        type: 'box',
        params: { width: 0.72, height: 0.72, depth: zDepth + 0.35 },
        modifiers: [{ type: 'translate', x: 0, y: h + rise + 0.08, z: 0 }],
        materialGroup: 1
      },
      {
        type: 'box',
        params: { width: 0.42, height: 0.5, depth: zDepth + 0.3 },
        modifiers: [{ type: 'translate', x: -run - 0.06, y: h + 0.03, z: 0 }],
        materialGroup: 1
      },
      {
        type: 'box',
        params: { width: 0.42, height: 0.5, depth: zDepth + 0.3 },
        modifiers: [{ type: 'translate', x: run + 0.06, y: h + 0.03, z: 0 }],
        materialGroup: 1
      }
    ];
  }
}
