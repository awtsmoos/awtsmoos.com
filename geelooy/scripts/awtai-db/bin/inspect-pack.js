#!/usr/bin/env node
// B"H

const { PackReader } = require('../prepack/pack-reader.js');

function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('B\"H usage: node bin/inspect-pack.js PACK.awtpack');
    process.exit(1);
  }
  const reader = new PackReader(file);
  try {
    console.log(JSON.stringify(reader.manifest, null, 2));
  } finally {
    reader.close();
  }
}

main();
