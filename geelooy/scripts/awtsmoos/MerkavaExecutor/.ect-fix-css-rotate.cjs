// B"H
const fs = require("fs");

const file = "app/compiler/css-compiler.js";
let text = fs.readFileSync(file, "utf8");
text = text.replace(
  'stops.push({ stop: stopId(ns.trim(stop.value)), decls: encoded });',
  'stops.push({ stop: stopId(ns.trim(stop.value)), rawDecls: decls, decls: encoded });'
);
text = text.replace(
  /    const rotate = rotateKeyframesPhrase\(name, stops\);\s*\n    if \(rotate\) return \[rotate\];\s*\n    const rotate = rotateKeyframesPhrase\(name, stops\);\s*\n    if \(rotate\) return \[rotate\];/,
  '    const rotate = rotateKeyframesPhrase(name, stops);\n    if (rotate) return [rotate];'
);
fs.writeFileSync(file, text);
console.log("fixed css rotate compiler bytes", Buffer.byteLength(text));
