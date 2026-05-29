// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/DefaultMerkavaHost.js';
let text = fs.readFileSync(file, 'utf8');
const oldLine = "      if (node.op === 'superConstructor') return scope.super || null;";
const newLine = `      if (node.op === 'superConstructor') {
        const superClass = scope.__class?.superClass || scope.super?.__class || null;
        const args = (node.args || []).map(arg => interpretNode(arg, scope, depth + 1));
        if (!superClass || !scope.this) return scope.super || null;
        const parent = newInstance(superClass, args);
        for (const [key, value] of Object.entries(parent || {})) {
          if (!['__kind', '__class', '__selfClass', 'fields'].includes(key)) scope.this[key] = value;
        }
        if (parent?.fields) Object.assign(scope.this.fields || (scope.this.fields = {}), parent.fields);
        return scope.this;
      }`;
if (!text.includes(oldLine)) throw new Error('superConstructor line not found');
text = text.replace(oldLine, newLine);
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, hasSuperMerge: text.includes('const parent = newInstance(superClass, args)') }, null, 2));
