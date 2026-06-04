// B"H
/**
 * @file index.js
 * @description
 * Chapter 52: The composed village gathers camera, cottage, sky, grass, path,
 * guide, and terrain into one plain JSON body. The Awtsmoos remains modular;
 * the engine receives the familiar level shape.
 */
import meta from "./meta.js";
import camera from "./sections/camera.js";
import player from "./sections/player.js";
import terrain from "./sections/terrain.js";
import sky from "./sections/sky.js";
import trees from "./sections/trees.js";
import path from "./sections/path.js";
import foliage from "./sections/foliage.js";
import houses from "./sections/houses.js";
import guide from "./sections/guide.js";

function mergeSections(sections) {
  const nivrayim = {};
  for (const section of sections) {
    for (const [type, rows] of Object.entries(section)) nivrayim[type] = [...(nivrayim[type] || []), ...rows];
  }
  return nivrayim;
}

export default {
  ...meta,
  nivrayim: mergeSections([camera, sky, terrain, player, path, houses, trees, foliage, guide])
};
