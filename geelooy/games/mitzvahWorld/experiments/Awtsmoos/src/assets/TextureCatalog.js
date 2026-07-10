// B"H
const FULL = 'https://awtsmoos-docs-base.web.app/full-resolution/';
const enc = name => `${FULL}${encodeURIComponent(name)}.png`;

/** TextureCatalog: every public texture URL is named once, then the world can grow. */
export const TEXTURE_URLS = Object.freeze({
  bricks: Object.freeze({ white1: enc('white brick 1'), red1: enc('red brick 1'), red2: enc('red brick 2'), red3: enc('red brick 3'), yellow1: enc('yellow brick 1') }),
  terrain: Object.freeze({ dirt1: enc('dirt 1'), dirt2: enc('dirt 2'), dirtGrass1: enc('dirt grass 1'), dirtGrass2: enc('dirt grass 2'), dirtGrass3: enc('dirt grass 3') }),
  metals: Object.freeze({ gold2: enc('gold 2') }),
  stone: Object.freeze({ stone1: enc('stone 1') }),
  wood: Object.freeze({ bark1: enc('tree bark 1') })
});

export const TEXTURE_PURPOSES = Object.freeze({
  houseWall: TEXTURE_URLS.bricks.white1,
  lavaPlatform: TEXTURE_URLS.bricks.red3,
  lavaPlatformAlt: TEXTURE_URLS.bricks.red2,
  road: TEXTURE_URLS.bricks.yellow1,
  coin: TEXTURE_URLS.metals.gold2,
  terrainMix: TEXTURE_URLS.terrain.dirtGrass3,
  terrainDirtSet: Object.freeze([TEXTURE_URLS.terrain.dirt1, TEXTURE_URLS.terrain.dirt2, TEXTURE_URLS.terrain.dirtGrass1, TEXTURE_URLS.terrain.dirtGrass2, TEXTURE_URLS.terrain.dirtGrass3]),
  houseFloor: TEXTURE_URLS.stone.stone1,
  houseDoor: TEXTURE_URLS.wood.bark1,
  houseRoof: TEXTURE_URLS.wood.bark1
});

export function publicTextureUrls() {
  return JSON.parse(JSON.stringify({ urls: TEXTURE_URLS, purposes: TEXTURE_PURPOSES }));
}
