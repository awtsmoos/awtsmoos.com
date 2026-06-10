// B"H
const fs = require('fs');
const files = [
  'index.html',
  'app/forge-core.js',
  'app/forge-ui.js',
  'app/forge.js',
  'app/styles.css'
];
for (const file of files) {
  if (!fs.existsSync(file)) throw new Error(`Missing ${file}`);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes('B"H')) throw new Error(`Missing B"H marker in ${file}`);
  const lines = text.split(/\r?\n/).length;
  if (file.endsWith('.js') && lines > 120) throw new Error(`${file} too long: ${lines}`);
}
const html = fs.readFileSync('index.html', 'utf8');
if (!html.includes('app/forge-core.js')) throw new Error('index missing forge-core.js');
if (!html.includes('app/forge-ui.js')) throw new Error('index missing forge-ui.js');
if (html.includes('type="module"')) throw new Error('index still uses module script');
const ui = fs.readFileSync('app/forge-ui.js', 'utf8');
if (!ui.includes('Virtual DOM Preview')) throw new Error('preview section missing');
if (!ui.includes('Custom Bytecode')) throw new Error('bytecode section missing');
console.log('B"H local smoke ok', files.length);
