// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/core/simulateRuntime.js';
let text = fs.readFileSync(file, 'utf8');
text = text.replace('/[()!?|&+-*/%<>=]/.test(plain)', '/[()!?|&+\\-*/%<>=]/.test(plain)');
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, fixed: text.includes('[()!?|&+\\\\-*/%<>=]') || text.includes('[()!?|&+\\-*/%<>=]') }, null, 2));
