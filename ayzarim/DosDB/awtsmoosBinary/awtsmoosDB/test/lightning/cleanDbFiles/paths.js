
// B"H

/**
 * @file test/lightning/cleanDbFiles/paths.js
 * @chapter The Places Where Test Worlds Fall
 * @description
 * Cleanup targets for database artifacts and lightning temp worlds.
 */

const path = require('path');

const ROOT = path.join(__dirname, '..', '..', '..');
const TEST_DIR = path.join(ROOT, 'test');
const LIGHTNING_TMP = path.join(TEST_DIR, '.lightning_tmp');

module.exports = {
  ROOT,
  TEST_DIR,
  LIGHTNING_TMP
};
