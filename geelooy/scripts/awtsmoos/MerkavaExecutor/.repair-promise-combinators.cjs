// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/DefaultMerkavaHost.js';
let text = fs.readFileSync(file, 'utf8');
const oldLine = "const nativePromise = { resolve: value => makeSyncPromise(value), reject: reason => { throw reason; } };";
const newLine = "const unwrapPromiseValue = value => value && value.__kind === 'syncPromise' ? value.value : value;\n  const nativePromise = { resolve: value => makeSyncPromise(value), reject: reason => { throw reason; }, all: values => makeSyncPromise(Array.from(values || []).map(unwrapPromiseValue)), race: values => makeSyncPromise(Array.from(values || []).map(unwrapPromiseValue)[0]) };";
if (!text.includes(oldLine)) throw new Error('nativePromise line not found');
text = text.replace(oldLine, newLine);
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, hasAll: text.includes('all: values'), hasRace: text.includes('race: values') }, null, 2));
