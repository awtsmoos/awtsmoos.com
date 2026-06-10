// B"H
/**
 * @file index.js
 * @description
 * Chapter 617: The village source gathers both image and body.
 *
 * The visible homes were present, but the house collider section was not
 * merged into the composed level. The Awtsmoos reveals the missing vessel here:
 * camera, sky, earth, player, path, houses, trees, life, guide, then the hidden
 * wall and fence laws that make the world playable instead of ghostly.
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
import houseColliders from "./sections/VillageHouseCollider.js";
import fenceColliders from "./sections/VillageFenceCollider.js";

function mergeSections(sections) {
  const nivrayim = {};
  for (const section of sections) {
    for (const [type, rows] of Object.entries(section)) {
      nivrayim[type] = [...(nivrayim[type] || []), ...rows];
    }
  }
  return nivrayim;
}

export default {
  ...meta,
  nivrayim: mergeSections([
    camera,
    sky,
    terrain,
    player,
    path,
    houses,
    trees,
    foliage,
    guide,
    { VillageHouseCollider: houseColliders },
    { VillageFenceCollider: fenceColliders }
  ])
};
