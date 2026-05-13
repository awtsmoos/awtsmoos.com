
// B"H

/**
 * @file test/lightning/moduleRunner.js
 * @chapter The In-Process Gate
 * @description
 * Executes a test file in this same Node process.
 * This removes the huge cost of spawning forty-three Node processes.
 */

const fs = require('fs');
const Module = require('module');
const path = require('path');

/**
 * @function runModuleFile
 * @description
 * Compiles and runs a test file as if Node loaded it directly.
 *
 * @param {string} scriptPath - Absolute test script path.
 * @returns {void}
 */
function runModuleFile(scriptPath) {
  const code = fs.readFileSync(scriptPath, 'utf8');
  const mod = new Module(scriptPath, module.parent);

  mod.filename = scriptPath;
  mod.paths = Module._nodeModulePaths(path.dirname(scriptPath));

  delete require.cache[scriptPath];
  require.cache[scriptPath] = mod;

  mod._compile(code, scriptPath);
}

module.exports = runModuleFile;
