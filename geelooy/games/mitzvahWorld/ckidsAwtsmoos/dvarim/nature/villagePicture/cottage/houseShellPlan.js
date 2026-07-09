// B"H
/**
 * @file houseShellPlan.js
 * @description
 * Chapter 354: No backing plane may cross the doorway.
 *
 * The gray mortar remained because one front span still owned a full backing
 * rectangle and merely asked the brick generator to cut visual stones. The
 * Awtsmoos now speaks in separated front spans: left jamb, right jamb, and high
 * lintel. The doorway itself is not geometry at all.
 */
import { PICTURE_COLORS as C } from "../palette.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { COTTAGE, facadeZ } from "./cottageContract.js?compact=true&v=split-front-no-mortar-door-20260603-bh354";

export const HOUSE_SCALE = COTTAGE.scale;
export const DOORWAY_LOCAL = COTTAGE.door;
export const HOUSE_METRICS = Object.freeze({
  frontZ: facadeZ(),
  backZ: -COTTAGE.halfDepth,
  halfW: COTTAGE.halfWidth,
  halfD: COTTAGE.halfDepth,
  doorHalf: COTTAGE.door.halfWidth,
  doorTop: COTTAGE.door.top,
  floorTop: COTTAGE.door.bottom,
  worldScale: COTTAGE.scale,
  worldDoorWidth: COTTAGE.door.halfWidth * 2 * COTTAGE.scale,
  worldDoorClearHeight: (COTTAGE.door.top - COTTAGE.door.bottom) * COTTAGE.scale
});

const stonePalette = Object.freeze([C.stone, 0xd8cfaa, 0xc2b58f, 0xeee0bd, 0xafa17d, 0xf4e9c9]);
const brick = Object.freeze({
  brickW: 0.255,
  brickH: 0.105,
  depth: COTTAGE.wallThickness,
  mortarDepth: COTTAGE.wallThickness * 0.42,
  mortarGap: 0.006,
  protrude: 0.026,
  mortarColor: 0x9b9279,
  palette: stonePalette
});
const yMin = COTTAGE.floorTop;
const yMax = COTTAGE.wallHeight;
const zFront = facadeZ();
const d = COTTAGE.door;

export const HOUSE_BRICK_STRUCTURE = Object.freeze({
  name: "cottage_split_front_no_gray_door_mortar",
  panels: [],
  spans: [
    { name: "front_left_brick_jamb_no_backing_in_door", face: "front", xMin: -COTTAGE.halfWidth, xMax: -d.halfWidth, yMin, yMax, z: zFront, ...brick },
    { name: "front_right_brick_jamb_no_backing_in_door", face: "front", xMin: d.halfWidth, xMax: COTTAGE.halfWidth, yMin, yMax, z: zFront, ...brick },
    { name: "front_lintel_only_above_door", face: "front", xMin: -d.halfWidth, xMax: d.halfWidth, yMin: d.top, yMax, z: zFront, ...brick },
    { name: "back_backed_bricks", face: "front", xMin: -COTTAGE.halfWidth, xMax: COTTAGE.halfWidth, yMin, yMax, z: -COTTAGE.halfDepth, ...brick },
    { name: "left_backed_bricks", face: "left", x: -COTTAGE.halfWidth, xMin: -COTTAGE.halfDepth, xMax: COTTAGE.halfDepth, yMin, yMax, ...brick },
    { name: "right_backed_bricks", face: "right", x: COTTAGE.halfWidth, xMin: -COTTAGE.halfDepth, xMax: COTTAGE.halfDepth, yMin, yMax, ...brick }
  ],
  openings: []
});

export const ENTRANCE_TRIM = Object.freeze([]);
export const OUTSIDE_DETAIL_BLOCKS = Object.freeze([
  { color: C.darkWood, p: [1.75, 3.82, -0.65], s: [0.48, 0.78, 0.48], mode: "wood" },
  { color: C.leafVine, p: [-3.18, 1.62, zFront + 0.08], s: [0.14, 1.28, 0.08], mode: "leaf" },
  { color: C.leafVine, p: [-2.72, 2.05, zFront + 0.09], s: [0.8, 0.13, 0.08], mode: "leaf" },
  { color: 0x8a552b, p: [2.75, 0.28, -2.74], s: [0.42, 0.42, 0.42], mode: "wood" },
  { color: 0xcdbb94, p: [0, d.bottom + 0.006, zFront + 0.16], s: [d.halfWidth * 2 + 0.2, 0.018, 0.18], mode: "rock" }
]);
