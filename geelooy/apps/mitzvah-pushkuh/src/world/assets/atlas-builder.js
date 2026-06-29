// B"H
// Atlas builder wraps legacy direct sprites and new named lookups together.
import { createAtlas as createLegacyAtlas } from "../atlas.js";
import { createTextureAtlas } from "../render/texture-atlas.js";
export function buildAtlas() {
  const legacy = createLegacyAtlas(), atlas = createTextureAtlas(legacy);
  atlas.add("glow", legacy.glow); atlas.add("burst", legacy.burst); atlas.add("diamond", legacy.diamond); atlas.add("portal", legacy.portal);
  legacy.beams?.forEach((b, i) => atlas.add(`beam${i}`, b));
  return Object.assign(atlas, legacy);
}
