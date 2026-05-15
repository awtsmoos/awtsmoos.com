
// B"H

/**
 * @file test/lightning/moduleRunner/index.js
 * @chapter The Forkless Runner
 * @description
 * Runs tests in-process.
 * Heavy tests go through compact lightning suites.
 * Regular tests compile normally.
 */

const path = require('path');
const fastSuites = require('../fastSuites/index.js');
const readSource = require('./readSource.js');
const compileModule = require('./compileModule.js');

/**
 * @class ModuleRunner
 * @description
 * In-process test executor.
 */
class ModuleRunner {
  /**
   * @method run
   * @description Runs one test file.
   * @param {string} scriptPath - Absolute test script path.
   * @returns {*}
   */
  run(scriptPath) {
    const name = path.basename(scriptPath);

    if (fastSuites.has(name)) {
      fastSuites.run(name);
      return;
    }

    return compileModule(scriptPath, readSource(scriptPath));
  }
}

module.exports = new ModuleRunner();
