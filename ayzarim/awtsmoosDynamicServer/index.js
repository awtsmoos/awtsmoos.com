
// B"H

/**
 * awtsmoosDynamicServer/index.js
 *
 * The large server vessel is now split into smaller focused modules.
 * This file stays as the public require() entry point so existing code
 * keeps working exactly as before.
 */

module.exports = require("./server/AwtsmoosStaticServer.js");
