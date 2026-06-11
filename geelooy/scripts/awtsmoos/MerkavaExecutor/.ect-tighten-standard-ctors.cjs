// B"H
const fs = require("fs");
const path = "app/compiler/js-compiler.js";
let text = fs.readFileSync(path, "utf8");
const oldCtor = '  function ctorId(name, pools) { const id = COMMON_CTORS.indexOf(String(name || "")); return id >= 0 ? id : -(ns.ref(pools.custom, "ctor:" + name) + 1); }';
const newCtor = '  function ctorId(name) { return COMMON_CTORS.indexOf(String(name || "")); }';
if (text.indexOf(oldCtor) < 0) throw new Error("old ctorId not found");
text = text.split(oldCtor).join(newCtor);
const oldLine = '    const out = [ctorId(name, pools), args.length];';
const newLine = '    const ctor = ctorId(name);\n    if (ctor < 0) return null;\n    const out = [ctor, args.length];';
if (text.indexOf(oldLine) < 0) throw new Error("constructor output line not found");
text = text.split(oldLine).join(newLine);
fs.writeFileSync(path, text);
console.log("standard constructor-only phrase", Buffer.byteLength(text));
