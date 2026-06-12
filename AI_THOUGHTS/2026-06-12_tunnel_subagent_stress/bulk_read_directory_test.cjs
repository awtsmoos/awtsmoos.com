// B"H
const path = require('path');
const home = process.env.USERPROFILE || process.env.HOME;
const installed = path.join(home, '.awtsmoos-tunnel', 'tools', 'fs', 'bulkRead.js');
const { readBulk } = require(installed);

async function main() {
  const config = {
    root: process.cwd(),
    tools: { fsBulk: true, fsRead: true },
    allowSecrets: true
  };
  const first = await readBulk(config, {
    p: 'geelooy/apps/tunnel/agent/lib',
    pageSize: 2,
    maxFiles: 2,
    maxChars: 500,
    totalMaxChars: 900,
    depth: 1
  });
  const second = first.nextPagePayload ? await readBulk(config, first.nextPagePayload) : null;
  console.log(JSON.stringify({
    first: { requestedCount: first.requestedCount, returnedCount: first.returnedCount, partial: first.partial, nextCursor: first.nextCursor, order: first.order },
    second: second && { returnedCount: second.returnedCount, cursor: second.cursor, order: second.order }
  }, null, 2));
  if (first.requestedCount < 2 || first.returnedCount !== 2 || !first.nextPagePayload) process.exit(2);
  if (!second || second.cursor !== first.nextCursor || second.returnedCount < 1) process.exit(3);
}
main().catch(error => { console.error(error.stack || error.message); process.exit(1); });
