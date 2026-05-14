
// B"H

/**
 * @file test/lightning/sourceScaler/index.js
 * @chapter The Scale Of Mercy
 * @description
 * Applies source rewrites for lightning suite mode.
 * This does not change the real tests on disk.
 */

const path = require('path');
const rules = require('./rules/index.js');

/**
 * @class SourceScaler
 * @description
 * Data-driven source transformer.
 */
class SourceScaler {
  /**
   * @method keyFor
   * @description Resolves the test rule key.
   * @param {string} scriptPath - Absolute test path.
   * @returns {string} Rule key.
   */
  keyFor(scriptPath) {
    return path.basename(scriptPath, '.js');
  }

  /**
   * @method transform
   * @description Applies all configured rules.
   * @param {string} scriptPath - Absolute script path.
   * @param {string} source - Original source.
   * @returns {string} Transformed source.
   */
  transform(scriptPath, source) {
    const list = rules[this.keyFor(scriptPath)] || [];
    let out = source;

    for (const [pattern, replacement] of list) {
      out = out.replace(pattern, replacement);
    }

    return this.syncify(out);
  }

  /**
   * @method syncify
   * @description
   * Converts legacy async test syntax into synchronous lightning syntax. The
   * database API used by these tests is synchronous; leaving `await` in place
   * makes tests continue after the runner has already cleaned their files.
   *
   * @param {string} source - Test source.
   * @returns {string} Synchronous source.
   */
  syncify(source) {
    return source
      .replace(/\bfor\s+await\s*\(/g, 'for (')
      .replace(/\basync\s+function\b/g, 'function')
      .replace(/\basync\s+(\([^)]*\)\s*=>)/g, '$1')
      .replace(/\basync\s+([A-Za-z_$][\w$]*\s*=>)/g, '$1')
      .replace(/\bawait\s+/g, '')
      .replace(
        /(run(?:Test|Suite|Simulation)\(\))\.catch\([^;]*\);/g,
        '$1;'
      );
  }
}

module.exports = new SourceScaler();
