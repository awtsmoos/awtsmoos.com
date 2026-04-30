
// B"H
/**
 * @file api/liveHandle/reader/logic/keys.js
 *
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║   RE-EXPORT BRIDGE — Seder Hishtalshelus (Chain of Emanation)          ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                          ║
 * ║  This file has been split into a proper sub-folder for clarity:         ║
 * ║                                                                          ║
 * ║    keys/                                                                 ║
 * ║     ├── index.js           orchestrator: ANCHOR resolution + dispatch   ║
 * ║     ├── anchorResolver.js  peels ANCHOR(50) to reveal inner type+ptr    ║
 * ║     └── strategyFactory.js maps VAL_TYPE to key-iteration generator     ║
 * ║                                                                          ║
 * ║  This shim ensures every existing require('./logic/keys.js') continues  ║
 * ║  to work without any other changes in the codebase.                     ║
 * ║                                                                          ║
 * ║  "The garments of Torah carry the Torah wherever it needs to go."       ║
 * ║  (Zohar III, 152a)                                                      ║
 * ║                                                                          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

'use strict';

module.exports = require('./keys/index.js');
