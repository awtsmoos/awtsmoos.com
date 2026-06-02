// B"H
/**
 * WebGL witness: the Awtsmoos makes invisible GPU state legible. The cube now
 * carries unmistakable rainbow faces, not merely a golden wireframe, so MiniMax
 * can see texture/program/draw state with its eyes.
 */
export function paintWebgl(fb, texture, box) {
  const commands = texture.commands || [];
  fb.fillRect(box.x, box.y, box.w, box.h, clearColor(commands));
  grid(fb, box);
  badge(fb, box.x + 8, box.y + 8, 'GPU', [35, 55, 105, 235]);
  badge(fb, box.x + box.w - 66, box.y + 8, `DRAW${drawCount(commands)}`, [65, 40, 120, 235]);
  fb.drawText('WEBGL CUBE', box.x + 68, box.y + 10, [255, 255, 255, 255], 1, Math.max(74, box.w - 144));
  cube(fb, { x: box.x + 22, y: box.y + 40, w: box.w - 44, h: Math.max(74, box.h - 96) }, hasTexture(commands));
  swatches(fb, box);
}

function clearColor(commands) {
  let c = [35, 20, 120, 255];
  for (const cmd of commands) if (cmd.op === 'webgl.clearColor' && Array.isArray(cmd.value)) c = cmd.value.slice(0, 3).map(v => Math.round(Number(v) * 255)).concat(255);
  return c;
}

function hasTexture(commands) {
  return commands.some(c => /texImage|bindTexture|activeTexture|texParameteri|generateMipmap/i.test(c.op || ''));
}

function drawCount(commands) {
  return Math.max(1, commands.filter(c => String(c.op || '').includes('draw')).length);
}

function grid(fb, box) {
  for (let x = box.x + 18; x < box.x + box.w; x += 32) fb.drawLine(x, box.y, x, box.y + box.h, [120, 85, 200, 55], 1);
  for (let y = box.y + 18; y < box.y + box.h; y += 32) fb.drawLine(box.x, y, box.x + box.w, y, [120, 85, 200, 55], 1);
}

function badge(fb, x, y, label, fill) {
  fb.fillRect(x, y, 58, 22, fill);
  fb.strokeRect(x, y, 58, 22, [126, 220, 255, 255], 1);
  fb.drawText(String(label), x + 5, y + 6, [255, 255, 255, 255], 1, 50);
}

function cube(fb, box, textured) {
  const size = Math.max(44, Math.min(box.w * 0.46, box.h * 0.72));
  const d = Math.max(22, size * 0.42);
  const cx = box.x + box.w * 0.45;
  const cy = box.y + box.h * 0.58;
  const f = [[cx - size / 2, cy - size / 2], [cx + size / 2, cy - size / 2], [cx + size / 2, cy + size / 2], [cx - size / 2, cy + size / 2]];
  const b = f.map(([x, y]) => [x + d, y - d]);
  fillPoly(fb, f, textured ? [255, 0, 180, 230] : [88, 24, 170, 220]);
  fillPoly(fb, [f[1], b[1], b[2], f[2]], [0, 230, 255, 210]);
  fillPoly(fb, [f[0], f[1], b[1], b[0]], [255, 235, 20, 210]);
  fillPoly(fb, [f[3], f[2], b[2], b[3]], [0, 255, 90, 150]);
  fb.fillRect(f[0][0] + 6, f[0][1] + 6, size * 0.28, size * 0.28, [255, 255, 0, 210]);
  fb.fillRect(f[0][0] + size * 0.38, f[0][1] + 6, size * 0.28, size * 0.28, [0, 255, 255, 210]);
  fb.fillRect(f[0][0] + size * 0.2, f[0][1] + size * 0.45, size * 0.38, size * 0.28, [255, 80, 0, 210]);
  drawLoop(fb, f, [245, 245, 245, 255], 3);
  drawLoop(fb, b, [0, 225, 255, 255], 3);
  for (let i = 0; i < 4; i++) fb.drawLine(f[i][0], f[i][1], b[i][0], b[i][1], [255, 255, 255, 220], 2);
}

function swatches(fb, box) {
  const colors = [[255, 0, 0, 255], [255, 230, 0, 255], [0, 255, 90, 255], [0, 210, 255, 255], [70, 80, 255, 255], [255, 0, 255, 255]];
  const size = Math.max(12, Math.min(18, Math.floor((box.w - 62) / 9)));
  const x = box.x + 46, y = box.y + box.h - 28;
  fb.drawText('TEX', box.x + 10, y + 4, [255, 255, 255, 255], 1, 30);
  colors.forEach((color, i) => fb.fillRect(x + i * (size + 4), y, size, size, color));
  fb.strokeRect(x - 2, y - 2, colors.length * (size + 4) + 2, size + 4, [255, 255, 255, 180], 1);
}

function drawLoop(fb, pts, color, width) {
  for (let i = 0; i < pts.length; i++) fb.drawLine(pts[i][0], pts[i][1], pts[(i + 1) % pts.length][0], pts[(i + 1) % pts.length][1], color, width);
}

function fillPoly(fb, pts, color) {
  const minY = Math.floor(Math.min(...pts.map(p => p[1]))), maxY = Math.ceil(Math.max(...pts.map(p => p[1])));
  for (let y = minY; y <= maxY; y++) for (const [a, b] of pairs(intersections(pts, y))) fb.fillRect(a, y, Math.max(0, b - a), 1, color);
}

function intersections(pts, y) {
  const xs = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
  }
  return xs.sort((a, b) => a - b);
}

function pairs(xs) {
  const out = [];
  for (let i = 0; i + 1 < xs.length; i += 2) out.push([xs[i], xs[i + 1]]);
  return out;
}
