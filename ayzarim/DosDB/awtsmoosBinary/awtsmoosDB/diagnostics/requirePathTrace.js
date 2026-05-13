
// B"H

/**
 * @file diagnostics/requirePathTrace.js
 * @chapter The Broken Staircase Was Removed
 * @description
 * Previous failure:
 *
 * api/liveHandle/reader/hydrator/index.js required ../../../constants.js
 *
 * But that path resolves to:
 * api/constants.js
 *
 * Correct root path from hydrator/index.js would be:
 * ../../../../constants.js
 *
 * Permanent fix:
 * Hydrator now uses api/liveHandle/reader/hydrator/root.js, which loads
 * utils/rootRequire.js. Deep files require root modules by name, not by fragile
 * parent-folder counting.
 */

module.exports = {
  brokenRequire: '../../../constants.js',
  correctRequire: '../../../../constants.js',
  permanentFix: 'utils/rootRequire.js'
};
