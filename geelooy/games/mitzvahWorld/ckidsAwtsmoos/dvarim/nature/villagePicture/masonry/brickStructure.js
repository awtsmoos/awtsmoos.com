// B"H
/**
 * @file brickStructure.js
 * @description
 * Chapter 221: Any wall may now learn the brick-song.
 *
 * The Awtsmoos speaks a general masonry grammar: a garden wall, a chimney, a
 * ruined arch, a house face, or a lonely roadside barrier can all be born from
 * the same data. This is visual only. Physics must be separate simple boxes.
 */
import { add } from "../geometryKit.js";
import { PICTURE_COLORS as C } from "../palette.js";

export const DEFAULT_STONE_PALETTE = Object.freeze([C.stone, 0xd9c9a6, 0xb4a486, 0xe9d9b8, 0xa8926f, 0xf2e4c2]);
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

/**
 * Adds a textured cube as a visual brick or backing panel.
 * @param {THREE.Group} group target group.
 * @param {number} color hex color.
 * @param {number[]} position xyz center.
 * @param {number[]} scale xyz size.
 * @param {string} mode procedural texture mode.
 * @returns {THREE.Mesh} created visual mesh.
 */
export function addMasonryBox(group, color, position, scale, mode = "stone") {
  const mesh = add(group, "cube", color, position, scale, [0, 0, 0], { textureMode: mode });
  Object.assign(mesh.userData ||= {}, { masonryVisualOnly: true, physics: "separate-colliders-only" });
  return mesh;
}

function inOpening(x, y, opening) {
  if (!opening) return false;
  const pad = n(opening.pad, 0);
  return x > n(opening.xMin) - pad && x < n(opening.xMax) + pad && y > n(opening.yMin) - pad && y < n(opening.yMax) + pad;
}

function chooseColor(row, col, palette) {
  return palette[Math.abs((row * 3 + col * 5) % palette.length)] || C.stone;
}

function rowX(span, col, brickW, stagger) {
  return n(span.xMin) + brickW / 2 + col * brickW + stagger;
}

/**
 * Builds one 2D brick span on a flat plane facing Z.
 * @param {THREE.Group} group target visual group.
 * @param {object} span brick span data.
 * @returns {number} bricks placed.
 */
export function buildBrickSpan(group, span = {}) {
  const palette = span.palette || DEFAULT_STONE_PALETTE;
  const brickW = n(span.brickW, 0.46), brickH = n(span.brickH, 0.16), depth = n(span.depth, 0.16);
  const xMin = n(span.xMin), xMax = n(span.xMax), yMin = n(span.yMin), yMax = n(span.yMax, 1), z = n(span.z);
  const rows = Math.ceil((yMax - yMin) / brickH);
  let placed = 0;
  for (let row = 0; row < rows; row += 1) {
    const stagger = row % 2 ? brickW * n(span.stagger, 0.34) : 0;
    const cols = Math.ceil((xMax - xMin) / brickW) + 1;
    for (let col = 0; col < cols; col += 1) {
      const x = rowX(span, col, brickW, stagger), y = yMin + brickH / 2 + row * brickH;
      if (x > xMax - 0.08 || y > yMax - 0.04 || (span.openings || [span.opening]).some(o => inOpening(x, y, o))) continue;
      const mesh = addMasonryBox(group, chooseColor(row, col, palette), [x, y, z], [brickW * 0.94, brickH * 0.72, depth], span.mode || "stone");
      mesh.name = `${span.name || "brick_span"}_${row}_${col}`;
      placed += 1;
    }
  }
  return placed;
}

/**
 * Builds any visual masonry structure from panels and brick spans.
 * @param {THREE.Group} group target group.
 * @param {object} structure data with panels/spans.
 * @returns {{bricks:number, panels:number}} build summary.
 */
export function buildBrickStructure(group, structure = {}) {
  for (const panel of structure.panels || []) addMasonryBox(group, panel.color || C.stone, panel.position, panel.scale, panel.mode || "stone").name = panel.name || "masonry_backing_panel";
  const bricks = (structure.spans || []).reduce((sum, span) => sum + buildBrickSpan(group, span), 0);
  Object.assign(group.userData ||= {}, { visualBrickStructure: { bricks, panels: (structure.panels || []).length, physics: "none" } });
  return group.userData.visualBrickStructure;
}
