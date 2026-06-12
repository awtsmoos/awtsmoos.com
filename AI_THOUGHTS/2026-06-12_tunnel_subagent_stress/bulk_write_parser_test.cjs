// B"H
const path = require('path');
const home = process.env.USERPROFILE || process.env.HOME;
const installed = path.join(home, '.awtsmoos-tunnel', 'tools', 'fs', 'readWrite.js');
const { normalizeWrites } = require(installed);
const payload = {
  content: JSON.stringify({
    writes: [
      { path: 'AI_THOUGHTS/2026-06-12_tunnel_subagent_stress/bulk_write_probe_a.txt', content: 'A' },
      { path: 'AI_THOUGHTS/2026-06-12_tunnel_subagent_stress/bulk_write_probe_b.txt', content: 'B' }
    ]
  })
};
const writes = normalizeWrites(payload);
console.log(JSON.stringify(writes, null, 2));
if (writes.length !== 2) process.exit(2);
