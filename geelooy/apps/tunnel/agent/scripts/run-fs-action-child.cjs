#!/usr/bin/env node
// B"H
process.env.AWTSMOOS_ASYNC_CHILD = '1';
const { handleFsAction } = require('../tools/fs/actions.js');
async function main() {
  const encoded = process.argv[2] || '';
  if (!encoded) throw new Error('missing_payload');
  const payload = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));
  const result = await handleFsAction({ ...payload, sync:true, noAutoAsync:true }, null);
  process.stdout.write(JSON.stringify({ BH:'B"H', ok:true, childAction:payload.action, result }, null, 2) + '\n');
}
main().catch(err => {
  process.stderr.write((err && err.stack) ? err.stack : String(err));
  process.exit(1);
});
