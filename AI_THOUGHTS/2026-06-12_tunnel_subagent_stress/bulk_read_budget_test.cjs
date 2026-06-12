// B"H
const path = require('path');
const home = process.env.USERPROFILE || process.env.HOME;
const installed = path.join(home, '.awtsmoos-tunnel', 'tools', 'fs', 'bulkRead.js');
const { readBulk } = require(installed);

async function main() {
  const config = { root: process.cwd(), tools: { fsBulk: true, fsRead: true }, allowSecrets: true };
  const result = await readBulk(config, {
    p: 'geelooy/apps/tunnel/agent/lib',
    pageSize: 10,
    maxChars: 300,
    totalMaxChars: 550,
    depth: 1
  });
  console.log(JSON.stringify({ requestedCount: result.requestedCount, returnedCount: result.returnedCount, usedChars: result.usedChars, partial: result.partial, nextCursor: result.nextCursor, order: result.order }, null, 2));
  if (result.requestedCount < 3 || result.returnedCount < 1 || !result.partial || !result.nextPagePayload) process.exit(2);
}
main().catch(error => { console.error(error.stack || error.message); process.exit(1); });
