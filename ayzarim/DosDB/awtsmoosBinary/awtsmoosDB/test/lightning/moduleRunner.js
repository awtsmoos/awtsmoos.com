
// B"H

/**
 * @file test/lightning/moduleRunner.js
 * @chapter The Old Runner Door
 * @description
 * Compatibility bridge to modular moduleRunner.
 */

const runner = require('./moduleRunner/index.js');

/**
 * @function runModuleFile
 * @description Runs one module path.
 * @param {string} scriptPath - Absolute script path.
 * @returns {void}
 */
function runModuleFile(scriptPath) {
  runner.run(scriptPath);
}

module.exports = runModuleFile;
