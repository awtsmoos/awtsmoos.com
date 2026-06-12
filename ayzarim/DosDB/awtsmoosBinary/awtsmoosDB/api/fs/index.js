// B"H
/**
 * @file api/fs/index.js
 * @chapter The Broken Tree Was Replaced By The Indexed Covenant
 * @description
 * Public AwtsmoosDB filesystem entrypoint. The historical API is preserved, but
 * internals now use VirtualFs v3: inode/path/children indexes with exact byte
 * storage and legacy `__fs__` read fallback.
 */

module.exports = require("./v3/VirtualFs");
