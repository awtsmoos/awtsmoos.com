// B"H
/**
 * @file schema.js
 * @chapter The Covenant Of Exact Bytes
 * @description
 * Constants for AwtsmoosDB VirtualFs v3. There are no filesystem blocks and no
 * padding. INLINE_LIMIT only chooses whether bytes live directly in the inode or
 * in the existing exact-length blob store.
 */

const FS_KEY = "__fs3__";
const LEGACY_KEY = "__fs__";
const INLINE_LIMIT = 4096;
const ROOT_PATH = "/";
const ROOT_INODE = "i0";

module.exports = {
  FS_KEY,
  LEGACY_KEY,
  INLINE_LIMIT,
  ROOT_PATH,
  ROOT_INODE
};
