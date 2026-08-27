// B"H

/**
 * @file test/run_one.js
 * @chapter The Single Lightning Gate
 * @description
 * Runs exactly one AwtsmoosDB test through the same fast isolation harness used
 * by run_all.js. This lets a repair be verified individually before the full
 * court is summoned.
 */

const runOne = require('./lightning/runOne.js');
const print = require('./lightning/printer.js');
const Timer = require('./lightning/timer.js');

async function main() {
  const test = process.argv[2];
  if (!test) {
    console.error('Usage: node test/run_one.js <test-file.js>');
    process.exit(2);
  }

  print.start();
  const suiteStart = Timer.now();
  print.running(0, 1, test);
  const result = await runOne(test);

  if (result.status !== 0) {
    print.fail(result);
    process.exit(1);
  }

  print.pass(result.elapsed);
  print.victory(1, suiteStart);
}

main().catch(err => {
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});
