// B"H

import { ProviderStrategies } from './fs-provider/strategies.js';
import {
  withWorldIdentity,
  getWorldType,
  describeItemForError
} from './fs-provider/identity.js';

/**
 * @file fs-provider.js
 * @description
 * B"H.
 *
 * The universal filesystem gate.
 *
 * Before this repair, a caller could hand the provider a half-born vessel:
 * `{ path: "...", kind: "file", type: undefined }`.
 *
 * Then the provider would look into the strategy map, see nothing, and scream:
 * "The world type 'undefined' has no strategy."
 *
 * Now every operation first receives identity inspection. The error becomes
 * exact, early, and useful. The file tree becomes safer. Git metadata cannot
 * accidentally write with an undefined world.
 *
 * The Awtsmoos gives every creation its letters. This provider now demands
 * that every file item carry its world-letter too.
 */

/**
 * @function joinChildPath
 * @description
 * B"H.
 *
 * Joins a parent path and child name without double-slash chaos.
 *
 * @param {string} parentPath
 * The parent directory path.
 *
 * @param {string} childName
 * The child entry name.
 *
 * @returns {string}
 * The joined path.
 */
function joinChildPath(parentPath, childName) {
  const root = parentPath === "/" ? "" : String(parentPath || "").replace(/\/+$/, "");
  return `${root}/${childName}` || "/";
}

/**
 * @function normalizeListedChild
 * @description
 * B"H.
 *
 * Gives a listed child the same filesystem identity as its parent.
 * Directory listings often return children with only name/kind/path.
 * If the provider identity is not inherited here, later commit, edit, delete,
 * preview, or agent tool actions can lose their world and crash.
 *
 * @param {object} parent
 * The parent item whose provider identity is known.
 *
 * @param {object} child
 * A listed child entry.
 *
 * @returns {object}
 * A child entry with path, type, originalType, and workspaceId preserved.
 */
function normalizeListedChild(parent, child) {
  const parentIdentity = withWorldIdentity(parent, { action: "normalize listed child" });
  const path = child.path || joinChildPath(parentIdentity.path, child.name);

  return {
    ...parentIdentity,
    ...child,
    path,
    type: child.type || child.originalType || parentIdentity.type,
    originalType: child.originalType || child.type || parentIdentity.originalType || parentIdentity.type,
    workspaceId: child.workspaceId || parentIdentity.workspaceId || parentIdentity.id
  };
}

/**
 * @constant {object} FileSystemProvider
 * @description
 * B"H.
 *
 * Public filesystem facade.
 * The strategy modules remain the workers.
 * This object is the judge at the gate.
 */
export const FileSystemProvider = {
  ...ProviderStrategies,

  /**
   * @async
   * @function _execute
   * @description
   * B"H.
   *
   * Executes a provider strategy method after strict identity normalization.
   *
   * @param {string} method
   * Strategy method name: list, read, write, create, delete, etc.
   *
   * @param {object} item
   * Filesystem item.
   *
   * @param {...any} args
   * Additional method arguments.
   *
   * @returns {Promise<any>}
   * Strategy result.
   */
  async _execute(method, item, ...args) {
    const vessel = withWorldIdentity(item, { action: method });
    const type = getWorldType(vessel);
    const worker = ProviderStrategies[type];

    if (!worker) {
      throw new Error(
        `[FileSystemProvider] The world type '${type}' has no strategy for '${method}'. ` +
        `Diagnostic: ${describeItemForError(vessel)}`
      );
    }

    if (typeof worker[method] !== 'function') {
      throw new Error(
        `[FileSystemProvider] The world '${type}' does not support '${method}'. ` +
        `Diagnostic: ${describeItemForError(vessel)}`
      );
    }

    return await worker[method](vessel, ...args);
  },

  /**
   * @async
   * @function list
   * @description
   * B"H.
   *
   * Lists a directory and preserves provider identity on every child.
   *
   * @param {object} item
   * Directory item.
   *
   * @returns {Promise&lt;{entries: object[], isGitRoot: boolean}&gt;}
   * Directory entries and Git-root status.
   */
  async list(item) {
    const vessel = withWorldIdentity(item, { action: "list" });
    const result = await this._execute('list', vessel);
    const children = Array.isArray(result) ? result : (result.entries || []);
    const entries = children.map(child => normalizeListedChild(vessel, child));
    const isGitRoot = entries.some(c => c && c.name === '.awtsmoos-repo');

    return { entries, isGitRoot };
  },

  /**
   * @async
   * @function read
   * @description
   * B"H.
   *
   * Reads a file from its true provider world.
   *
   * @param {object} item
   * File item.
   *
   * @returns {Promise<any>}
   * File content.
   */
  async read(item) {
    return await this._execute('read', item);
  },

  /**
   * @async
   * @function write
   * @description
   * B"H.
   *
   * Writes a file only after the item proves its provider identity.
   *
   * @param {object} item
   * File item.
   *
   * @param {string|Blob|ArrayBuffer|Uint8Array} content
   * Content to write.
   *
   * @param {string} [msg]
   * Optional commit/status message for providers that support it.
   *
   * @param {Function} [onStatus]
   * Optional progress callback.
   *
   * @returns {Promise<any>}
   * Provider result.
   */
  async write(item, content, msg, onStatus) {
    const result = await this._execute('write', item, content, msg, onStatus);
    import('./sync/folder-sync.js').then(m => m.FolderSync.scheduleForItem(item, { reason: 'write' })).catch(() => {});
    return result;
  },

  /**
   * @async
   * @function create
   * @description
   * B"H.
   *
   * Creates a child item under a parent directory.
   *
   * @param {object} parentDir
   * Parent directory item.
   *
   * @param {string} name
   * New child name.
   *
   * @param {string} kind
   * Child kind.
   *
   * @returns {Promise<any>}
   * Provider result.
   */
  async create(parentDir, name, kind) {
    const result = await this._execute('create', parentDir, name, kind);
    import('./sync/folder-sync.js').then(m => m.FolderSync.scheduleForItem(parentDir, { reason: 'create' })).catch(() => {});
    return result;
  },

  /**
   * @async
   * @function delete
   * @description
   * B"H.
   *
   * Deletes an item from its provider world.
   *
   * @param {object} item
   * Item to delete.
   *
   * @returns {Promise<any>}
   * Provider result.
   */
  async delete(item) {
    const result = await this._execute('delete', item);
    import('./sync/folder-sync.js').then(m => m.FolderSync.scheduleForItem(item, { reason: 'delete' })).catch(() => {});
    return result;
  },

  /**
   * @async
   * @function listAllFiles
   * @description
   * B"H.
   *
   * Recursively lists all files while preserving provider identity.
   * Ignores heavy/generated sacred dust: .git, node_modules, .awtsmoos-repo.
   *
   * @param {object} item
   * Root directory item.
   *
   * @returns {Promise&lt;object[]&gt;}
   * All file entries.
   */
  async listAllFiles(item) {
    const root = withWorldIdentity(item, { action: "listAllFiles" });
    const allFiles = [];

    const traverse = async (currentItem) => {
      const current = withWorldIdentity(currentItem, { action: "listAllFiles traverse" });

      try {
        const res = await this.list(current);

        for (const child of res.entries) {
          if (['.git', 'node_modules', '.awtsmoos-repo'].includes(child.name)) continue;

          const fullChild = normalizeListedChild(current, child);

          if (fullChild.kind === 'directory') {
            await traverse(fullChild);
          } else {
            allFiles.push(fullChild);
          }
        }
      } catch (error) {
        console.warn(
          `[FileSystemProvider] Skipped subtree during listAllFiles: ${error.message}`,
          current
        );
      }
    };

    await traverse(root);
    return allFiles;
  },

  /**
   * B"H
   * Executes a semantic capability through the item's real provider world.
   * This keeps AI tooling from hardcoding local vs. hosted vs. relay transports.
   */
  async astOutline(item) {
    return await this._execute('astOutline', item);
  },

  async semanticSearch(item, query, options) {
    return await this._execute('semanticSearch', item, query, options);
  },

  async dependencyGraph(item, options) {
    return await this._execute('dependencyGraph', item, options);
  },

  async connectedFiles(item, options) {
    return await this._execute('connectedFiles', item, options);
  },

  async fileHashes(item, options) {
    return await this._execute('fileHashes', item, options);
  },

  async writeIfHash(item, content, expectedSha256) {
    return await this._execute('writeIfHash', item, content, expectedSha256);
  },

  async replaceRange(item, payload) {
    const result = await this._execute('replaceRange', item, payload);
    import('./sync/folder-sync.js').then(m => m.FolderSync.scheduleForItem(item, { reason: 'replaceRange' })).catch(() => {});
    return result;
  },

  async applyPatch(item, payload) {
    const result = await this._execute('applyPatch', item, payload);
    import('./sync/folder-sync.js').then(m => m.FolderSync.scheduleForItem(item, { reason: 'applyPatch' })).catch(() => {});
    return result;
  }
};