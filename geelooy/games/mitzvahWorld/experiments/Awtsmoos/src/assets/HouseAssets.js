// B"H
const HALF = 'https://awtsmoos-docs-base.web.app/half-resolution/';
export const HOUSE_TEXTURE_URLS = { wood: [`${HALF}tree%20bark%201.png`] };

/** HouseAssets: walls/floors are true brick canvases; wood still tries the public hosted texture. */
export async function loadHouseAssets(loadFirstImage) {
  const wood = await loadFirstImage(HOUSE_TEXTURE_URLS.wood, 1400);
  return { brickImage: brickCanvas(), woodImage: wood || woodCanvas(), lavaImage: lavaCanvas() };
}
export function brickCanvas(size = 512) {
  const c = canvas(size, 'generated-brick-wall-canvas'), g = c.getContext('2d');
  g.fillStyle = '#6e3d31'; g.fillRect(0, 0, size, size);
  const h = 44, w = 112;
  for (let y = -h; y < size + h; y += h) for (let x = ((y / h) & 1) ? -w / 2 : 0; x < size + w; x += w) {
    const jitter = fract(x * .077 + y * .113), shade = 92 + jitter * 70;
    g.fillStyle = `rgb(${shade + 36},${Math.floor(shade * .48)},${Math.floor(shade * .34)})`;
    round(g, x + 4, y + 4, w - 8, h - 8, 5); g.fill();
    g.strokeStyle = 'rgba(255,205,150,.10)'; g.lineWidth = 2; g.stroke();
  }
  g.strokeStyle = '#2c201d'; g.lineWidth = 5; for (let y = 0; y < size; y += h) { g.beginPath(); g.moveTo(0, y); g.lineTo(size, y); g.stroke(); }
  c.dataset.kind = 'brick'; return c;
}
export function woodCanvas(size = 512) {
  const c = canvas(size, 'generated-wood-door-canvas'), g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, size, 0); grd.addColorStop(0, '#5f341a'); grd.addColorStop(.5, '#a26330'); grd.addColorStop(1, '#44230f'); g.fillStyle = grd; g.fillRect(0, 0, size, size);
  g.strokeStyle = 'rgba(255,222,150,.22)'; g.lineWidth = 5; for (let x = 24; x < size; x += 54) { g.beginPath(); g.moveTo(x, 0); for (let y = 0; y < size; y += 26) g.lineTo(x + Math.sin(y * .035 + x) * 9, y); g.stroke(); }
  c.dataset.kind = 'wood'; return c;
}
export function lavaCanvas(size = 512) {
  const c = canvas(size, 'generated-lava-canvas'), g = c.getContext('2d'); g.fillStyle = '#2b0700'; g.fillRect(0, 0, size, size);
  for (let i = 0; i < 120; i++) { const x = (i * 97) % size, y = (i * 53) % size, r = 22 + (i % 7) * 9, grd = g.createRadialGradient(x, y, 0, x, y, r); grd.addColorStop(0, '#fff06a'); grd.addColorStop(.25, '#ff7b16'); grd.addColorStop(1, 'rgba(120,0,0,0)'); g.fillStyle = grd; g.fillRect(x - r, y - r, r * 2, r * 2); }
  c.dataset.kind = 'lava'; return c;
}
function canvas(size, url) { const c = document.createElement('canvas'); c.width = c.height = size; c.dataset.url = url; return c; }
function round(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }
function fract(n) { return n - Math.floor(n); }
