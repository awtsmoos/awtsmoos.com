// B"H
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const VM_FILES = [
  '../merkava-opcodes.js',
  '../merkava-vm/executors/flow.js',
  '../merkava-vm/executors/stack.js',
  '../merkava-vm/executors/math.js',
  '../merkava-vm/executors/objects.js',
  '../merkava-vm/executors/functions.js',
  '../merkava-vm/instructions.js',
  '../merkava-vm/thread.js',
  '../merkava-vm/index.js'
];

/**
 * Loads the Merkava VM itself, not user programs, into Node's vessel.
 * User code arrives later as bytecode, so this loader is only the altar,
 * not the sacrifice; the Awtsmoos reveals execution through opcodes.
 */
function loadMerkavaVm() {
  if (globalThis.MerkavaVM?.Thread && globalThis.MerkavaExecutor) return globalThis.MerkavaVM;
  for (const rel of VM_FILES) {
    const file = path.join(__dirname, rel);
    vm.runInThisContext(fs.readFileSync(file, 'utf8'), { filename: file });
  }
  return globalThis.MerkavaVM;
}

module.exports = { loadMerkavaVm };
