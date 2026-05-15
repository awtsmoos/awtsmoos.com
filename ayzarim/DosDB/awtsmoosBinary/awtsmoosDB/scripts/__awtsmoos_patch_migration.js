// B"H
const fs = require('fs');
const p = 'scripts/migrate_dayuh_chadash_full.js';
let s = fs.readFileSync(p, 'utf8');
s = s.replace('Fast mode is now the default: fewer fsyncs, turbo write-behind enabled,', 'Fast mode is now the default: fewer fsyncs, turbo write-behind disabled,');
s = s.replace('node scripts/migrate_dayuh_chadash_full.js --compression true --wal true --turboWrites false', 'node scripts/migrate_dayuh_chadash_full.js --compression true --wal true --turboWrites true');
s = s.replace('turboWrites: true,\n  turboFlushMs: 1000,', 'turboWrites: false,\n  turboFlushMs: 1000,');
fs.writeFileSync(p, s);
console.log('patched migration turbo default off');
