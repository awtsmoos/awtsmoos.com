// B"H
/**
 * @file index.js
 * @description
 * Chapter 44: The village is no longer one scroll but a choir.
 * Each section speaks one responsibility, and this composer merges them into
 * the plain JSON level shape the engine already understands.
 */
import meta from "./meta.js";
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
  nivrayim: mergeSections([sky, terrain, player, path, houses, trees, foliage, guide])
};
