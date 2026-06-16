// B"H
/** @file FenceStyleCatalog.js @description Fence and yard wall style data. */
export const FenceStyleCatalog = Object.freeze({ splitRail: { railCount: 2, height: 1.25, thickness: 0.22, visual: "wood" }, stoneLow: { railCount: 1, height: 0.9, thickness: 0.45, visual: "stone" }, brickWall: { railCount: 1, height: 1.45, thickness: 0.5, visual: "brick" }, hedge: { railCount: 1, height: 1.1, thickness: 0.7, visual: "leaf" } });
export function fenceStyle(name = "splitRail") { return FenceStyleCatalog[name] || FenceStyleCatalog.splitRail; }
export default FenceStyleCatalog;
