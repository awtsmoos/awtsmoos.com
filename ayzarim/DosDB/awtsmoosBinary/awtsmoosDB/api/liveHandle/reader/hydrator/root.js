
// B"H

/**
 * @file api/liveHandle/reader/hydrator/root.js
 * @chapter The Hydrator Finds The Root Without Counting Stairs
 * @description
 * Hydrator modules are deeply nested. They now use one stable root loader
 * instead of fragile ../../../ guesses.
 */

module.exports = require('../../../../utils/rootRequire.js');
