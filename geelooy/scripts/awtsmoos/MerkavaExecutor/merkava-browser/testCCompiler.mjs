// B"H — prove the C compiler: compile the rasterizer's actual edge function
// and a loop from C source to Wasm bytes, run at native speed, verify.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { compileC, instantiateC } = require('./VirtualCCompiler.js');

const src = `
int edge(int ax, int ay, int bx, int by, int px, int py) {
  return (bx - ax) * (py - ay) - (by - ay) * (px - ax);
}
int triArea2(int ax, int ay, int bx, int by, int cx, int cy) {
  return edge(ax, ay, bx, by, cx, cy);
}
int fillCount(int x0, int y0, int x1, int y1) {
  int n = 0;
  for (int y = y0; y <= y1; y = y + 1) {
    for (int x = x0; x <= x1; x = x + 1) {
      n = n + 1;
    }
  }
  return n;
}
float fmix(float a, float b, float t) {
  return a + (b - a) * t;
}
`;

const t0 = Date.now();
const { bytes, functions } = compileC(src);
const compileMs = Date.now() - t0;
console.log('compiled', functions.join(','), 'to', bytes.length, 'wasm bytes in', compileMs + 'ms');
console.log('magic ok:', bytes[0] === 0x00 && bytes[1] === 0x61 && bytes[2] === 0x73 && bytes[3] === 0x6D);

const { exports } = await instantiateC(src);
// edge function: the exact math from VirtualGLPipeline.rasterizeTri
const e1 = exports.edge(0, 0, 10, 0, 5, 5);       // (10-0)*(5-0) - (0-0)*(5-0) = 50
const e2 = exports.edge(48, 160, 272, 160, 160, 30); // real triangle numbers
console.log('edge(0,0,10,0,5,5) =', e1, '(expect 50)');
console.log('edge tri =', e2, '(expect -29120)');
console.log('triArea2 =', exports.triArea2(0, 0, 4, 0, 0, 3), '(expect 12)');
console.log('fillCount(0,0,9,9) =', exports.fillCount(0, 0, 9, 9), '(expect 100)');
console.log('fmix(10, 20, 0.25) =', exports.fmix(10, 20, 0.25), '(expect 12.5)');

// speed: 1M edge calls through Wasm vs JS
const N = 1000000;
let t1 = Date.now();
let acc = 0;
for (let i = 0; i < N; i++) acc += exports.edge(0, 0, 10, 0, i % 37, i % 41);
const wasmMs = Date.now() - t1;
t1 = Date.now();
let acc2 = 0;
const jsE = (ax, ay, bx, by, px, py) => (bx - ax) * (py - ay) - (by - ay) * (px - ax);
for (let i = 0; i < N; i++) acc2 += jsE(0, 0, 10, 0, i % 37, i % 41);
const jsMs = Date.now() - t1;
console.log(`1M edge calls: wasm=${wasmMs}ms js=${jsMs}ms acc=${acc} acc2=${acc2} match=${acc === acc2}`);
