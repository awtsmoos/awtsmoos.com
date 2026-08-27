// B"H

// FILE: js/git/commit/state.js

import { FileSystemProvider } from '../../fs-provider.js';
import { State } from '../../state.js';
import { MetadataRituals } from './metadata-rituals.js';
import {
  normalizeCommitContext,
  shouldWriteLocalAnchor
} from './commit-context.js';

/**
 * @class CommitState
 * @description
 * B"H.
 *
 * The witness of the rectification.
 *
 * THE POEM OF THE WITNESS:
 * The remote branch receives a new crown,
 * but the local world must not fall down.
 * The tabs must know the dirt is gone,
 * the tree must know the morning dawn.
 *
 * This class updates local memory only after the remote commit has succeeded.
 * It no longer fires after each chunk.
 * It no longer updates the anchor while the commit is still incomplete.
 */
export const CommitState = {
  /**
   * @async
   * @function saveIncremental
   * @description
   * B"H.
   *
   * Backward-compatible name retained for existing imports.
   * Internally this now behaves as a final-save operation.
   *
   * @param {object} gitContextItem
   * Filesystem root/context item.
   *
   * @param {object} gitInfo
   * Git metadata.
   *
   * @param {string} newCommitSHA
   * New remote commit SHA.
   *
   * @param {object[]} processedFiles
   * Uploaded creations/updates.
   *
   * @param {object[]} processedDeletions
   * Deleted files.
   *
   * @param {object[]} treeItems
   * Git tree items used in the commit.
   *
   * @returns {Promise&lt;void&gt;}
   * Resolves after local anchor and dirty-state cleanup.
   */
  async saveIncremental(
    gitContextItem,
    gitInfo,
    newCommitSHA,
    processedFiles = [],
    processedDeletions = [],
    treeItems = []
  ) {
    return await this.saveFinal(
      gitContextItem,
      gitInfo,
      newCommitSHA,
      processedFiles,
      processedDeletions,
      treeItems
    );
  },

  /**
   * @async
   * @function saveFinal
   * @description
   * B"H.
   *
   * Performs the one and only local post-commit state update.
   *
   * @param {object} gitContextItem
   * Filesystem root/context item.
   *
   * @param {object} gitInfo
   * Git metadata.
   *
   * @param {string} newCommitSHA
   * New remote commit SHA.
   *
   * @param {object[]} processedFiles
   * Uploaded creations/updates.
   *
   * @param {object[]} processedDeletions
   * Deleted files.
   *
   * @param {object[]} treeItems
   * Git tree items.
   *
   * @returns {Promise&lt;void&gt;}
   * Resolves after state is updated.
   */
  async saveFinal(
    gitContextItem,
    gitInfo,
    newCommitSHA,
    processedFiles = [],
    processedDeletions = [],
    treeItems = []
  ) {
    const context = normalizeCommitContext(gitContextItem, gitInfo);

    gitInfo.baseCommitSHA = newCommitSHA;
    if (!gitInfo.remoteTree) gitInfo.remoteTree = [];

    const treeMap = new Map(gitInfo.remoteTree.map(item => [item.path, item]));
    const committedTreeMap = new Map();

    treeItems.forEach(newItem => {
      if (newItem.sha === null) {
        treeMap.delete(newItem.path);
      } else {
        const itemData = {
          path: newItem.path,
          mode: newItem.mode || '100644',
          type: newItem.type || 'blob',
          sha: newItem.sha
        };

        treeMap.set(newItem.path, itemData);
        committedTreeMap.set(newItem.path, itemData);
      }
    });

    gitInfo.remoteTree = Array.from(treeMap.values());

    if (shouldWriteLocalAnchor(context)) {
      await MetadataRituals.updateLocalAnchor(context, gitInfo, newCommitSHA);
    }

    const workspaceId = context.workspaceId || context.id || context.path;

    await this.clearUncommitted(
      workspaceId,
      {
        creations: processedFiles,
        updates: [],
        deletions: processedDeletions
      },
      committedTreeMap
    );
  },

  /**
   * @async
   * @function clearUncommitted
   * @description
   * B"H.
   *
   * Clears local uncommitted markers and refreshes open tabs.
   *
   * @param {string} workspaceId
   * Workspace identifier.
   *
   * @param {object} changeSet
   * Processed changes.
   *
   * @param {Map&lt;string, object&gt;} committedTreeMap
   * Map of committed path to tree item.
   *
   * @returns {Promise&lt;void&gt;}
   * Resolves after cleanup.
   */
  async clearUncommitted(workspaceId, changeSet, committedTreeMap) {
    const all = [
      ...(changeSet.creations || []),
      ...(changeSet.updates || []),
      ...(changeSet.deletions || [])
    ];

    await Promise.all(all.map(async (change) => {
      const relPath = change.path;
      const uniquePath = `${workspaceId}::${relPath}`;

      const tab = State.tabs.find(t => (
        t.item &&
        typeof t.item.path === "string" &&
        t.item.path.includes(relPath) &&
        t.item.workspaceId === workspaceId
      ));

      if (tab && committedTreeMap.has(relPath)) {
        tab.isDirty = false;
        tab.isUncommitted = false;
        tab.item.sha = committedTreeMap.get(relPath).sha;
      }

      return FileSystemProvider.IndexedDB.deleteUncommitted(uniquePath);
    }));

    import('../../tabs/index.js').then(m => m.Tabs.render());
  }
};