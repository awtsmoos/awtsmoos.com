// B"H
const fs = require('fs');
console.log('exists=' + fs.existsSync('../samples/app.js'));
console.log('text=' + fs.readFileSync('../samples/app.js', 'utf8').slice(0, 20));
console.log('size=' + fs.statSync('../samples/app.js').size);
console.log('dir=' + fs.readdirSync('../samples').filter(x => x.endsWith('.js')).length);
