// B"H
const TEXTURE_BASE = '/games/mitzvahWorld/assets/textures/';
const HALF = 'https://awtsmoos-docs-base.web.app/half-resolution/';

export const HOUSE_TEXTURE_URLS = {
  brick: [`${TEXTURE_BASE}brick-wall.svg`],
  gold: [`${TEXTURE_BASE}gold-coin.svg`],
  wood: [`${HALF}tree%20bark%201.png`]
};

/** HouseAssets: public texture URLs first; fallback canvases only if a URL cannot load. */
export async function loadHouseAssets(loadFirstImage) {
  const [brick, gold, wood] = await Promise.all([
    loadFirstImage(HOUSE_TEXTURE_URLS.brick, 1800),
    loadFirstImage(HOUSE_TEXTURE_URLS.gold, 1800),
    loadFirstImage(HOUSE_TEXTURE_URLS.wood, 1400)
  ]);
  return {
    brickImage: tag(brick || brickCanvas(), 'brick'),
    goldImage: tag(gold || goldCanvas(), 'gold'),
    woodImage: tag(wood || woodCanvas(), 'wood'),
    lavaImage: tag(lavaCanvas(), 'lava'),
    publicUrls: publicTextureUrls()
  };
}
export function publicTextureUrls(origin = location.origin) {
  return { brick: `${origin}${TEXTURE_BASE}brick-wall.svg`, gold: `${origin}${TEXTURE_BASE}gold-coin.svg`, wood: `${HALF}tree%20bark%201.png` };
}
function tag(img, kind) { if (img?.dataset) img.dataset.kind = img.dataset.kind || kind; return img; }
function brickCanvas(size = 512) {
  const c = canvas(size, 'generated-brick-wall-canvas'), g = c.getContext('2d');
  g.fillStyle = '#6e3d31'; g.fillRect(0, 0, size, size); const h = 44, w = 112;
  for (let y = -h; y < size + h; y += h) for (let x = ((y / h) & 1) ? -w / 2 : 0; x < size + w; x += w) { g.fillStyle = '#b75b41'; round(g, x + 4, y + 4, w - 8, h - 8, 5); g.fill(); g.strokeStyle = '#2c201d'; g.lineWidth = 3; g.stroke(); }
  c.dataset.kind = 'brick-fallback'; return c;
}
function goldCanvas(size = 512) {
  const c = canvas(size, 'generated-gold-coin-canvas'), g = c.getContext('2d');
  const grd = g.createRadialGradient(size*.35, size*.25, 20, size*.5, size*.5, size*.48); grd.addColorStop(0, '#fff7a8'); grd.addColorStop(.35, '#ffd84a'); grd.addColorStop(1, '#7a4a08');
  g.fillStyle = grd; g.beginPath(); g.arc(size/2, size/2, size*.43, 0, Math.PI*2); g.fill(); c.dataset.kind = 'gold-fallback'; return c;
}
function woodCanvas(size = 512) {
  const c = canvas(size, 'generated-wood-door-canvas'), g = c.getContext('2d'); const grd = g.createLinearGradient(0, 0, size, 0); grd.addColorStop(0, '#5f341a'); grd.addColorStop(.5, '#a26330'); grd.addColorStop(1, '#44230f'); g.fillStyle = grd; g.fillRect(0, 0, size, size); c.dataset.kind = 'wood-fallback'; return c;
}
export function lavaCanvas(size = 512) {
  const c = canvas(size, 'generated-lava-canvas'), g = c.getContext('2d'); g.fillStyle = '#2b0700'; g.fillRect(0, 0, size, size);
  for (let i = 0; i < 140; i++) { const x = (i * 97) % size, y = (i * 53) % size, r = 22 + (i % 7) * 9, grd = g.createRadialGradient(x, y, 0, x, y, r); grd.addColorStop(0, '#fff06a'); grd.addColorStop(.25, '#ff7b16'); grd.addColorStop(1, 'rgba(120,0,0,0)'); g.fillStyle = grd; g.fillRect(x - r, y - r, r * 2, r * 2); }
  c.dataset.kind = 'lava'; return c;
}
function canvas(size, url) { const c = document.createElement('canvas'); c.width = c.height = size; c.dataset.url = url; return c; }
function round(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }
