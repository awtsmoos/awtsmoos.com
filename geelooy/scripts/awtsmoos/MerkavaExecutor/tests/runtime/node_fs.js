// B"H
const before = fs.existsSync('/tmp/input.txt');
fs.writeFileSync('/tmp/output.txt', fs.readFileSync('/tmp/input.txt') + ' processed');
console.log('node fs test', before, fs.existsSync('/tmp/output.txt'));
