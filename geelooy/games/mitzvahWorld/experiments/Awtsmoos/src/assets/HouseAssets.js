// B"H
import { TEXTURE_PURPOSES, TEXTURE_URLS, publicTextureUrls } from './TextureCatalog.js';

/** HouseAssets: public Firebase textures, gathered into one named game bundle. */
export async function loadHouseAssets(loadFirstImage) {
  const entries = await Promise.all([
    one(loadFirstImage, 'whiteBrickImage', TEXTURE_PURPOSES.houseWall, 'white-brick-house-wall'),
    one(loadFirstImage, 'redBrickImage', TEXTURE_PURPOSES.lavaPlatform, 'red-brick-lava-platform'),
    one(loadFirstImage, 'redBrick1Image', TEXTURE_URLS.bricks.red1, 'red-brick-variant-1'),
    one(loadFirstImage, 'redBrick2Image', TEXTURE_URLS.bricks.red2, 'red-brick-variant-2'),
    one(loadFirstImage, 'yellowBrickImage', TEXTURE_PURPOSES.road, 'yellow-brick-road'),
    one(loadFirstImage, 'goldImage', TEXTURE_PURPOSES.coin, 'gold-coin'),
    one(loadFirstImage, 'stoneImage', TEXTURE_PURPOSES.houseFloor, 'stone-house-floor'),
    one(loadFirstImage, 'woodImage', TEXTURE_PURPOSES.houseDoor, 'wood-door-roof'),
    one(loadFirstImage, 'dirt1Image', TEXTURE_URLS.terrain.dirt1, 'terrain-dirt-1'),
    one(loadFirstImage, 'dirt2Image', TEXTURE_URLS.terrain.dirt2, 'terrain-dirt-2'),
    one(loadFirstImage, 'dirtGrass1Image', TEXTURE_URLS.terrain.dirtGrass1, 'terrain-dirt-grass-1'),
    one(loadFirstImage, 'dirtGrass2Image', TEXTURE_URLS.terrain.dirtGrass2, 'terrain-dirt-grass-2'),
    one(loadFirstImage, 'terrainMixImage', TEXTURE_URLS.terrain.dirtGrass3, 'terrain-dirt-grass-3')
  ]);
  const assets = Object.fromEntries(entries);
  assets.brickImage = assets.whiteBrickImage;
  assets.terrainDirtImages = [assets.dirt1Image, assets.dirt2Image, assets.dirtGrass1Image, assets.dirtGrass2Image, assets.terrainMixImage];
  assets.lavaImage = lavaCanvas();
  assets.publicUrls = publicTextureUrls();
  return assets;
}
async function one(loadFirstImage, key, url, kind) { const image = await loadFirstImage([url], 9000); return [key, tag(image || fallbackCanvas(kind, url), kind, url)]; }
function tag(img, kind, url) { if (!img?.dataset) return img; img.dataset.kind = kind; img.dataset.url = img.src || img.dataset.url || url; img.dataset.publicUrl = url; img.dataset.loadedFromPublicUrl = img.src === url ? 'true' : 'false'; return img; }
function fallbackCanvas(kind, url, size = 256) { const c = document.createElement('canvas'), g = c.getContext('2d'); c.width = c.height = size; c.dataset.url = url; c.dataset.fallback = 'true'; g.fillStyle = kind.includes('gold') ? '#ffd84a' : kind.includes('red') ? '#b65a3e' : kind.includes('yellow') ? '#d6b63f' : kind.includes('stone') ? '#8b8677' : kind.includes('dirt') ? '#7b603e' : '#d8d0bd'; g.fillRect(0, 0, size, size); return c; }
export function lavaCanvas(size = 512) { const c = document.createElement('canvas'), g = c.getContext('2d'); c.width = c.height = size; c.dataset.url = 'generated-lava-canvas'; c.dataset.kind = 'lava'; g.fillStyle = '#2b0700'; g.fillRect(0, 0, size, size); for (let i = 0; i < 140; i++) { const x = (i * 97) % size, y = (i * 53) % size, r = 22 + (i % 7) * 9, grd = g.createRadialGradient(x, y, 0, x, y, r); grd.addColorStop(0, '#fff06a'); grd.addColorStop(.25, '#ff7b16'); grd.addColorStop(1, 'rgba(120,0,0,0)'); g.fillStyle = grd; g.fillRect(x - r, y - r, r * 2, r * 2); } return c; }
