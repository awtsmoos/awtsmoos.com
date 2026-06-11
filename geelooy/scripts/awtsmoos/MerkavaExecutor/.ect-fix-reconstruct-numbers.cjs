// B"H
const fs = require("fs");
const path = "app/compiler/reconstructor.js";
let text = fs.readFileSync(path, "utf8");
text = text.replace(
  '  function num(value, ctx) { return value >= 128 ? ctx.pools.num[value - 128] || 0 : value; }',
  '  function num(value, ctx) { if (value >= 128) return ctx.pools.num[value - 128] || 0; if (value >= 64) return commonNum(value - 64); return value; }\n  function commonNum(id) { return "-1 -0.92 -0.5 -0.25 -0.1 -0.01 -0.004 0 0.004 0.01 0.02 0.05 0.1 0.25 0.5 0.75 0.92 1 1.5 1.6 2 2.4 2.5 3 3.14 6.28 10 12 14 16 18 24 28 32 64 72 80 90 100 180 240 320 560".split(" ")[id] || 0; }'
);
fs.writeFileSync(path, text);
console.log("fixed reconstructor numeric decoder", Buffer.byteLength(text));
