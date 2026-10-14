// B"H — height map → tangent-space normal map converter (Sobel gradients).
// Yaakov 2026-10-13: "There can never be enough textures if they add value.
// Including normals." Better math: derive geometrically-correct normals from
// the existing AI height maps instead of generating approximate ones.
// Usage: node tools/height-to-normal.mjs <in.webp> <out.webp> [strength]
import { execFileSync } from 'node:child_process';

const [input, output, strengthArg] = process.argv.slice(2);
if (!input || !output) {
  console.error('usage: node tools/height-to-normal.mjs <in> <out> [strength=2.0]');
  process.exit(1);
}
const strength = parseFloat(strengthArg || '2.0');

const py = `
import sys
from PIL import Image
import math
inp, outp, s = sys.argv[1], sys.argv[2], float(sys.argv[3])
img = Image.open(inp).convert('L')
w, h = img.size
px = img.load()
nm = Image.new('RGB', (w, h))
op = nm.load()
# Sobel kernels on height -> gradient -> normal. Wrap edges (tiling preserved).
for y in range(h):
    for x in range(w):
        xm, xp = (x - 1) % w, (x + 1) % w
        ym, yp = (y - 1) % h, (y + 1) % h
        gx = (px[xp, ym] + 2*px[xp, y] + px[xp, yp]
            - px[xm, ym] - 2*px[xm, y] - px[xm, yp]) / 255.0
        gy = (px[xm, yp] + 2*px[x, yp] + px[xp, yp]
            - px[xm, ym] - 2*px[x, ym] - px[xp, ym]) / 255.0
        # central differences scaled: normal = normalize(-dh/dx*s, -dh/dy*s, 1)
        nx = -gx * s
        ny = gy * s   # flip Y for three.js (OpenGL convention: +Y up = green up)
        nz = 1.0
        il = 1.0 / math.sqrt(nx*nx + ny*ny + nz*nz)
        op[x, y] = (int((nx*il*0.5+0.5)*255), int((ny*il*0.5+0.5)*255), int((nz*il*0.5+0.5)*255))
nm.save(outp)
print(f'wrote {outp} {w}x{h} strength={s}')
`;
execFileSync('python3', ['-c', py, input, output, String(strength)], { stdio: 'inherit' });
