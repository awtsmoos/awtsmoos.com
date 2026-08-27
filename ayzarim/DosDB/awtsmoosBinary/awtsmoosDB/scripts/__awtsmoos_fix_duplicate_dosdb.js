// B"H
const fs = require('fs');
const p = 'api/dosdb/index.js';
let s = fs.readFileSync(p, 'utf8');
s = s.replace("const constants = require('../../constants.js');\nconst constants = require('../../constants.js');", "const constants = require('../../constants.js');");
fs.writeFileSync(p, s);
console.log('fixed duplicate dosdb constants require');
