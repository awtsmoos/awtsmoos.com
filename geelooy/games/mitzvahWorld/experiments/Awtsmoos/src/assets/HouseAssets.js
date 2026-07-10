// B"H
const HALF = 'https://awtsmoos-docs-base.web.app/half-resolution/';
export const HOUSE_TEXTURE_URLS = {
  stone: [`${HALF}stone%201.png`],
  wood: [`${HALF}tree%20bark%201.png`],
  grassDirt: [`${HALF}dirt%20grass%202.png`]
};

/** HouseAssets: public texture attempts first, then generated brick/wood/lava canvases. */
export async function loadHouseAssets(loadFirstImage) {
  const [stone, wood] = await Promise.all([loadFirstImage(HOUSE_TEXTURE_URLS.stone, 1400), loadFirstImage(HOUSE_TEXTURE_URLS.wood, 1400)]);
  return { brickImage: stone || brickCanvas(), woodImage: wood || woodCanvas(), lavaImage: lavaCanvas() };
}
export function brickCanvas(size = 512) {
  const c = canvas(size, 'generated-brick-wall-canvas'), g = c.getContext('2d');
  g.fillStyle = '#5b372b'; g.fillRect(0, 0, size, size);
  const h = 42, w = 104;
  for (let y = 0; y < size + h; y += h) for (let x = (y / h) % 2 ? -w / 2 : 0; x < size + w; x += w) {
    const jitter = ((x * 13 + y * 7) % 31) / 31;
    g.fillStyle = `rgb(${120 + jitter * 46},${58 + jitter * 24},${38 + jitter * 16})`;
    round(g, x + 3, y + 3, w - 7, h - 7, 5); g.fill();
  }
  g.strokeStyle = '#2d211d'; g.lineWidth = 3; for (let y = 0; y < size; y += h) { g.beginPath(); g.moveTo(0, y); g.lineTo(size, y); g.stroke(); }
  return c;
}
export function woodCanvas(size = 512) {
  const c = canvas(size, 'generated-wood-door-canvas'), g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, size, 0); grd.addColorStop(0, '#4f2b16'); grd.addColorStop(.5, '#8b5228'); grd.addColorStop(1, '#3d210f'); g.fillStyle = grd; g.fillRect(0, 0, size, size);
  g.strokeStyle = 'rgba(255,210,130,.18)'; g.lineWidth = 5; for (let x = 28; x < size; x += 58) { g.beginPath(); g.moveTo(x, 0); for (let y = 0; y < size; y += 30) g.lineTo(x + Math.sin(y * .035 + x) * 9, y); g.stroke(); }
  return c;
}
export function lavaCanvas(size = 512) {
  const c = canvas(size, 'generated-lava-canvas'), g = c.getContext('2d'); g.fillStyle = '#2b0700'; g.fillRect(0, 0, size, size);
  for (let i = 0; i < 120; i++) { const x = (i * 97) % size, y = (i * 53) % size, r = 22 + (i % 7) * 9, grd = g.createRadialGradient(x, y, 0, x, y, r); grd.addColorStop(0, '#fff06a'); grd.addColorStop(.25, '#ff7b16'); grd.addColorStop(1, 'rgba(120,0,0,0)'); g.fillStyle = grd; g.fillRect(x - r, y - r, r * 2, r * 2); }
  return c;
}
function canvas(size, url) { const c = document.createElement('canvas'); c.width = c.height = size; c.dataset.url = url; return c; }
function round(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }
