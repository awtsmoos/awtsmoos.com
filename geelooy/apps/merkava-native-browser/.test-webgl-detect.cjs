// B"H
const fs=require('fs');
const src=fs.readFileSync('samples/app.js','utf8').replace(/\s+/g,' ');
console.log(JSON.stringify({
  hasWebgl: /getContext\(['\"]webgl['\"]\)/.test(src),
  clear: src.match(/clearColor\s*\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*\)/)?.slice(1,5),
  draw: src.match(/drawArrays\s*\(\s*[^,]+\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)/)?.slice(1,3)
},null,2));
