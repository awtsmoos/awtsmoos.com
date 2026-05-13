
// B"H

/**
 * @file test/lightning/exitTrap.js
 * @chapter The Door That Does Not Kill The Runner
 * @description
 * In-process tests may call process.exit.
 * This trap turns exit into a catchable signal.
 */

/**
 * @class ExitSignal
 * @description
 * Error-like signal used to stop a test without killing the suite.
 */
class ExitSignal extends Error {
  /**
   * @constructor
   * @param {number} code - Exit code.
   */
  constructor(code) {
    super(`process.exit(${code})`);
    this.name = 'ExitSignal';
    this.code = code;
    this.isExitSignal = true;
  }
}

/**
 * @function install
 * @description
 * Installs process.exit trap.
 *
 * @returns {Function} Restore function.
 */
function install() {
  const original = process.exit;

  process.exit = code => {
    throw new ExitSignal(Number(code || 0));
  };

  return () => {
    process.exit = original;
  };
}

module.exports = {
  install,
  ExitSignal
};
