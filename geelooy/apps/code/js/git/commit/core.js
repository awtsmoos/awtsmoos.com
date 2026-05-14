// B"H

import { FileSystemProvider } from '../../fs-provider.js';
import { UI } from '../../ui.js';
import { CommitAPI } from './api.js';
import { CommitState } from './state.js';
import {
  normalizeCommitContext,
  normalizeChangeSet,
  assertNonEmptyChangeSet,
  countChangeSet
} from './commit-context.js';

/**
 * @file core.js
 * @description
 * B"H.
 *
 * The Git commit heart.
 *
 * Old behavior:
 * - upload a chunk
 * - push a commit
 * - update local anchor
 * - repeat
 *
 * That meant a failure in the middle could leave GitHub ahead, the local
 * anchor broken, and the agent UI screaming.
 *
 * New behavior:
 * - validate context before any upload
 * - upload every blob first
 * - build one complete tree item list
 * - create one remote commit only after all files are ready
 * - update local state once after success
 *
 * This obeys the rule:
 * push to GitHub only when the AI has fully finished every file.
 */

const DEFAULT_UPLOAD_CHUNK = 10;

/**
 * @function fileLeaf
 * @description
 * B"H.
 *
 * Extracts a readable leaf name for progress UI.
 *
 * @param {string} path
 * File path.
 *
 * @returns {string}
 * Leaf file name.
 */
function fileLeaf(path) {
  return String(path || "").split("/").filter(Boolean).pop() || String(path || "file");
}

/**
 * @function progressOf
 * @description
 * B"H.
 *
 * Computes safe progress percentage.
 *
 * @param {number} done
 * Completed units.
 *
 * @param {number} total
 * Total units.
 *
 * @returns {number}
 * Progress percentage.
 */
function progressOf(done, total) {
  if (!total) return 100;
  return Math.max(0, Math.min(100, (done / total) * 100));
}

/**
 * @function buildDeletionItems
 * @description
 * B"H.
 *
 * Converts deletion records into Git tree deletion entries.
 *
 * @param {object[]} deletions
 * Deletion changes.
 *
 * @returns {object[]}
 * Git tree deletion items.
 */
function buildDeletionItems(deletions) {
  return deletions.map(d => ({
    path: d.path,
    mode: '100644',
    type: 'blob',
    sha: null
  }));
}

/**
 * @constant {object} GitCommit
 * @description
 * B"H.
 *
 * The public Git commit orchestrator.
 */
export const GitCommit = {
  /**
   * @async
   * @function performCommit
   * @description
   * B"H.
   *
   * Performs one complete GitHub commit after every changed file is uploaded.
   *
   * @param {object} gitContextItem
   * Filesystem context/root item.
   *
   * @param {object} gitInfo
   * Git metadata containing repoInfo and branch.
   *
   * @param {object} changeSet
   * Staged creations, updates, and deletions.
   *
   * @param {string} commitMessage
   * Commit message.
   *
   * @param {object} [options]
   * Commit options.
   *
   * @param {boolean} [options.force=false]
   * Whether to force from null current SHA.
   *
   * @param {number} [options.uploadChunkSize=10]
   * Upload chunk size for blob creation only. This does not create multiple commits.
   *
   * @param {Function} [options.onPhase]
   * Optional agent/timeline phase callback.
   *
   * @returns {Promise&lt;string&gt;}
   * New commit SHA.
   */
  async performCommit(gitContextItem, gitInfo, changeSet, commitMessage, options = {}) {
    const context = normalizeCommitContext(gitContextItem, gitInfo);
    const normalizedChangeSet = assertNonEmptyChangeSet(normalizeChangeSet(changeSet));
    const { repoInfo, branch } = gitInfo;

    const taskId = `commit-${Date.now()}`;
    const uploads = [
      ...(normalizedChangeSet.creations || []),
      ...(normalizedChangeSet.updates || [])
    ];
    const deletions = normalizedChangeSet.deletions || [];
    const totalFiles = countChangeSet(normalizedChangeSet);
    const uploadChunkSize = options.uploadChunkSize || DEFAULT_UPLOAD_CHUNK;
    const onPhase = typeof options.onPhase === "function" ? options.onPhase : null;

    const emitPhase = (phase) => {
      if (onPhase) onPhase(phase);
    };

    UI.startTask(taskId, `Preparing complete GitHub manifestation...`);
    emitPhase({
      type: "commit.prepare",
      label: "Preparing complete GitHub commit",
      collapsed: true,
      totalFiles
    });

    try {
      let currentSHA = options.force
        ? null
        : await FileSystemProvider.GitHub.getLatestCommitSHA({ repoInfo, branch });

      const uploadedItems = [];
      let uploadedCount = 0;

      for (let i = 0; i < uploads.length; i += uploadChunkSize) {
        const chunk = uploads.slice(i, i + uploadChunkSize);
        const chunkNum = Math.floor(i / uploadChunkSize) + 1;

        emitPhase({
          type: "commit.uploadChunk",
          label: `Uploading file batch ${chunkNum}`,
          collapsed: true,
          files: chunk.map(file => file.path)
        });

        const items = await CommitAPI.uploadBlobs(repoInfo, chunk, (fileName) => {
          uploadedCount += 1;

          UI.updateTask(
            taskId,
            progressOf(uploadedCount, totalFiles) * 0.85,
            `[${chunkNum}] Prepared blob: ${fileLeaf(fileName)}`
          );

          emitPhase({
            type: "commit.uploadFile",
            label: `Prepared ${fileName}`,
            collapsed: true,
            file: fileName,
            progress: progressOf(uploadedCount, totalFiles)
          });
        });

        uploadedItems.push(...items);
      }

      const deletionItems = buildDeletionItems(deletions);
      const allTreeItems = [...uploadedItems, ...deletionItems];

      if (deletions.length) {
        emitPhase({
          type: "commit.deletionsPrepared",
          label: `Prepared ${deletions.length} deletion(s)`,
          collapsed: true,
          files: deletions.map(file => file.path)
        });
      }

      UI.updateTask(taskId, 90, `Creating one complete remote commit...`);
      emitPhase({
        type: "commit.remoteStart",
        label: "Creating one complete GitHub commit",
        collapsed: true,
        files: allTreeItems.map(item => item.path)
      });

      currentSHA = await CommitAPI.executeCommit(
        repoInfo,
        branch,
        currentSHA,
        allTreeItems,
        commitMessage,
        options.force
      );

      UI.updateTask(taskId, 96, `Updating local anchor...`);
      emitPhase({
        type: "commit.localAnchor",
        label: "Updating local repository anchor",
        collapsed: true,
        sha: currentSHA
      });

      await CommitState.saveFinal(
        context,
        gitInfo,
        currentSHA,
        uploads,
        deletions,
        allTreeItems
      );

      UI.endTask(taskId, 'success', 'B"H: Manifestation Complete.');
      emitPhase({
        type: "commit.done",
        label: "Commit complete",
        collapsed: true,
        sha: currentSHA
      });

      return currentSHA;
    } catch (e) {
      UI.endTask(taskId, 'error', `Manifestation Blocked: ${e.message}`);
      emitPhase({
        type: "commit.error",
        label: `Commit blocked: ${e.message}`,
        collapsed: false,
        error: {
          message: e.message,
          stack: e.stack
        }
      });
      throw e;
    }
  }
};